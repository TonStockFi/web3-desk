# 使用官方 Node.js 运行时作为基础镜像
FROM node:18

EXPOSE 6788
# 设置工作目录
WORKDIR /app

# 运行 npm init -y 自动生成 package.json
RUN npm init -y
# RUN apt-get update && apt-get install -y ffmpeg

# 安装 TypeScript 及相关依赖
RUN npm install typescript ts-node ws uuid

# 复制当前目录所有文件到容器内
COPY ./main.ts .
COPY ./server.ts .
COPY ./BufferProcessor.ts .

# 运行 TypeScript 编译
RUN npx tsc --init

RUN npx tsc

# 启动 main.ts
CMD ["node", "main.js"]
