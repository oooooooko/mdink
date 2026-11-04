import { cssLanguage } from '@codemirror/lang-css'

export const maxCSSLength = 100000

export function compileCustomCSS(source) {
  if (typeof source !== 'string' || source.length > maxCSSLength) throw new Error('CSS 不能超过 100 KB。')
  if (!source.trim()) return ''
  const plain = source.replace(/\/\*[\s\S]*?\*\//g, '')
  if (/\\|@\s*(?!media\b|supports\b)[\w-]+|\b(?:url|image-set|expression)\s*\(/i.test(plain)) {
    throw new Error('样式不支持外部资源、CSS 转义或导入；请使用本地排版属性。')
  }
  let syntaxError
  cssLanguage.parser.parse(source).iterate({ enter(node) { if (node.type.isError && syntaxError === undefined) syntaxError = node.from } })
  if (syntaxError !== undefined) throw new Error(`第 ${source.slice(0, syntaxError).split('\n').length} 行附近的 CSS 语法不完整。`)
  const sheet = new CSSStyleSheet()
  sheet.replaceSync(source)
  function serialize(rules, depth = 0) {
    if (depth > 8) throw new Error('CSS 条件嵌套不能超过 8 层。')
    return [...rules].map(rule => {
      if (rule.type === CSSRule.STYLE_RULE) {
        const selectors = rule.selectorText.split(/,(?![^()]*\))/).map(s => s.trim())
        if (selectors.some(s => !/^\.article(?=[\s.:#\[>+~]|$)/.test(s) || /:host|:root/.test(s))) {
          throw new Error('每个选择器都需要以 .article 开头，仅修改文章内的样式。')
        }
        if (rule.cssRules?.length) throw new Error('请将嵌套选择器展开成 .article 开头的普通规则。')
        if (/behavior|-moz-binding/i.test(rule.style.cssText)) throw new Error('该 CSS 属性不适用于文章排版。')
        return `${selectors.map(s => s.replace(/^\.article/, '.article.article')).join(', ')} { ${rule.style.cssText} }`
      }
      if (rule.type === CSSRule.MEDIA_RULE || rule.type === CSSRule.SUPPORTS_RULE) {
        return `${rule.cssText.slice(0, rule.cssText.indexOf('{'))}{${serialize(rule.cssRules, depth + 1)}}`
      }
      throw new Error('仅支持普通样式以及 @media、@supports 条件规则。')
    }).join('\n')
  }
  return serialize(sheet.cssRules)
}
