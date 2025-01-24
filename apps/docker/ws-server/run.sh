cd /root/web3-desk/apps/docker/ws-server
git pull origin main 
cp ../../desktop/src/electron/ws-server/server.ts ./
# cp ../../desktop//src/electron/ws-server/main.ts ./


docker rm -f ctl-server
docker build -t ctl-server .
docker run --network web3r_network -d --name ctl-server -p 6788:6788 ctl-server
# docker run --network web3r_network --name ctl-server -p 6788:6788 ctl-server

