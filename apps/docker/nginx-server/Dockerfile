# Use official NGINX image as a base
FROM nginx:alpine

# Copy your custom nginx.conf file to the NGINX configuration directory
COPY nginx.conf /etc/nginx/nginx.conf

# Copy your web app's static files to the appropriate directory inside the container
COPY ./data/ /usr/share/nginx/html/

# Expose port 80 for HTTP access
EXPOSE 80

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]
