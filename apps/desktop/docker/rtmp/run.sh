
# docker network create web3r_network

cd /root/web3-desk/apps/desktop/docker/rtmp
git pull origin main 

docker rm -f rtmp-server
docker build -t rtmp-server .

# docker run --network web3r_network -d --name rtmp-server -p 80:80 -p 1935:1935 rtmp-server
docker run --network web3r_network --name rtmp-server -p 80:80 -p 1935:1935 rtmp-server
