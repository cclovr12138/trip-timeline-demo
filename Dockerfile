FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
# 目录需要 755（可进入），文件 644（可读）；原版只 chmod 文件导致目录仍是 700
# a+rX: 给所有人加读权限 + 仅对目录/已有 x 位的文件加执行权限
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
