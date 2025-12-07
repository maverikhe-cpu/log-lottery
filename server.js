import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, statSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = '/log-lottery';
const DIST_DIR = join(__dirname, 'dist');

// 静态文件服务 - 将 /log-lottery/xxx 映射到 dist/xxx
// 例如: /log-lottery/js/chunk.js -> dist/js/chunk.js
app.use(`${BASE_PATH}`, (req, res, next) => {
  // 移除 BASE_PATH 前缀，获取实际文件路径
  let filePath = req.path.replace(BASE_PATH, '') || '/';
  // 移除开头的斜杠（如果存在）
  if (filePath.startsWith('/')) {
    filePath = filePath.substring(1);
  }
  
  const actualPath = join(DIST_DIR, filePath);
  
  // 检查文件是否存在
  if (existsSync(actualPath)) {
    const stats = statSync(actualPath);
    if (stats.isFile()) {
      // 是文件，直接返回
      return res.sendFile(actualPath);
    }
  }
  
  // 不是文件或不存在，继续处理（可能是 SPA 路由）
  next();
});

// 处理 SPA 路由 - 所有非静态资源请求都返回 index.html
app.get(`${BASE_PATH}/*`, (req, res) => {
  // 如果是静态资源文件扩展名，返回 404（应该已经被上面的中间件处理了）
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|gz)$/)) {
    return res.status(404).send('File not found');
  }
  
  // 返回 index.html 用于 SPA 路由
  try {
    const indexPath = join(DIST_DIR, 'index.html');
    if (!existsSync(indexPath)) {
      return res.status(500).send('index.html not found');
    }
    const html = readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Error loading index.html:', error);
    res.status(500).send('Error loading index.html');
  }
});

// 根路径重定向到 /log-lottery
app.get('/', (req, res) => {
  res.redirect(BASE_PATH + '/');
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}${BASE_PATH}`);
  console.log(`Health check: http://0.0.0.0:${PORT}/health`);
});

