const fs = require('fs');
const postcss = require('postcss');
const safeParser = require('postcss-safe-parser');
const cheerio = require('cheerio');

const { scanCSSFiles, scanHTMLFiles } = require('../utils/fileScanner');

module.exports = async function analyzeCSS() {
  const cssFiles = await scanCSSFiles();
  const htmlFiles = await scanHTMLFiles();
  const results = [];
  const selectorMap = {};

  function getContext(rule) {
    let contextParts = [];
    let parent = rule.parent;

    while (parent) {
      if (parent.type === 'atrule') {
        contextParts.unshift(`@${parent.name} ${parent.params}`);
      }
      parent = parent.parent;
    }

    return contextParts.length ? contextParts.join(' > ') : 'root';
  }

  function analyze(css, file) {
    const root = postcss.parse(css, {
      from: file,
      parser: safeParser
    });

    root.walkRules(rule => {
      const selector = rule.selector;
      const line = rule.source.start.line;
      const context = getContext(rule);
      const key = `${context}::${selector}`;
      // console.log("KEYYYYYY::: ", key);

      const properties = {};

      if (!selectorMap[key]) {
        selectorMap[key] = [];
      }

      selectorMap[key].push({ file, line });

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
  }

  for (const file of cssFiles) {
    const css = fs.readFileSync(file, 'utf8');
    analyze(css, file);
  }

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);

    $('style').each((i, el) => {
      const css = $(el).html();

      if (css && css.trim()) {
        analyze(css, file);
      }
    });

  }

  Object.keys(selectorMap).forEach(key => {
    if (selectorMap[key].length > 1) {
      const selector = key.split("::")[1];
      selectorMap[key].forEach(loc => {
        results.push(`Duplicate selector "${selector}" at ${loc.file}:${loc.line}`);
      });
    }
  });
  // console.log("RESULTS OVERALL::: ", results);

  return results;
};