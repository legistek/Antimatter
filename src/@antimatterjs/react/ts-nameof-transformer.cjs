/*
 * ts-nameof wired in as a TypeScript custom transformer.
 *
 * It must run INSIDE the TypeScript compile, not as a webpack loader ahead of it.
 * A loader rewriting the text produces no source map, so every nameof(...) expansion
 * shifts positions TypeScript's map knows nothing about - breakpoints in files that
 * use nameof land on the wrong line or fail to map at all. Running as a transformer
 * lets TypeScript emit mappings that already account for the substitution.
 *
 * ts-nameof 5.0 targets the pre-TypeScript-4.0 node factory API. Those top-level
 * functions were removed in TypeScript 5 and are absent from TypeScript 6, so we
 * install the removed names as thin ts.factory forwarders first. Additive only: it
 * defines nothing TypeScript still provides.
 */
const ts = require('typescript');

const shims = {
    createLiteral: value => {
        if (typeof value === 'string') return ts.factory.createStringLiteral(value);
        if (typeof value === 'number') return ts.factory.createNumericLiteral(value);
        if (typeof value === 'boolean') {
            return value ? ts.factory.createTrue() : ts.factory.createFalse();
        }
        return ts.factory.createStringLiteral(String(value));
    },
    createArrayLiteral: (elements, multiLine) =>
        ts.factory.createArrayLiteralExpression(elements, multiLine),
    createNoSubstitutionTemplateLiteral: (text, rawText) =>
        ts.factory.createNoSubstitutionTemplateLiteral(text, rawText),
    createTemplateExpression: (head, spans) =>
        ts.factory.createTemplateExpression(head, spans),
    createTemplateHead: (text, rawText) => ts.factory.createTemplateHead(text, rawText),
    createTemplateMiddle: (text, rawText) => ts.factory.createTemplateMiddle(text, rawText),
    createTemplateTail: (text, rawText) => ts.factory.createTemplateTail(text, rawText),
    createTemplateSpan: (expression, literal) =>
        ts.factory.createTemplateSpan(expression, literal),
};

for (const [name, fn] of Object.entries(shims)) {
    if (typeof ts[name] !== 'function') {
        ts[name] = fn;
    }
}

module.exports = require('ts-nameof');
