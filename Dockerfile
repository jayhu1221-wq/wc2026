FROM node:20-alpine

WORKDIR /app

# Copy all static assets
COPY *.html *.css *.js ./

EXPOSE 3000

CMD ["node", "server.js"]
