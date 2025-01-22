# Base image with Nginx and RTMP module
FROM alfg/nginx-rtmp:latest

# Expose  HTTP ports
EXPOSE 80 1935

RUN mkdir -p /var/log/nginx && chmod 755 /var/log/nginx

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

