FROM alfg/nginx-rtmp:latest

# Expose  HTTP ports
EXPOSE 80

RUN mkdir -p /var/log/nginx && chmod 755 /var/log/nginx

# Copy custom nginx config (optional)
COPY web3r.conf /etc/nginx/conf.d/web3r.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

