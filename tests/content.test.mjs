import { test } from 'node:test'
import assert from 'node:assert/strict'
import { articleTitle, outputMarkdown, resolveImage, splitMatter, cleanSettings, defaults, safeName } from '../src/content.js'

test('platform output strips metadata and removes only the real article heading', () => {
  const source = '\uFEFF---\r\ntitle: "项目体验"\r\nauthor: Me\r\n---\r\n[repo]: https://example.com\r\n\r\n```md\r\n# 示例标题\r\n```\r\n\r\n# 真正标题\r\n\r\n正文 [项目][repo]\r\n\r\n## 小节\r\n'
  assert.equal(articleTitle(source), '项目体验')
  const output = outputMarkdown(source, false)
  assert.ok(output.includes('```md\n# 示例标题\n```'))
  assert.ok(output.includes('[repo]: https://example.com'))
  assert.ok(!output.includes('# 真正标题'))
  assert.ok(output.includes('## 小节'))
  assert.ok(!output.includes('author:'))
  assert.equal(outputMarkdown('---\ntitle: 标题\n---\n正文'), '# 标题\n\n正文')
  assert.equal(splitMatter('---\n没有闭合的内容').body, '---\n没有闭合的内容')
})

test('relative image resolution handles folders, URL encoding, and ambiguous names', () => {
  const images = { 'notes/assets/封面.png':'cover', 'other/封面.png':'other', 'notes/pic.png':'pic' }
  assert.equal(resolveImage('./assets/%E5%B0%81%E9%9D%A2.png', images, 'notes'), 'cover')
  assert.equal(resolveImage('../pic.png', images, 'notes/posts'), 'pic')
  assert.equal(resolveImage('封面.png', images), null)
  assert.equal(resolveImage('pic.png', images), 'pic')
})

test('backup settings cannot inject CSS or unsupported platform configuration', () => {
  assert.deepEqual(cleanSettings({ platform:'__proto__', color:'red;position:fixed', fontSize:999, theme:'<script>' }), defaults)
  assert.equal(safeName('../../bad:name?'), '.._.._bad_name_')
  assert.equal(cleanSettings({ theme:'nice' }).theme, 'nice')
  for (const theme of ['paper','night','bloom']) assert.equal(cleanSettings({theme}).theme, theme)
  assert.equal(cleanSettings({theme:'custom',customCSS:'.article p { color: red; }'}).theme,'custom')
  assert.equal(cleanSettings({theme:'custom',customCSS:''}).theme,'classic')
  assert.equal(cleanSettings({customCSS:'x'.repeat(100001)}).customCSS,'')
})
