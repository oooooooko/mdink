import { chromium } from '@playwright/test'
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile, mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const results = resolve('test-results')
await mkdir(results, { recursive: true })
const browser = await chromium.launch({
  ...(process.platform === 'darwin' ? { executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {}),
  headless: true,
})

try {
  const context = await browser.newContext({ viewport: { width:1440, height:1000 }, acceptDownloads:true, offline:true })
  const page = await context.newPage()
  const errors = [], remoteRequests = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('request', request => { if (/^https?:/.test(request.url())) remoteRequests.push(request.url()) })
  await page.addInitScript(() => {
    window.__capturedClipboard = null
    Object.defineProperty(navigator, 'clipboard', { configurable:true, value: {
      write:async items => {
        const content = {}
        for (const item of items) for (const type of item.types) content[type] = await (await item.getType(type)).text()
        window.__capturedClipboard = content
      },
      writeText:async text => { window.__capturedClipboard = { 'text/plain':text } },
    } })
  })
  await page.goto(pathToFileURL(resolve('dist/index.html')).href)
  await page.locator('#editor .cm-content').waitFor()
  assert.equal(await page.locator('.brand strong').innerText(), 'MDInk')
  await page.waitForFunction(() => document.querySelector('#save-status').textContent.includes('已保存'))
  await page.screenshot({ path:resolve(results,'desktop.png') })
  await page.locator('[data-theme="nice"]').click()
  await page.waitForFunction(() => document.querySelector('#save-status').textContent.includes('已保存'))
  await page.reload()
  await page.locator('#editor .cm-content').waitFor()
  assert.equal(await page.locator('[data-theme="nice"]').getAttribute('aria-pressed'), 'true')
  assert.equal(await page.locator('#article-host').locator('h2').first().evaluate(el => getComputedStyle(el).borderBottomWidth), '2px')
  await page.screenshot({ path:resolve(results,'nice-theme.png') })
  const source = `---\ntitle: 离线项目测试\nauthor: tester\n---\n# 离线项目测试\n\n一段 **重点** 和 [项目地址](https://example.com/repo)。\n\n## 使用方法\n\n\`\`\`python\nprint("Hello")\n\`\`\`\n\n| 功能 | 状态 |\n| --- | --- |\n| 离线 | 可用 |\n\n- [x] 已完成\n- [ ] 待办\n\n![本地图片](assets/cover.png "图片说明")\n\n![远程图片](https://example.com/should-not-fetch.png)\n\n<script>window.__injected=true</script><img src=x onerror="window.__injected=true"><a href="javascript:alert(1)">危险链接</a>`
  await page.locator('#editor .cm-content').fill(source)
  await page.waitForFunction(() => document.querySelector('#article-host').shadowRoot.querySelector('h1')?.textContent === '离线项目测试')
  assert.equal(await page.evaluate(() => window.__injected), undefined)
  assert.equal(await page.locator('#article-host').locator('script, [onerror], a[href^="javascript:"]').count(), 0)
  assert.equal(await page.locator('#article-host').locator('img').count(), 0)
  assert.deepEqual(remoteRequests, [])

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a18sAAAAASUVORK5CYII=', 'base64')
  await page.locator('#file-input').setInputFiles({ name:'cover.png', mimeType:'image/png', buffer:png })
  await page.waitForFunction(() => document.querySelector('#article-host').shadowRoot.querySelector('img')?.src.startsWith('data:image/'))
  assert.equal(await page.locator('#article-host').locator('figcaption').innerText(), '图片说明')
  await page.locator('#includeTitle').uncheck()
  assert.equal(await page.locator('#article-host').locator('h1').count(), 0)
  await page.locator('#copy-primary').click()
  await page.waitForFunction(() => window.__capturedClipboard?.['text/html'])
  const clipboard = await page.evaluate(() => window.__capturedClipboard)
  assert.ok(clipboard['text/html'].includes('data:image/png;base64,'))
  assert.ok(clipboard['text/html'].includes('参考链接'))
  assert.ok(clipboard['text/html'].includes('☑'))
  assert.ok(!clipboard['text/html'].includes('class='))
  assert.ok(!clipboard['text/html'].includes('var(--'))
  assert.ok(!clipboard['text/html'].includes('<style'))
  assert.ok(!clipboard['text/html'].includes('<script'))
  assert.ok(!clipboard['text/html'].includes('onerror'))
  assert.equal(await page.evaluate(html => new DOMParser().parseFromString(html,'text/html').querySelector('h2').style.borderBottomWidth, clipboard['text/html']), '2px')
  await writeFile(resolve(results,'wechat.html'), clipboard['text/html'])

  await page.locator('[data-platform="juejin"]').click()
  await page.locator('#copy-primary').click()
  await page.waitForFunction(() => window.__capturedClipboard && !window.__capturedClipboard['text/html'])
  const md = await page.evaluate(() => window.__capturedClipboard)
  assert.deepEqual(Object.keys(md), ['text/plain'])
  assert.ok(md['text/plain'].includes('```python\nprint("Hello")\n```'))
  assert.ok(!md['text/plain'].includes('author:'))
  assert.ok(!md['text/plain'].includes('# 离线项目测试'))
  await page.locator('[data-platform="toutiao"]').click()
  assert.equal(await page.locator('#fontSize').inputValue(), '18')
  await page.locator('[data-theme="editorial"]').click()
  await page.locator('[data-color="#7c5cdb"]').click()
  await page.locator('#fontSize').selectOption('20')
  await page.locator('#lineHeight').selectOption('2')
  assert.equal(await page.locator('#article-host').locator('section.article').evaluate(el => getComputedStyle(el).fontSize), '20px')
  await page.locator('#copy-primary').click()
  await page.waitForFunction(() => window.__capturedClipboard?.['text/html'])
  await writeFile(resolve(results,'toutiao.html'), await page.evaluate(() => window.__capturedClipboard['text/html']))

  const getDownload = async (action, filename) => {
    await page.locator('.export-menu summary').click()
    const event = page.waitForEvent('download')
    await page.locator(`.export-menu [data-action="${action}"]`).click()
    const download = await event
    const path = resolve(results,filename)
    await download.saveAs(path)
    return readFile(path,'utf8')
  }
  const exported = await getDownload('export-html','article.html')
  assert.ok(exported.startsWith('<!doctype html>'))
  assert.ok(exported.includes('data:image/png;base64,'))
  assert.ok(!exported.includes('window.__injected'))
  assert.ok(!exported.includes('var(--'))
  const exportedMD = await getDownload('export-md','article.md')
  assert.equal(exportedMD, md['text/plain'])
  const backupText = await getDownload('backup','backup.json')
  const backup = JSON.parse(backupText)
  assert.equal(backup.format,'mdink-backup-v1')
  assert.ok(backup.drafts[0].images['cover.png'])
  await page.waitForFunction(() => document.querySelector('#save-status').textContent.includes('已保存'))
  await page.reload()
  await page.locator('#editor .cm-content').waitFor()
  assert.ok((await page.locator('#editor .cm-content').innerText()).includes('离线项目测试'))
  assert.equal(await page.locator('[data-platform="toutiao"]').getAttribute('aria-selected'),'true')
  assert.equal(await page.locator('#fontSize').inputValue(),'20')
  assert.equal(await page.locator('#article-host').locator('img').count(),1)

  const before = await page.locator('.draft-item').count()
  await page.locator('#restore-input').setInputFiles({ name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backupText) })
  await page.waitForFunction(n => document.querySelectorAll('.draft-item').length > n,before)
  assert.equal(await page.locator('.draft-item').count(), before + backup.drafts.length)

  for (const theme of ['paper','night','bloom']) {
    await page.locator(`[data-theme="${theme}"]`).click()
    assert.equal(await page.locator(`[data-theme="${theme}"]`).getAttribute('aria-pressed'),'true')
    assert.ok(await page.locator('#article-host').locator(`.article.${theme}`).count())
  }
  await page.locator('[data-theme="paper"]').click()
  await page.locator('[data-action="edit-style"]').click()
  assert.equal(await page.locator('.style-target').count(),11)
  assert.equal(await page.locator('#style-error').innerText(),'')
  await page.screenshot({path:resolve(results,'custom-css-editor.png')})
  await page.locator('#save-style').click()
  assert.equal(await page.locator('[data-theme="custom"]').getAttribute('aria-pressed'),'true')
  assert.equal(await page.locator('#article-host').locator('.article').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 252, 245)')
  await page.locator('[data-action="edit-style"]').click()
  const replaceCSS = async source => {
    await page.locator('#css-editor .cm-content').focus()
    await page.keyboard.press('ControlOrMeta+A')
    await page.keyboard.insertText(source)
    await page.waitForTimeout(250)
  }
  for (const source of ['@import "https://example.com/theme.css";', '.article { background: url(https://example.com/pixel.png); }', 'body { color: red; }', '.article p { color: #']) {
    await replaceCSS(source)
    assert.ok(await page.locator('#style-error').innerText())
    assert.ok(await page.locator('#save-style').isDisabled())
  }
  const customCSS = '.article { --md-primary-color: #663399; background: #fffdf7; }\n.article p { color: #234567; text-indent: 2em; }\n.article h2 { border-bottom: 3px solid var(--md-primary-color); }'
  await replaceCSS(customCSS)
  assert.equal(await page.locator('#style-error').innerText(),'')
  assert.equal(await page.locator('#style-preview-host').locator('p').first().evaluate(e=>getComputedStyle(e).color),'rgb(35, 69, 103)')
  const cssDownloadEvent=page.waitForEvent('download')
  await page.locator('[data-action="export-css"]').click()
  const cssDownload=await cssDownloadEvent
  await cssDownload.saveAs(resolve(results,'custom.css'))
  assert.equal(await readFile(resolve(results,'custom.css'),'utf8'),customCSS)
  await page.locator('#save-style').click()
  await page.waitForFunction(()=>document.querySelector('#save-status').textContent.includes('已保存'))
  await page.reload()
  await page.locator('#editor .cm-content').waitFor()
  assert.equal(await page.locator('[data-theme="custom"]').getAttribute('aria-pressed'),'true')
  assert.equal(await page.locator('#article-host').locator('p').first().evaluate(e=>getComputedStyle(e).color),'rgb(35, 69, 103)')
  await page.evaluate(()=>{window.__capturedClipboard=null})
  await page.locator('#copy-primary').click()
  await page.waitForFunction(()=>window.__capturedClipboard?.['text/html'])
  const customHTML=await page.evaluate(()=>window.__capturedClipboard['text/html'])
  assert.ok(customHTML.includes('rgb(35, 69, 103)'))
  assert.ok(customHTML.includes('text-indent: 40px'))
  assert.ok(!customHTML.includes('var(--'))
  const customBackup=JSON.parse(await getDownload('backup','custom-backup.json'))
  assert.ok(customBackup.drafts.some(d=>d.settings.customCSS===customCSS))
  await page.locator('[data-theme="minimal"]').click()
  await page.locator('[data-theme="custom"]').click()
  assert.equal(await page.locator('#article-host').locator('p').first().evaluate(e=>getComputedStyle(e).color),'rgb(35, 69, 103)')

  const fixture = await mkdtemp(resolve(tmpdir(),'mdink-fixture-'))
  await mkdir(resolve(fixture,'posts'),{recursive:true})
  await mkdir(resolve(fixture,'assets'),{recursive:true})
  await writeFile(resolve(fixture,'posts','folder.md'),'# 文件夹导入\n\n![封面](../assets/cover.png)\n')
  await writeFile(resolve(fixture,'assets','cover.png'),png)
  await page.locator('#folder-input').setInputFiles(fixture)
  await page.waitForFunction(() => document.querySelector('#article-host').shadowRoot.querySelector('h1')?.textContent === '文件夹导入')
  assert.equal(await page.locator('#article-host').locator('img').count(),1)
  assert.ok((await page.locator('#article-host').locator('img').getAttribute('src')).startsWith('data:'))
  await page.locator('.menubar .menu').nth(1).locator('summary').click()
  await page.locator('[data-action="undo"]').click()
  assert.equal(await page.locator('#article-host').locator('h1').innerText(),'文件夹导入')

  await page.setViewportSize({width:390,height:844})
  await page.locator('[data-action="settings"]').first().click()
  await page.locator('[data-action="sidebar"]').click()
  assert.ok(await page.locator('.drafts-panel').isVisible())
  await page.keyboard.press('Escape')
  assert.ok(!await page.locator('.drafts-panel').isVisible())
  await page.screenshot({path:resolve(results,'mobile-editor.png')})
  await page.locator('.editor-panel [data-action="mobile-preview"]').click()
  await page.screenshot({path:resolve(results,'mobile-preview.png')})
  assert.ok(await page.locator('.preview-panel').isVisible())
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth),390)
  assert.deepEqual(remoteRequests,[])
  assert.deepEqual(errors,[])
  await context.close()
  console.log('PASS: offline file, three platforms, safe rendering, inline HTML, clipboard payload, image/folder import, export, backup, persistence, and mobile layout')
} finally { await browser.close() }
