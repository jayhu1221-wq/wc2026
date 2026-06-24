FROM node:20-alpine

# Install serve (lightweight static file server that auto-detects $PORT)
RUN npm install -g serve@14

WORKDIR /app

COPY *.html *.css *.js ./

CMD ["serve", "-l", "3000", "."]
