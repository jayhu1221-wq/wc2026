FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Create custom config with health endpoint
RUN echo 'server { \
  listen 3000; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  \
  # Health check endpoint for Railway \
  location = /health { \
    access_log off; \
    return 200 "{\"status\":\"ok\"}"; \
    add_header Content-Type application/json; \
  } \
  \
  # Main app routing \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
  \
  # Static assets with cache headers \
  location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$ { \
    expires 1y; \
    add_header Cache-Control "public, immutable"; \
  } \
}' > /etc/nginx/conf.d/default.conf

# Copy static files
COPY *.html *.css *.js /usr/share/nginx/html/

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
