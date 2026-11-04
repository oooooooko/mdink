import { marked } from 'marked'

export const platforms = {
  wechat: { name: '微信公众号', short: '公众号', color: '#07a35a', size: 16 },
  juejin: { name: '稀土掘金', short: '掘金', color: '#1e80ff', size: 16 },
  toutiao: { name: '头条号', short: '头条号', color: '#ed4545', size: 18 },
}

export const defaults = { platform: 'wechat', theme: 'classic', color: '#07a35a', fontSize: 16, lineHeight: 1.8, font: 'sans', includeTitle: true, footnotes: true, remote: false }

export function splitMatter(source) {
  source = source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
  const match = source.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  const meta = {}
  if (match) for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^(title|author):\s*(.+)$/)
    if (field) meta[field[1]] = field[2].replace(/^(['"])(.*)\1$/, '$2')
  }
  return { body: match ? source.slice(match[0].length) : source, meta }
}

export function articleTitle(source) {
  const { body, meta } = splitMatter(source)
  const heading = marked.lexer(body).find(t => t.type === 'heading' && t.depth === 1)
  return (meta.title || heading?.text?.replace(/[*_`]/g, '') || '未命名文章').slice(0, 120)
}

export function outputMarkdown(source, includeTitle = true) {
  const { body, meta } = splitMatter(source)
  const tokens = marked.lexer(body)
  const heading = tokens.find(t => t.type === 'heading' && t.depth === 1)
  if (!includeTitle && heading) {
    let offset = 0
    for (const token of tokens) {
      const at = body.indexOf(token.raw, offset)
      if (token === heading) { offset = at; break }
      if (at !== -1) offset = at + token.raw.length
    }
    return (body.slice(0, offset) + body.slice(offset + heading.raw.length)).trim()
  }
  return (includeTitle && !heading && meta.title ? `# ${meta.title}\n\n${body}` : body).trim()
}

export function safeName(title) {
  return title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').slice(0, 100) || '文章'
}

export function imageKey(path) {
  try { path = decodeURIComponent(path) } catch { /* Keep malformed URI text as-is. */ }
  return path.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '')
}

export function resolveImage(path, images = {}, basePath = '') {
  const key = imageKey(path)
  const parts = `${basePath}/${key}`.split('/')
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part && part !== '.') resolved.push(part)
  }
  if (images[resolved.join('/')]) return images[resolved.join('/')]
  if (images[key]) return images[key]
  const matches = Object.entries(images).filter(([name]) => name.split('/').pop() === key.split('/').pop())
  return matches.length === 1 ? matches[0][1] : null
}

export function cleanSettings(input = {}) {
  return {
    platform: Object.hasOwn(platforms, input.platform) ? input.platform : defaults.platform,
    theme: ['classic', 'minimal', 'editorial', 'nice'].includes(input.theme) ? input.theme : defaults.theme,
    color: /^#[\da-f]{6}$/i.test(input.color) ? input.color : defaults.color,
    fontSize: [14, 15, 16, 17, 18, 20].includes(input.fontSize) ? input.fontSize : defaults.fontSize,
    lineHeight: [1.5, 1.6, 1.7, 1.8, 2, 2.2].includes(input.lineHeight) ? input.lineHeight : defaults.lineHeight,
    font: input.font === 'serif' ? 'serif' : 'sans',
    ...Object.fromEntries(['includeTitle', 'footnotes', 'remote'].map(key => [key, typeof input[key] === 'boolean' ? input[key] : defaults[key]])),
  }
}
