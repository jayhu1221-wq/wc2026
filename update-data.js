// update-data.js — Update data.js with latest match results from live-scores.json
const fs = require('fs');
const path = require('path');

const liveData = require('./live-scores.json');

// Team name mapping: API name -> data.js name
const nameMap = {
  'Korea Republic': 'South Korea',
  'Czechia': 'Czech Republic',
  'Bosnia-H.': 'Bosnia',
  'Curaçao': 'Curacao',
  'Congo DR': 'DR Congo',
};
function mapName(n) { return nameMap[n] || n; }
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Read current data.js
let content = fs.readFileSync('data.js', 'utf-8');

// Find section boundaries
const compStart = content.indexOf('completedResults: [');
const compEnd = content.indexOf('  ],', compStart);
const upcomingStart = content.indexOf('upcomingMatches: [', compEnd);
const upcomingEnd = content.indexOf('  ],', upcomingStart);

// Parse the finished matches from API
const finished = liveData.matches.filter(m => m.status === 'FINISHED');
const inPlay = liveData.matches.filter(m => ['IN_PLAY','PAUSED','LIVE'].includes(m.status));

// Get existing completed home/away pairs
const existingComp = new Set();
const compSection = content.substring(compStart, compEnd);
const compMatches = compSection.match(/\{[^}]+\}/g) || [];
compMatches.forEach(m => {
  const homeMatch = m.match(/home:"([^"]+)"/);
  const awayMatch = m.match(/away:"([^"]+)"/);
  if (homeMatch && awayMatch) {
    existingComp.add(homeMatch[1] + '|' + awayMatch[1]);
    existingComp.add(awayMatch[1] + '|' + homeMatch[1]); // both orders
  }
});

console.log('Existing completed matches:', compMatches.length);

// Find new completed matches not in existing
const newCompleted = [];
const upSection = content.substring(upcomingStart, upcomingEnd);

for (const m of finished) {
  const home = mapName(m.homeTeam);
  const away = mapName(m.awayTeam);
  const hg = m.score.fullTime.home;
  const ag = m.score.fullTime.away;

  // Check if already in completedResults (either order)
  if (existingComp.has(home + '|' + away)) continue;

  // Try to find in upcomingMatches to get group, venue, time
  const pattern1 = new RegExp('home:"' + escapeRegex(home) + '"[^}]*away:"' + escapeRegex(away) + '"');
  const pattern2 = new RegExp('home:"' + escapeRegex(away) + '"[^}]*away:"' + escapeRegex(home) + '"');

  let matchText = upSection.match(pattern1);
  let isSwapped = false;
  if (!matchText) {
    matchText = upSection.match(pattern2);
    isSwapped = true;
  }

  let group = '?', venue = '?', date = '?', time = '?';
  let actualHg = hg, actualAg = ag;

  if (matchText) {
    const fullMatch = matchText[0];
    const gMatch = fullMatch.match(/group:"([^"]+)"/);
    const vMatch = fullMatch.match(/venue:"([^"]+)"/);
    const dMatch = fullMatch.match(/date:"([^"]+)"/);
    const tMatch = fullMatch.match(/time:"([^"]+)"/);
    if (gMatch) group = gMatch[1];
    if (vMatch) venue = vMatch[1];
    if (dMatch) date = dMatch[1];
    if (tMatch) time = tMatch[1];
    if (isSwapped) { actualHg = ag; actualAg = hg; }
  } else {
    // Use API date/time
    const d = new Date(m.utcDate);
    const bj = new Date(d.getTime() + 8*3600000);
    date = (bj.getMonth()+1) + '\u6708' + bj.getDate() + '\u65e5';
    time = String(bj.getHours()).padStart(2,'0') + ':' + String(bj.getMinutes()).padStart(2,'0');
  }

  newCompleted.push({
    date, time, group,
    home: isSwapped ? away : home,
    away: isSwapped ? home : away,
    hg: actualHg, ag: actualAg, venue
  });
}

console.log('New completed matches to add:', newCompleted.length);
newCompleted.forEach(m => console.log('  ' + m.date + ' ' + m.home + ' ' + m.hg + '-' + m.ag + ' ' + m.away + ' (' + m.group + ')'));

// Build new completed results entries
const newCompEntries = newCompleted.map(m =>
  '    { date:"' + m.date + '", time:"' + m.time + '", group:"' + m.group + '", home:"' + m.home + '", away:"' + m.away + '", hg:' + m.hg + ', ag:' + m.ag + ', venue:"' + m.venue + '" }'
).join(',\n');

// Insert new completed entries before the closing ']' of completedResults
const compInsertPos = content.lastIndexOf('  ],', compEnd);
let updatedContent = content.substring(0, compInsertPos) + newCompEntries + ',\n' + content.substring(compInsertPos);

// Now remove completed matches from upcomingMatches
// Re-find boundaries since content changed
const newUpcomingStart = updatedContent.indexOf('upcomingMatches: [');
const newUpcomingEnd = updatedContent.indexOf('  ],', newUpcomingStart);

// Remove each completed match line from upcomingMatches
let upcomingSection = updatedContent.substring(newUpcomingStart, newUpcomingEnd);

for (const m of finished) {
  const home = mapName(m.homeTeam);
  const away = mapName(m.awayTeam);

  // Remove lines matching this match (either order)
  const lines = upcomingSection.split('\n');
  const filtered = lines.filter(line => {
    const hasHome1 = line.includes('home:"' + home + '"');
    const hasAway1 = line.includes('away:"' + away + '"');
    const hasHome2 = line.includes('home:"' + away + '"');
    const hasAway2 = line.includes('away:"' + home + '"');
    return !((hasHome1 && hasAway1) || (hasHome2 && hasAway2));
  });
  upcomingSection = filtered.join('\n');
}

// Update Jordan vs Algeria with live score
const inPlayMatch = inPlay[0];
if (inPlayMatch) {
  const ipHome = mapName(inPlayMatch.homeTeam);
  const ipAway = mapName(inPlayMatch.awayTeam);
  const ipHg = inPlayMatch.score.fullTime.home ?? inPlayMatch.score.halfTime.home ?? 0;
  const ipAg = inPlayMatch.score.fullTime.away ?? inPlayMatch.score.halfTime.away ?? 0;

  // Replace the Jordan vs Algeria line
  const oldLine = new RegExp('// June 23\\n.*' + escapeRegex(ipHome) + '.*' + escapeRegex(ipAway) + '[^}]*\\}', '');
  // Simpler: just replace the specific entry
  upcomingSection = upcomingSection.replace(
    /(\{ date:"6\u670823\u65e5", time:"11:00", group:"J", home:"Jordan", away:"Algeria", venue:"[^"]*"\})/,
    '{ date:"6\u670823\u65e5", time:"11:00", group:"J", home:"Jordan", away:"Algeria", venue:"\u65e7\u91d1\u5c71\u6e7e\u533a\u4f53\u80b2\u573a", liveScore:{hg:' + ipHg + ',ag:' + ipAg + ',min:"--"}, status:"live" }'
  );
}

// Rebuild the full content
updatedContent = updatedContent.substring(0, newUpcomingStart) + upcomingSection + updatedContent.substring(newUpcomingEnd);

// Write the updated file
fs.writeFileSync('data.js', updatedContent, 'utf-8');
console.log('\n✅ data.js updated successfully!');

// Verify
const verifyContent = fs.readFileSync('data.js', 'utf-8');
const verifyComp = (verifyContent.match(/home:"[^"]+", away:"[^"]+", hg:/g) || []).length;
const verifyUp = (verifyContent.substring(verifyContent.indexOf('upcomingMatches')).match(/home:"[^"]+", away:"[^"]+"/g) || []).length;
console.log('Completed results entries:', verifyComp);
console.log('Upcoming matches entries:', verifyUp);
