const fs = require('fs');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');
const { scanCSSFiles } = require('../utils/fileScanner');

module.exports = async function analyzeCSS() {

  const files = await scanCSSFiles();

  const results = [];   

  for (const file of files) {

    try {

      const css = fs.readFileSync(file, 'utf8');

      const root = postcss.parse(css, {
        from: file,
        parser: safeParser
      });

      const selectorMap = {};

      root.walkRules(rule => {

        const selector = rule.selector;
        const line = rule.source.start.line;

        if (!selectorMap[selector]) {
          selectorMap[selector] = [];
        }

        selectorMap[selector].push({
          file,
          line
        });
      });

      Object.keys(selectorMap).forEach(selector => {
        if (selectorMap[selector].length > 1) {
          selectorMap[selector].forEach(loc => {
            results.push(
              `Duplicate selector "${selector}" at ${loc.file}:${loc.line}`
            );
          });
        }
      });
    } catch (err) {
      results.push(`Failed to parse ${file}: ${err.message}`);
    }

  }

  return results;   
};