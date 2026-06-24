FROM node:20-alpine

WORKDIR /app

COPY *.html *.css *.js ./

# serve defaults to 5000, but we need $PORT from Railway
# Use shell form so $PORT gets expanded
CMD npx serve -l ${PORT:-3000} .
