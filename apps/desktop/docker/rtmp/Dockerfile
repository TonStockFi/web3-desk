# Base image with Nginx and RTMP module
FROM alfg/nginx-rtmp:latest

# Expose  HTTP ports
EXPOSE 80

RUN mkdir -p /var/log/nginx && chmod 755 /var/log/nginx

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# docker network create web3r_network

# Build the Docker image
# docker build -t nginx-rtmp .

# Run the container
# docker run --network web3r_network -d --name rtmp-server -p 80:80 nginx-rtmp
# docker run --network web3r_network --name rtmp-server -p 80:80 nginx-rtmp