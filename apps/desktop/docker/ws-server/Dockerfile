# 使用官方 Node.js 运行时作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 运行 npm init -y 自动生成 package.json
RUN npm init -y

# 安装 TypeScript 及相关依赖
RUN npm install typescript ts-node ws crypto

cp ../../src/electron/ws-server/main.ts ./
cp ../../src/electron/ws-server/server.ts ./
# 复制当前目录所有文件到容器内
COPY ./main.ts ./
COPY ./server.ts ./

# 运行 TypeScript 编译
RUN npx tsc --init
RUN npx tsc

# 启动 main.ts
CMD ["node", "main.js"]

# docker build -t ctl-server .
# docker run -d --name ctl-server -p 6788:6788 ctl-server