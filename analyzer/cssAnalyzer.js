const fs = require('fs');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');
const { scanCSSFiles } = require('../utils/fileScanner');

module.exports = async function analyzeCSS() {
  const files = await scanCSSFiles();
  const results = [];
  const selectorMap = {};

  for (const file of files) {
    try {
      const css = fs.readFileSync(file, 'utf8');
      const root = postcss.parse(css, {
        from: file,
        parser: safeParser
      });

      root.walkRules(rule => {

        const selector = rule.selector;
        const line = rule.source.start.line;

        let context = 'root';
        if (rule.parent && rule.parent.type === 'atrule') {
          context = `@${rule.parent.name} ${rule.parent.params}`;
        }

        const key = `${context}::${selector}`;
        // console.log("KEYYYYYY::: ", key);
        
        if (!selectorMap[key]) {
          selectorMap[key] = [];
        }

        selectorMap[key].push({ file, line });

        const properties = {};

        rule.walkDecls(decl => {
          const propLine = decl.source.start.line;
          // console.log("PROPLINE:::: ", propLine);
          
          if (properties[decl.prop]) {
            results.push(`Duplicate property "${decl.prop}" in ${selector} (${file}:${propLine})`);
            console.log("RESULTS(if):::: ", results); 
          }

          properties[decl.prop] = true;
        });
      });
    } catch (err) {
      results.push(`Failed to parse ${file}: ${err.message}`);
    }
  }

  Object.keys(selectorMap).forEach(key => {
    if (selectorMap[key].length > 1) {
      const selector = key.split("::")[1];
      selectorMap[key].forEach(loc => {

        results.push(
          `Duplicate selector "${selector}" at ${loc.file}:${loc.line}`
        );
      });
    }
  });
  // console.log("RESULTS OVERALL::: ", results);

  return results;
};