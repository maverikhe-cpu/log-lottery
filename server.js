import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_PATH = '/log-lottery';
const DIST_DIR = join(__dirname, 'dist');

// 静态文件服务 - 处理 /log-lottery/ 路径下的所有静态资源
app.use(`${BASE_PATH}`, express.static(DIST_DIR, {
  index: false, // 禁用默认的 index.html 处理
}));

// 处理 SPA 路由 - 所有非静态资源请求都返回 index.html
app.get(`${BASE_PATH}/*`, (req, res) => {
  const filePath = join(DIST_DIR, req.path.replace(BASE_PATH, ''));
  
  // 如果是静态资源文件且存在，express.static 已经处理了
  // 这里只处理 HTML 路由
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|json|gz)$/)) {
    // 静态资源应该已经被 express.static 处理了
    // 如果到这里说明文件不存在，返回 404
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

