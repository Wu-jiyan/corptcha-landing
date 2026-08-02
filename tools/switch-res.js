import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const file = join(import.meta.dirname, '..', 'index.html');
const mode = process.argv[2];
const CDN = '//res.25y.cn/corptcha/landing/';

if (mode !== 'local' && mode !== 'cdn') {
  console.error('用法: node tools/switch-res.js <local|cdn>');
  process.exit(1);
}

let html = readFileSync(file, 'utf8');

const pairs = [
  ['href="', 'css/'],
  ['src="', 'js/'],
  ['src="', 'vendor/'],
  ['href="', 'assets/'],
  ['src="', 'assets/'],
];

for (const [prefix, rel] of pairs) {
  const local = prefix + rel;
  const remote = prefix + CDN + rel;
  if (mode === 'local') {
    html = html.split(remote).join(local);
  } else {
    html = html.split(local).join(remote);
  }
}

writeFileSync(file, html);
console.log('index.html 资源引用已切换为: ' + (mode === 'local' ? '本地相对路径' : '资源站 ' + CDN));
