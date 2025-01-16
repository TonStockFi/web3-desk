# Base image with Nginx and RTMP module
FROM alfg/nginx-rtmp:latest

# Expose RTMP and HTTP ports
EXPOSE 1935 80

# Copy custom nginx config (optional)
COPY nginx.conf /etc/nginx/nginx.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


# Build the Docker image
# docker build -t nginx-rtmp .

# Run the container
# docker run -d --name rtmp-server -p 1935:1935 -p 80:80 nginx-rtmp