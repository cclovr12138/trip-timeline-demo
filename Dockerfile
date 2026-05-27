FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
RUN find /usr/share/nginx/html -type f -exec chmod 644 {} \;
EXPOSE 80