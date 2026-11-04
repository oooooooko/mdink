import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js/lib/common'
import highlightCSS from 'highlight.js/styles/github-dark.css?inline'
import classicCSS from './vendor/doocs-default.css?raw'
import { outputMarkdown, resolveImage } from './content.js'

const baseCSS = `
:host { display:block; color:#333; background:white; }
* { box-sizing:border-box; }
.article { --foreground:0 0% 20%; --md-block-spacing:.72; --md-link-color:var(--md-primary-color); --md-blockquote-background:#f6f8f7; --blockquote-background:#f6f8f7; font-family:var(--article-font); font-size:var(--md-font-size); line-height:var(--article-leading); padding:20px 24px 40px; overflow-wrap:anywhere; background:#fff; color:#333; }
.article h1,.article h2,.article h3,.article h4 { line-height:1.5; }
.article h1:first-child { margin-top:10px; }
.article li { display:list-item; margin:8px 0; }
.article li p { margin:4px 0; }
.article ul,.article ol { padding-left:24px; }
.article p { letter-spacing:.035em; }
.article pre { margin:0; padding:16px; overflow:auto; white-space:pre; font-size:13px; line-height:1.7; border-radius:0 0 7px 7px; background:#0d1117; color:#e6edf3; }
.article pre code { display:block; padding:0; background:none; border:none; color:inherit; white-space:pre; font-size:inherit; letter-spacing:0; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; }
.article :not(pre)>code { color:var(--md-primary-color); background:#f3f5f4; padding:2px 5px; border-radius:4px; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:.88em; }
.codebox { margin:22px 0; border-radius:7px; overflow:hidden; background:#0d1117; }
.codehead { padding:12px 16px 0; height:28px; background:#0d1117; color:#8b949e; font:11px ui-monospace,monospace; }
.codehead span { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:5px; background:#ff5f57; }
.codehead span:nth-child(2) { background:#febc2e; }.codehead span:nth-child(3) { background:#28c840; margin-right:12px; }
.article table { border-collapse:collapse; width:100%; font-size:.85em; margin:24px 0; }
.article td,.article th { padding:10px 12px; word-break:normal; border:1px solid #e4e7e5; }
.article th { background:#f6f8f7; text-align:left; }
.article img { max-width:100%; height:auto; }
.article figure { margin:24px 0; }.article figcaption { font-size:12px; color:#888; margin-top:8px; text-align:center; }
.article blockquote { margin-left:0; margin-right:0; }.article blockquote p { margin:0; }
.article .image-missing { padding:22px 14px; text-align:center; border:1px dashed #d5dcd7; color:#87928b; background:#f8faf9; font-size:12px; border-radius:6px; }
.article .references { margin-top:32px; padding-top:12px; border-top:1px solid #e5e7eb; font-size:12px; color:#888; }
.references p { margin:8px 0; letter-spacing:0; }.references h3 { font-size:14px; }
.article.toutiao h1,.article.toutiao h2 { display:block; background:none; color:#222; padding:0; border:0; text-align:left; margin:28px 0 16px; font-size:1.3em; }
.article.toutiao p { letter-spacing:0; margin:16px 0; }.article.toutiao strong { color:#222; }
.article.juejin h1,.article.juejin h2 { display:block; background:none; text-align:left; color:#252933; border:0; border-bottom:1px solid #eee; padding:0 0 10px; margin:28px 0 16px; font-size:1.45em; }
.article.juejin p { letter-spacing:0; margin:16px 0; }.article.juejin strong { color:#252933; }
.article.minimal h1,.article.minimal h2 { display:block; padding:0 0 10px; background:none; color:#222; border:0; border-bottom:1px solid #e4e8e6; text-align:left; margin:28px 0 16px; font-size:1.25em; }
.article.minimal h3 { border:0; padding:0; }.article.minimal strong { color:inherit; }
.article.editorial h1,.article.editorial h2 { display:block; color:var(--md-primary-color); background:none; text-align:left; padding:0 0 0 14px; border:0; border-left:4px solid var(--md-primary-color); margin:32px 0 18px; font-size:1.3em; }
.article.editorial blockquote { border:0; border-top:2px solid var(--md-primary-color); background:#f8f9fa; border-radius:0; }
`

export function initPreview(host) {
  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = classicCSS + '\n' + highlightCSS + '\n' + baseCSS
  const article = document.createElement('section')
  shadow.append(style, article)
  return article
}

export function renderArticle(article, source, settings, images = {}, basePath = '') {
  article.className = `article ${settings.platform} ${settings.theme}`
  article.style.cssText = `--md-primary-color:${settings.color};--md-font-size:${settings.fontSize}px;--article-leading:${settings.lineHeight};--article-font:${settings.font === 'serif' ? '"Noto Serif SC","Songti SC",SimSun,serif' : '-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif'};`
  const content = DOMPurify.sanitize(marked.parse(outputMarkdown(source, settings.includeTitle), { gfm: true, breaks: true }), {
    ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','br','strong','b','em','i','s','del','blockquote','ul','ol','li','a','img','pre','code','table','thead','tbody','tr','th','td','hr','sup','sub','input'],
    ALLOWED_ATTR: ['href','src','alt','title','class','type','checked','disabled','start','align'],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM_FRAGMENT: true,
  })
  const warnings = new Set()
  for (const input of content.querySelectorAll('input')) { input.type = 'checkbox'; input.disabled = true }
  for (const code of content.querySelectorAll('pre > code')) {
    const lang = [...code.classList].find(c => c.startsWith('language-'))?.slice(9) || ''
    if (hljs.getLanguage(lang)) code.innerHTML = hljs.highlight(code.textContent, { language: lang }).value
    code.classList.add('hljs')
    const pre = code.parentElement
    const wrapper = document.createElement('section')
    wrapper.className = 'codebox'
    const head = document.createElement('section')
    head.className = 'codehead'
    head.innerHTML = '<span></span><span></span><span></span>'
    head.append(document.createTextNode(lang || 'code'))
    pre.replaceWith(wrapper)
    wrapper.append(head, pre)
  }
  for (const img of content.querySelectorAll('img')) {
    const src = img.getAttribute('src') || ''
    const local = resolveImage(src, images, basePath)
    if (local) img.src = local
    else if (/^data:image\/(png|jpeg|gif|webp);base64,/i.test(src)) { /* Raster images are self-contained. */ }
    else if (/^https?:\/\//i.test(src) && settings.remote) {
      img.referrerPolicy = 'no-referrer'
      warnings.add('远程图片依赖网络；如需离线保留，请先导入本地图片。')
    } else {
      const missing = document.createElement('p')
      missing.className = 'image-missing'
      missing.textContent = /^https?:/i.test(src) ? `远程图片已阻止 · ${img.alt || src}` : `待导入图片 · ${img.alt || src}`
      warnings.add(/^https?:/i.test(src) ? '有远程图片未加载，可在排版设置中允许联网加载，或导入图片。' : '有本地图片未找到，请连同文章目录一起导入。')
      img.replaceWith(missing)
      continue
    }
    if (img.title) {
      const figure = document.createElement('figure')
      const caption = document.createElement('figcaption')
      caption.textContent = img.title
      img.replaceWith(figure)
      figure.append(img, caption)
    }
    warnings.add('平台可能不接收 Base64 或外站图片，发布前请检查，必要时在平台重新上传。')
  }
  const links = new Map()
  for (const a of content.querySelectorAll('a')) {
    a.target = '_blank'; a.rel = 'noopener noreferrer'
    const href = a.getAttribute('href') || ''
    if (settings.platform === 'wechat' && settings.footnotes && /^https?:\/\//i.test(href)) {
      if (!links.has(href)) links.set(href, links.size + 1)
      const sup = document.createElement('sup')
      sup.textContent = `[${links.get(href)}]`
      a.after(sup)
    }
  }
  if (links.size) {
    const section = document.createElement('section')
    section.className = 'references'
    section.innerHTML = '<h3>参考链接</h3>'
    for (const [url, n] of links) {
      const p = document.createElement('p')
      p.textContent = `[${n}] ${url}`
      section.append(p)
    }
    content.append(section)
  }
  article.replaceChildren(content)
  return [...warnings]
}

// Export resolved values, since publishing editors discard stylesheets and CSS variables.
const inlineProperties = `display color background-color font-family font-size font-weight font-style line-height letter-spacing text-align text-decoration text-decoration-color white-space overflow-x overflow-y overflow-wrap word-break padding-top padding-right padding-bottom padding-left margin-top margin-right margin-bottom margin-left border-top-width border-right-width border-bottom-width border-left-width border-top-style border-right-style border-bottom-style border-left-style border-top-color border-right-color border-bottom-color border-left-color border-radius border-collapse vertical-align list-style-type max-width height`.split(' ')

export function inlineHTML(article) {
  const clone = article.cloneNode(true)
  const originals = [article, ...article.querySelectorAll('*')]
  const copies = [clone, ...clone.querySelectorAll('*')]
  originals.forEach((node, index) => {
    const computed = getComputedStyle(node)
    const copy = copies[index]
    copy.removeAttribute('class')
    copy.removeAttribute('style')
    for (const property of inlineProperties) {
      if (property === 'height' && node.tagName !== 'IMG' && !node.closest('.codehead')) continue
      if (property.startsWith('margin-') && ['H1','H2','IMG'].includes(node.tagName) && ['margin-left','margin-right'].includes(property)) continue
      copy.style.setProperty(property, computed.getPropertyValue(property))
    }
    if (node.parentElement?.classList.contains('codehead')) {
      copy.style.width = computed.width
      copy.style.height = computed.height
    }
    if (['H1','H2'].includes(node.tagName)) {
      copy.style.marginLeft = computed.display === 'table' ? 'auto' : '0'
      copy.style.marginRight = computed.display === 'table' ? 'auto' : '0'
    }
    if (node.tagName === 'TABLE') copy.style.width = '100%'
    if (node.tagName === 'IMG') { copy.style.height = 'auto'; copy.style.maxWidth = '100%'; copy.style.marginLeft = 'auto'; copy.style.marginRight = 'auto' }
    if (node.tagName === 'INPUT') {
      const span = document.createElement('span')
      span.textContent = node.checked ? '☑ ' : '☐ '
      copy.replaceWith(span)
    }
  })
  clone.style.maxWidth = '100%'
  return clone.outerHTML
}
