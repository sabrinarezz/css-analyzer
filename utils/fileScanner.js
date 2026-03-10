const vscode = require('vscode');
const glob = require('fast-glob');

async function scanCSSFiles() {
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
// console.log("scanCSSFiles root::: ", root);
  return glob(['**/*.css', '**/*.scss'], {
    cwd: root,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    absolute: true
  });
}

async function scanHTMLFiles() {
  const root = vscode.workspace.workspaceFolders[0].uri.fsPath;
// console.log("scanHTMLFiles root::: ", root);

  return glob(['**/*.html'], {
    cwd: root,
    ignore: ['node_modules/**', 'dist/**', 'build/**'],
    absolute: true
  });
}

module.exports = {
  scanCSSFiles,
  scanHTMLFiles
};