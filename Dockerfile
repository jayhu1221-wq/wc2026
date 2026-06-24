FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Create custom config
RUN echo 'server { \
  listen 3000; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Copy static files
COPY *.html *.css *.js /usr/share/nginx/html/

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
