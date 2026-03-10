const vscode = require('vscode');
const analyzeCSS = require('./analyzer/cssAnalyzer');

function activate(context) {

  const disposable = vscode.commands.registerCommand('cssCleaner.scan', async function () {

    const results = await analyzeCSS();
    // console.log("RESULTS:::::::::: ", results);

    const output = vscode.window.createOutputChannel("CSS Cleaner");
    output.clear();

    if (!results || results.length === 0) {
      vscode.window.showInformationMessage("CSS Cleaner: No duplicate selectors found.");
      // output.appendLine("No duplicate selectors or unwanted styles found.");
    } else {
      results.forEach(r => {
        output.appendLine(r);
      });
    }

    output.show(true);
  });

  context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = { activate, deactivate };