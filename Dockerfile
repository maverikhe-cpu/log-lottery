# 使用官方的 Node 镜像作为基础镜像
FROM node:20.12.2

# 设置工作目录
WORKDIR /usr/src/app

# 将本地的 Vite 项目文件复制到工作目录
COPY . .

# 安装依赖

RUN npm install pnpm -g

RUN pnpm install

# 执行 Vite 构建命令，生成 dist 目录
RUN pnpm build

# 使用 Nginx 镜像作为运行时镜像
FROM nginx:1.26

# 安装 envsubst 用于替换环境变量
RUN apt-get update && apt-get install -y gettext-base && rm -rf /var/lib/apt/lists/*

# 复制自定义 nginx 配置文件到模板目录
COPY nginx.conf /etc/nginx/templates/default.conf.template

# 将 Vite 项目的 dist 目录复制到 Nginx 的默认静态文件目录
COPY --from=0 /usr/src/app/dist /usr/share/nginx/log-lottery

# 暴露端口（zeabur 会通过环境变量 PORT 指定，默认 80）
EXPOSE 80

# 设置默认 PORT 环境变量，使用 envsubst 替换环境变量并启动 nginx
CMD ["/bin/sh", "-c", "export PORT=${PORT:-80} && envsubst '$$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
