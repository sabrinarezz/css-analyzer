const vscode = require('vscode');
const glob = require('fast-glob');
const path = require('path');

async function scanCSSFiles() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  // console.log("scanCSSFiles workspaceFolders::: ", workspaceFolders);

  if (!workspaceFolders) {
    return [];
  }

  const root = workspaceFolders[0].uri.fsPath;
  const files = await glob([
    '**/*.css',
    '**/*.scss'
  ], {
    cwd: root,
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ],
    absolute: true
  });

  return files;
}

async function scanMarkupFiles() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  // console.log("scanMarkupFiles workspaceFolders::: ", workspaceFolders);

  if (!workspaceFolders) {
    return [];
  }

  const root = workspaceFolders[0].uri.fsPath;
  const files = await glob([
    '**/*.html',
    '**/*.jsx',
    '**/*.tsx'
  ], {
    cwd: root,
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**'
    ],
    absolute: true
  });

  return files;
}

module.exports = {
  scanCSSFiles,
  scanMarkupFiles
};