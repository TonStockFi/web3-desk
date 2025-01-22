
# docker network create web3r_network

cd /root/web3-desk/apps/docker/nginx-server
git pull origin main 

docker rm -f nginx-server
docker build -t nginx-server .


# docker run --network web3r_network \
#     -d \
#     -v $(pwd)/data:/usr/local/nginx/html \
#     --name nginx-server \
#     -p 80:80 -p 1935:1935 \
#     nginx

docker run --network web3r_network \
    -v $(pwd)/data:/usr/local/nginx/html \
    --name nginx-server \
    -p 80:80 -p 1935:1935 \
    nginx
