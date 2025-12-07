# 使用官方的 Node 镜像作为基础镜像
FROM node:20.12.2

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install pnpm -g

# 安装依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 执行 Vite 构建命令，生成 dist 目录
RUN pnpm build

# 暴露端口（zeabur 会通过环境变量 PORT 指定）
EXPOSE 3000

# 启动 Node.js 服务器
CMD ["node", "server.js"]
