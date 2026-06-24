FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Write config template with $PORT placeholder
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Copy static files
COPY *.html *.css *.js /usr/share/nginx/html/

# Redirect logs to stdout/stderr
RUN ln -sf /dev/stdout /var/log/nginx/access.log && \
    ln -sf /dev/stderr /var/log/nginx/error.log

# Use envsubst to replace $PORT at runtime, then start nginx
CMD ["sh", "-c", "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
