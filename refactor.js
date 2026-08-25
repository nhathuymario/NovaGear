const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  let needsToast = false;
  let needsConfirm = false;

  // Replace alert
  content = content.replace(/alert\(([\s\S]*?)\)/g, (match, p1) => {
    needsToast = true;
    const lower = p1.toLowerCase();
    if (lower.includes('thành công') || (lower.includes('đã') && !lower.includes('lỗi'))) {
      return `toast.success(${p1})`;
    } else if (lower.includes('thất bại') || lower.includes('lỗi') || lower.includes('không') || lower.includes('vui lòng') || lower.includes('trống')) {
      return `toast.error(${p1})`;
    } else {
      return `toast.info(${p1})`;
    }
  });

  // Replace confirm
  if (content.includes('window.confirm(') || content.includes('globalThis.confirm(')) {
    needsConfirm = true;
    content = content.replace(/(?:window|globalThis)\.confirm\(/g, 'await requestConfirm(');
  }

  if (content !== originalContent) {
    // Determine depth for relative imports
    // file is something like C:\...\frontend\src\pages\AdminProductsPage.tsx
    // we want to relative path to frontend/src
    
    // Normalize path separators
    const normalizedFile = file.replace(/\\/g, '/');
    const srcIndex = normalizedFile.indexOf('/frontend/src/');
    const relativePath = normalizedFile.substring(srcIndex + 14); // after '/frontend/src/'
    
    const depth = relativePath.split('/').length - 1;
    const relPrefix = depth === 0 ? './' : '../'.repeat(depth);

    let imports = '';
    if (needsToast && !content.includes('import { toast }')) {
      imports += `import { toast } from '${relPrefix}utils/toast'\n`;
    }
    if (needsConfirm && !content.includes('useUIStore')) {
      imports += `import { useUIStore } from '${relPrefix}store/useUIStore'\n`;
    }

    if (imports) {
      // Find last import
      const importMatches = [...content.matchAll(/^import .*;?$/gm)];
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        const index = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, index) + '\n' + imports + content.slice(index);
      } else {
        content = imports + '\n' + content;
      }
    }

    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
