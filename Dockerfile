FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Write custom nginx config - use heredoc via COPY instead
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY *.html *.css *.js /usr/share/nginx/html/

# Ensure nginx logs go to stdout/stderr (Railway requirement)
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

EXPOSE 3000

# Start nginx in foreground with explicit error handling
CMD ["sh", "-c", "nginx -t && exec nginx -g 'daemon off;'"]
