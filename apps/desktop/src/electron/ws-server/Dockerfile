# 使用官方 Node.js 运行时作为基础镜像
FROM node:18

# 设置工作目录
WORKDIR /app

# 运行 npm init -y 自动生成 package.json
RUN npm init -y

# 安装 TypeScript 及相关依赖
RUN npm install typescript ts-node ws

# 复制当前目录所有文件到容器内
COPY ./main.ts ./
COPY ./server.ts ./

# 运行 TypeScript 编译
RUN npx tsc --init
RUN npx tsc

# 启动 main.ts
CMD ["node", "dist/main.js"]

# docker build -t my-ts-server .
# docker run -p 443:6788 my-ts-server