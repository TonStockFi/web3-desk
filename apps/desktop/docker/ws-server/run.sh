cd /root/projects/web3-desk/apps/desktop/docker/ws-server
git pull origin main 
cp ../../src/electron/ws-server/server.ts ./
cp ../../src/electron/ws-server/BufferProcessor.ts ./
# cp ../../src/electron/ws-server/main.ts ./


docker rm -f ctl-server
docker build -t ctl-server .
# docker run --network web3r_network -d --name ctl-server -p 6788:6788 ctl-server
docker run --network web3r_network --name ctl-server -p 6788:6788 ctl-server

