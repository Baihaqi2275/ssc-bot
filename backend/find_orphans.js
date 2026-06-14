const fs = require('fs');
const path = require('path');

function walk(dir, extFilter) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) {
      continue;
    }
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath, extFilter));
    } else {
      if (extFilter.some(ext => fullPath.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

const backendSrc = 'C:\\laragon\\www\\ssc-bot\\backend\\src';
const frontendSrc = 'C:\\laragon\\www\\ssc-bot\\frontend\\src';

const backendFiles = walk(backendSrc, ['.ts']);
const frontendFiles = walk(frontendSrc, ['.ts', '.tsx']);

function checkOrphans(files, entryPoint, rootSrc) {
  const orphans = [];
  for (const file of files) {
    if (file === entryPoint) continue;
    
    // Convert path to import string format, e.g., "utils/adminIntent"
    let relative = path.relative(rootSrc, file).replace(/\\/g, '/');
    let basename = path.basename(relative, path.extname(relative));
    
    // Just search all files for the basename
    let isImported = false;
    for (const otherFile of files) {
      if (file === otherFile) continue;
      const content = fs.readFileSync(otherFile, 'utf8');
      if (content.includes(basename)) {
        isImported = true;
        break;
      }
    }
    
    if (!isImported) {
      orphans.push(file);
    }
  }
  return orphans;
}

console.log("Backend Orphans:", checkOrphans(backendFiles, path.join(backendSrc, 'server.ts'), backendSrc));
console.log("Frontend Orphans:", checkOrphans(frontendFiles, path.join(frontendSrc, 'main.tsx'), frontendSrc));
