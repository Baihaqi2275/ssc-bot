const fs = require('fs');
const path = require('path');

const root = 'C:\\laragon\\www\\ssc-bot';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else {
      const name = path.basename(fullPath);
      if (
        (name.startsWith('test_') ||
        name.startsWith('verify_') ||
        name.startsWith('benchmark_') ||
        name.startsWith('measure_') ||
        name.startsWith('debug_') ||
        name.startsWith('run_import')) && (name.endsWith('.ts') || name.endsWith('.js'))
      ) {
        results.push(fullPath);
      } else if (name.endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const files = walk(root);
for (const f of files) {
  console.log(f);
}
