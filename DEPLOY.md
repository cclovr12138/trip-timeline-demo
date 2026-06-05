# DEPLOY.md - 部署文档（trip-timeline-demo）

> 适用于本项目 `trip-timeline-demo` 的部署、运维、故障排查。
> 完整指南见 [`~/.openclaw/workspace/memory/deployment-guide.md`](file:///Users/cclovr/.openclaw/workspace/memory/deployment-guide.md)。

---

## 快速部署

```bash
cd ~/codeProject/trip-timeline-demo

# 1. 代码提交并推送
git add .
git commit -m "feat: 描述"
git push origin feature/xxx

# 2. 构建 + 部署
npm run build
docker build -t trip-timeline:latest .
docker stop timeline && docker rm timeline
docker run -d --name timeline -p 3002:80 \
  --network trip-network \
  --restart unless-stopped \
  trip-timeline:latest

# 3. 验证
curl -sS -o /dev/null -w "HTTP %{http_code}\n" https://timeline.cclovr.top/
```

⚠️ **必须带 `--network trip-network`**，否则公网 502（cloudflared 解析不到 `timeline` 容器）。

---

## 项目信息

- **公网域名**：https://timeline.cclovr.top
- **宿主机端口**：3002 → 容器 80
- **镜像名**：`trip-timeline:latest`
- **容器名**：`timeline`
- **Docker 网络**：`trip-network`（必须与 `cloudflare-tunnel` 共享）

## 项目结构

```
trip-timeline-demo/
├── Dockerfile          # nginx:alpine, COPY dist/
├── nginx.conf          # SPA 配置（备用，当前 Dockerfile 用默认 nginx）
├── package.json        # build: vite build
├── src/                # 源码
├── dist/               # 构建产物（gitignore）
└── DEPLOY.md           # ← 本文件
```

## Dockerfile 说明

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
RUN chmod -R a+rX /usr/share/nginx/html
EXPOSE 80
```

- 基于 `nginx:alpine`，单页应用静态托管
- `chmod -R a+rX` 确保 nginx 进程能读取所有文件（修复过"目录权限 700 导致 403"的问题）
- 当前**没有 COPY 自定义 nginx.conf**，用的是 nginx:alpine 默认配置（满足 `try_files` SPA 路由需求）

## Cloudflare Tunnel 配置

公网域名 `timeline.cclovr.top` 通过 Cloudflare Tunnel `ccGroup` 转发到本地 `http://timeline:80`（容器名解析）。

修改路由：
1. 登录 https://dash.cloudflare.com
2. Zero Trust → Networks → Tunnels → `ccGroup`
3. Public Hostname → 添加/编辑
4. Subdomain: `timeline`、Domain: `cclovr.top`、Type: `HTTP`、URL: `timeline:80`

## 常见问题

### Q: 部署后 502 怎么排查？
A: `docker logs --tail 20 cloudflare-tunnel` 看错误信息。
- `lookup timeline ... no such host` → 容器不在 trip-network → `docker network connect trip-network timeline`
- 其他错误 → 见完整指南的故障排查章节

### Q: 容器内部怎么调试？
```bash
docker exec -it timeline sh
# 容器内
wget -q -O- http://localhost/    # 测试 nginx
ls /usr/share/nginx/html/        # 看静态文件
```

### Q: 镜像清理？
```bash
docker images | grep trip-timeline
docker rmi <image-id>   # 删除旧镜像
```

## 修改记录
- 2026-06-05：初版（踩了 docker 网络 502 的坑，写下完整流程）
