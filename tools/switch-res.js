import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dirname, '..');
const files = ['zh/index.html', 'en/index.html'];
const mode = process.argv[2];
const version = process.argv[3] || '1';
const CDN = '//res.25y.cn/corptcha/landing/';

if (mode !== 'local' && mode !== 'cdn') {
  console.error('用法: node tools/switch-res.js <local|cdn> [版本号]');
  process.exit(1);
}

for (const rel of files) {
  const file = join(root, rel);
  let html = readFileSync(file, 'utf8');

  // 归一化：去掉 ../ 前缀、CDN 前缀与 ?v= 参数
  html = html.replace(/((?:href|src)=")(?:\.\.\/)?(?:res\.25y\.cn\/corptcha\/landing\/)?(css|js|assets|vendor)\/([^"?]+)(?:\?v=[^"]*)?(")/g, '$1$2/$3$4');

  if (mode === 'cdn') {
    html = html.replace(/((?:href|src)=")(css|js|assets|vendor)\/([^"]+)/g, '$1' + CDN + '$2/$3?v=' + version);
  } else {
    html = html.replace(/((?:href|src)=")(css|js|assets|vendor)\//g, '$1../$2/');
  }

  writeFileSync(file, html);
  console.log(rel + ' -> ' + (mode === 'local' ? '本地 ../' : CDN + ' (v' + version + ')'));
}
