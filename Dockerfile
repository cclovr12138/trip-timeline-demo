FROM nginx:alpine
# 覆盖 nginx 主配置：项目里的 nginx.conf 是完整主配置（含 user/events/http 块），
# COPY 到 /etc/nginx/nginx.conf，加上 try_files 兜底，
# 避免 SPA history 模式刷新子路由（如 /add-trip）出现 nginx 404
COPY nginx.conf /etc/nginx/nginx.conf
COPY dist/ /usr/share/nginx/html/
# 目录需要 755（可进入），文件 644（可读）；原版只 chmod 文件导致目录仍是 700
# a+rX: 给所有人加读权限 + 仅对目录/已有 x 位的文件加执行权限
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
