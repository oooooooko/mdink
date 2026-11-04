import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { markdown } from '@codemirror/lang-markdown'
import { css } from '@codemirror/lang-css'
import { undo, redo } from '@codemirror/commands'
import { createElement, PenLine, FileText, Plus, FolderOpen, PanelLeft, PanelRight, ChevronDown, Copy, Download, Check, ShieldCheck, Upload, Trash2, MoreHorizontal, Smartphone, Monitor, Bold, Italic, Heading2, Link, Image, List, Code, Quote, X, FileCode2, ArrowDownUp, Settings2, Search, CheckCheck } from 'lucide'
import { defaults, platforms, articleTitle, safeName, cleanSettings, imageKey, outputMarkdown } from './content.js'
import { initPreview, renderArticle, inlineHTML, editableThemeCSS } from './renderer.js'
import { themes, styleTargets } from './themes.js'
import { compileCustomCSS } from './custom-css.js'
import { loadWorkspace, saveWorkspace } from './storage.js'
import { sample } from './sample.js'
import './style.css'
import './theme-editor.css'

const icons = { PenLine, FileText, Plus, FolderOpen, PanelLeft, PanelRight, ChevronDown, Copy, Download, Check, ShieldCheck, Upload, Trash2, MoreHorizontal, Smartphone, Monitor, Bold, Italic, Heading2, Link, Image, List, Code, Quote, X, FileCode2, ArrowDownUp, Settings2, Search, CheckCheck }
const icon = (name, size = 16) => createElement(icons[name], { width: size, height: size, 'stroke-width': 1.7, 'aria-hidden': 'true' }).outerHTML
const $ = selector => document.querySelector(selector)
const escapeHTML = text => String(text).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c])
const platformMark = (key) => key === 'wechat' ? '<span class="platform-mark wechat-mark">●<small>●</small></span>' : key === 'juejin' ? '<span class="platform-mark juejin-mark">◈</span>' : '<span class="platform-mark toutiao-mark">头</span>'

function draft(source = '# 未命名文章\n\n从这里开始，写下你的想法。\n', name = '') {
  return { id: crypto.randomUUID(), source, name, settings: { ...defaults }, images: {}, basePath: '', updated: Date.now() }
}

let state
let storageAvailable = true
try { state = await loadWorkspace() } catch { storageAvailable = false }
if (!state?.drafts?.length) {
  const first = draft(sample, '开始使用 MDInk')
  state = { drafts: [first], active: first.id }
}
if (!state.drafts.some(d => d.id === state.active)) state.active = state.drafts[0].id
for (const d of state.drafts) { d.settings = cleanSettings(d.settings); d.images ||= {} }
const active = () => state.drafts.find(d => d.id === state.active)
const settings = () => active().settings
let mobilePreview = false
let saveTimer, renderTimer, toastTimer
let syncingScroll = false
let scrollSync = true

$('#app').innerHTML = `
  <header class="header">
    <a class="brand" href="#" aria-label="MDInk首页"><span class="brand-icon">${icon('PenLine', 21)}</span><strong>MDInk</strong><span class="offline-label">离线版</span></a>
    <nav class="menubar" aria-label="编辑器菜单">
      <details class="menu"><summary>文件 ${icon('ChevronDown', 12)}</summary><div class="dropdown"><button data-action="new">新建文章</button><button data-action="import">导入 Markdown <kbd>⌘ O</kbd></button><button data-action="folder">导入文章文件夹</button><hr><button data-action="export-md">导出 Markdown</button><button data-action="backup">备份所有草稿</button><button data-action="restore">恢复草稿备份</button></div></details>
      <details class="menu"><summary>编辑 ${icon('ChevronDown', 12)}</summary><div class="dropdown"><button data-action="undo">撤销 <kbd>⌘ Z</kbd></button><button data-action="redo">重做 <kbd>⌘ ⇧ Z</kbd></button><hr><button data-action="select-all">全选正文 <kbd>⌘ A</kbd></button><button data-action="rename">重命名文章</button></div></details>
      <details class="menu"><summary>插入 ${icon('ChevronDown', 12)}</summary><div class="dropdown"><button data-format="heading">二级标题</button><button data-format="code">代码块</button><button data-format="table">表格</button><button data-action="image">本地图片</button><button data-format="link">链接</button></div></details>
      <button class="text-btn" data-action="help">帮助</button>
    </nav>
    <div class="header-actions"><span class="local-badge">${icon('ShieldCheck', 14)} 本地处理</span><details class="menu export-menu"><summary class="button">${icon('Download')}<span>导出</span>${icon('ChevronDown', 12)}</summary><div class="dropdown align-right"><button data-action="export-html">导出排版 HTML</button><button data-action="export-md">导出 Markdown</button><button data-action="copy-html">复制 HTML 源码</button><hr><button data-action="backup">备份所有草稿</button></div></details><button class="button primary" id="copy-primary" data-action="copy">${icon('Copy')}<span>复制排版</span></button></div>
  </header>
  <div class="platform-bar">
    <div class="workspace-label"><span class="eyebrow">创作工作台</span></div>
    <div class="platform-tabs" role="tablist" aria-label="发布平台">${Object.entries(platforms).map(([key,p]) => `<button role="tab" class="platform-tab" data-platform="${key}" aria-selected="false">${platformMark(key)}<span>${p.name}</span></button>`).join('')}</div>
    <div class="platform-bar-end"><button class="icon-btn" data-action="settings" aria-label="切换排版设置" title="排版设置">${icon('PanelRight', 18)}</button></div>
  </div>
  <main class="workspace">
    <aside class="drafts-panel" aria-label="本地草稿">
      <div class="panel-heading"><span>${icon('FolderOpen')} 我的草稿 <span id="draft-count" class="count"></span></span><button class="icon-btn" data-action="new" aria-label="新建文章" title="新建文章">${icon('Plus')}</button></div>
      <button class="import-button" data-action="import">${icon('Upload')} 导入 Markdown</button>
      <div class="draft-list" id="draft-list"></div>
      <div class="draft-footer"><div>${icon('ShieldCheck', 14)} 灵感，只留在你的设备</div><p>草稿自动保存在当前浏览器。</p></div>
    </aside>
    <section class="editor-panel" aria-label="Markdown 编辑区">
      <div class="pane-heading"><div><button class="icon-btn" data-action="sidebar" aria-label="切换草稿栏" title="切换草稿栏">${icon('PanelLeft')}</button><span>Markdown</span><span class="muted tiny">源文</span></div><div><span id="save-status" class="save-status">已保存</span><button class="icon-btn mobile-mode" data-action="mobile-preview" title="切换预览" aria-label="切换预览">${icon('Smartphone')}</button></div></div>
      <div class="format-toolbar" aria-label="格式工具栏">${[['heading','Heading2','二级标题'],['bold','Bold','加粗'],['italic','Italic','斜体'],['quote','Quote','引用'],['list','List','列表'],['link','Link','链接'],['code','Code','代码块']].map(([format,i,label]) => `<button class="icon-btn" data-format="${format}" title="${label}" aria-label="${label}">${icon(i, 17)}</button>`).join('')}<span class="toolbar-separator"></span><button class="icon-btn" data-action="image" title="插入本地图片" aria-label="插入本地图片">${icon('Image', 17)}</button><span class="toolbar-spacer"></span><button class="icon-btn active" data-action="scroll-sync" id="sync-button" aria-pressed="true" title="同步滚动" aria-label="同步滚动">${icon('ArrowDownUp', 17)}</button></div>
      <div id="editor"></div>
      <div class="editor-status"><span id="word-count"></span><span id="cursor-status">行 1，列 1</span></div>
    </section>
    <section class="preview-panel" aria-label="文章预览">
      <div class="pane-heading"><div><span class="live-dot"></span><span>实时预览</span><span class="preview-platform" id="preview-platform"></span></div><div class="preview-controls"><button class="icon-btn active" data-action="wide" id="wide-button" title="桌面预览" aria-label="桌面预览" aria-pressed="true">${icon('Monitor', 16)}</button><button class="icon-btn" data-action="narrow" id="narrow-button" title="手机预览" aria-label="手机预览" aria-pressed="false">${icon('Smartphone', 16)}</button><button class="icon-btn mobile-mode" data-action="mobile-preview" title="返回编辑" aria-label="返回编辑">${icon('Code', 16)}</button></div></div>
      <div class="preview-scroll" id="preview-scroll"><div class="paper" id="paper"><div class="paper-meta"><span id="paper-label"></span><span id="paper-tag">文章排版预览</span></div><div id="article-host"></div><div class="paper-end"><span></span> 愿你的分享，被更多人看见 <span></span></div></div></div>
    </section>
    <aside class="settings-panel" aria-label="排版设置">
      <div class="panel-heading"><span>${icon('Settings2')} 排版设置</span><button class="icon-btn" data-action="settings" aria-label="收起排版设置" title="收起排版设置">${icon('X', 15)}</button></div>
      <div class="settings-scroll">
        <div class="setting-section"><div class="section-label">文章主题 <span>THEME</span></div><div class="theme-list">${[...themes,{id:'custom',name:'自定义',description:'当前文章'}].map(({id,name,description}) => `<button class="theme-card" data-theme="${id}" ${id==='custom'?'id="custom-theme-card" hidden':''} aria-pressed="false"><div class="theme-mini ${id}"><b></b><i></i><i></i><i></i></div><span><strong>${name}</strong><small>${description}</small></span><span class="theme-check">${icon('Check', 13)}</span></button>`).join('')}</div><button class="edit-style-button" data-action="edit-style">${icon('Code',15)} 编辑 CSS 样式</button></div>
        <div class="setting-section"><div class="section-label">主题色 <span id="color-label">#07A35A</span></div><div class="color-options">${['#07a35a','#1e80ff','#7c5cdb','#d89938','#ed4545','#343d46'].map(color => `<button class="color-swatch" data-color="${color}" style="--swatch:${color}" title="${color}" aria-label="主题色 ${color}" aria-pressed="false"></button>`).join('')}<label class="custom-color" title="自定义主题色">${icon('Plus', 13)}<input type="color" id="custom-color" aria-label="自定义主题色"></label></div></div>
        <div class="setting-section typography"><div class="section-label">文字排版 <span>TYPOGRAPHY</span></div><label class="setting-row">字体<select id="font" data-setting="font"><option value="sans">无衬线 · 系统默认</option><option value="serif">衬线 · 宋体</option><option value="optima">Optima · 人文字体</option></select></label><label class="setting-row">字号<select id="fontSize" data-setting="fontSize">${[14,15,16,17,18,20].map(n=>`<option value="${n}">${n} px</option>`).join('')}</select></label><label class="setting-row">行距<select id="lineHeight" data-setting="lineHeight">${[1.25,1.5,1.6,1.7,1.8,2,2.2].map(n=>`<option value="${n}">${n===1.25?'1.25':n.toFixed(1)} 倍</option>`).join('')}</select></label></div>
        <div class="setting-section"><div class="section-label">内容选项 <span>CONTENT</span></div><label class="toggle-row"><span>正文包含文章标题</span><input type="checkbox" role="switch" id="includeTitle" data-setting="includeTitle"></label><label class="toggle-row" id="footnotes-row"><span>站外链接转文末脚注</span><input type="checkbox" role="switch" id="footnotes" data-setting="footnotes"></label><label class="toggle-row"><span>允许联网加载远程图片</span><input type="checkbox" role="switch" id="remote" data-setting="remote"></label><p class="setting-tip">本地图片会内嵌到文章中。平台若不接收图片，请在发布时重新上传。</p></div>
        <div id="warnings" class="warnings" hidden></div><button class="reset-button" data-action="reset">恢复当前平台默认样式</button>
      </div>
    </aside>
  </main>
  <input type="file" id="file-input" accept=".md,.markdown,.txt,image/png,image/jpeg,image/gif,image/webp" multiple hidden>
  <input type="file" id="folder-input" webkitdirectory multiple hidden>
  <input type="file" id="image-input" accept="image/png,image/jpeg,image/gif,image/webp" multiple hidden>
  <input type="file" id="restore-input" accept=".json,application/json" hidden>
  <div class="toast" id="toast" role="status" hidden></div>
  <div class="drop-overlay" id="drop-overlay" hidden><div>${icon('Upload', 42)}<strong>放下文件，开始创作</strong><p>支持 Markdown 和本地图片</p></div></div>
  <dialog id="style-dialog" class="style-dialog">
    <div class="style-dialog-heading"><div><h2>自定义文章样式</h2><p>编辑 CSS，实时预览，保存到当前文章。</p></div><button class="icon-btn" data-action="close-style" aria-label="关闭样式编辑器">${icon('X',20)}</button></div>
    <div class="style-dialog-toolbar"><label>从主题开始 <select id="style-base">${themes.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}<option value="custom" id="style-custom-option">已保存的自定义样式</option></select></label><span>支持主题色、字号与行距变量</span></div>
    <div class="style-dialog-content">
      <aside class="style-guide"><h3>可以修改什么</h3><p>点击一项，在 CSS 末尾添加覆盖规则。</p>${styleTargets.map(([name,selector,properties],index)=>`<button class="style-target" data-style-target="${index}"><strong>${name}</strong><code>${escapeHTML(selector)}</code><span>${properties}</span></button>`).join('')}<details><summary>可用的 CSS 变量</summary><p><code>--md-primary-color</code> 主题色<br><code>--md-font-size</code> 正文字号<br><code>--article-leading</code> 行高<br><code>--article-font</code> 字体</p></details><p>选择器以 <code>.article</code> 开头。外部资源不载入；伪元素、动画等效果不能随富文本复制。</p></aside>
      <section class="css-source"><div class="css-pane-heading"><strong>CSS 源代码</strong><span>⌘ / Ctrl + F 查找</span></div><div id="css-editor"></div></section>
      <section class="css-preview"><div class="css-pane-heading"><strong>文章预览</strong><span>实时更新</span></div><div class="css-preview-scroll"><div id="style-preview-host"></div></div></section>
    </div>
    <div class="style-dialog-footer"><span id="style-error" role="status"></span><div><button class="button" data-action="export-css">${icon('Download',14)} 导出 CSS</button><button class="button" data-action="close-style">取消</button><button class="button primary" data-action="save-style" id="save-style">保存样式</button></div></div>
  </dialog>
  <dialog id="help-dialog"><div class="dialog-heading"><span class="brand-icon">${icon('PenLine',20)}</span><h2>让内容，好好呈现。</h2><button class="icon-btn" data-action="close-help" aria-label="关闭帮助">${icon('X', 20)}</button></div><p>MDInk 是一款在本机运行的 Markdown 社媒排版工具。</p><ol class="help-steps"><li><b>写作或导入</b><span>拖入 .md 文件；含相对路径图片时，请用「文件 → 导入文章文件夹」。文件夹中的多篇文章会分别成为草稿。</span></li><li><b>选择发布平台</b><span>公众号、头条号复制富文本；掘金复制 Markdown。文章标题通常在平台单独填写，可关闭「正文包含文章标题」。</span></li><li><b>调整并复制</b><span>切换主题、字号与行距，点击右上角复制。复制失败时，可以导出 HTML 后打开并复制正文。</span></li></ol><div class="help-note"><b>离线与数据</b><p>构建后的 dist/index.html 包含全部脚本和样式，可双击打开。草稿存于当前浏览器的 IndexedDB；清理浏览器数据、更换网址或移动离线文件可能影响草稿，请定期「备份所有草稿」。浏览器禁止本地存储时，仍可编辑并导出。</p><b>平台兼容</b><p>各平台可能过滤部分 CSS、外链和 Base64 图片，请在发布前检查。掘金 Markdown 的最终外观由平台决定；公式、Mermaid 等以源文本或代码呈现，不做图片转换。仅支持标准 Markdown / GFM，不解析 Obsidian 双链及嵌入语法。</p></div><div class="help-credit">界面布局参考 <a href="https://github.com/doocs/md" target="_blank" rel="noopener noreferrer">doocs/md</a>，复用其经典主题（WTFPL）；Nice 主题参考 <a href="https://github.com/mdnice/markdown-nice" target="_blank" rel="noopener noreferrer">Markdown Nice</a> 的阅读排版理念；富文本工作流参考 <a href="https://github.com/spark-ai-boy/obsidian-social-formatter" target="_blank" rel="noopener noreferrer">Social Formatter</a>。这是独立的离线实现，非上述项目官方版本。</div></dialog>
`

const article = initPreview($('#article-host'))
const editorExtensions = [basicSetup, markdown(), EditorView.lineWrapping, EditorView.contentAttributes.of({ 'aria-label':'Markdown 正文', spellcheck:'false' }), EditorView.updateListener.of(update => {
    if (update.docChanged) {
      active().source = update.state.doc.toString()
      active().updated = Date.now()
      clearTimeout(renderTimer)
      renderTimer = setTimeout(render, 120)
      scheduleSave()
    }
    if (update.selectionSet || update.docChanged) {
      const cursor = update.state.selection.main.head
      const line = update.state.doc.lineAt(cursor)
      $('#cursor-status').textContent = `行 ${line.number}，列 ${cursor-line.from+1}`
    }
  })]
const editor = new EditorView({
  doc: active().source,
  extensions: editorExtensions,
  parent: $('#editor'),
})

const styleArticle = initPreview($('#style-preview-host'))
let styleDraftSettings, initialStyleSource = '', styleTimer
const cssEditorExtensions = [basicSetup, css(), EditorView.lineWrapping, EditorView.contentAttributes.of({'aria-label':'自定义 CSS 源代码',spellcheck:'false'}), EditorView.updateListener.of(update => {
  if (!update.docChanged) return
  clearTimeout(styleTimer)
  $('#save-style').disabled = true
  styleTimer = setTimeout(previewStyle, 180)
})]
const cssEditor = new EditorView({doc:'',extensions:cssEditorExtensions,parent:$('#css-editor')})

function loadStyleSource(id, preserveColor = false) {
  styleDraftSettings = {...settings(), theme:id}
  const template = themes.find(t => t.id === id)
  if (template && !preserveColor) for (const key of ['color','fontSize','lineHeight','font']) if (template[key] !== undefined) styleDraftSettings[key] = template[key]
  renderArticle(styleArticle, active().source, styleDraftSettings, active().images, active().basePath)
  const source = id === 'custom' ? settings().customCSS : editableThemeCSS(styleArticle)
  initialStyleSource = source
  cssEditor.setState(EditorState.create({doc:source,extensions:cssEditorExtensions}))
  $('#style-base').value = id
  previewStyle()
  cssEditor.requestMeasure()
}

function openStyleEditor() {
  $('#style-custom-option').disabled = !settings().customCSS
  $('#style-dialog').showModal()
  loadStyleSource(settings().theme, true)
}

function closeStyleEditor() {
  if (cssEditor.state.doc.toString() !== initialStyleSource && !confirm('关闭后将放弃尚未保存的 CSS 修改，确定关闭？')) return
  clearTimeout(styleTimer)
  $('#style-dialog').close()
}

function previewStyle() {
  clearTimeout(styleTimer)
  const source = cssEditor.state.doc.toString()
  try {
    if (!source.trim()) throw new Error('请先填写 CSS 样式。')
    compileCustomCSS(source)
    renderArticle(styleArticle, active().source, {...styleDraftSettings,theme:'custom',customCSS:source}, active().images, active().basePath)
    $('#style-error').textContent = ''
    $('#save-style').disabled = false
    return true
  } catch (error) {
    $('#style-error').textContent = error.message
    $('#save-style').disabled = true
    return false
  }
}

function saveStyle() {
  if (!previewStyle()) return
  Object.assign(settings(),{theme:'custom',customCSS:cssEditor.state.doc.toString(),color:styleDraftSettings.color,fontSize:styleDraftSettings.fontSize,lineHeight:styleDraftSettings.lineHeight,font:styleDraftSettings.font})
  initialStyleSource = settings().customCSS
  $('#style-dialog').close()
  render(); scheduleSave()
  toast('自定义样式已保存到当前文章')
}

$('#style-base').addEventListener('change',event=>{
  if(cssEditor.state.doc.toString()!==initialStyleSource&&!confirm('切换模板会放弃未保存的 CSS 修改，确定切换？')){event.target.value=styleDraftSettings.theme;return}
  loadStyleSource(event.target.value)
})
$('#style-dialog').addEventListener('cancel',event=>{event.preventDefault();closeStyleEditor()})

function toast(message, error = false) {
  clearTimeout(toastTimer)
  $('#toast').textContent = message
  $('#toast').classList.toggle('error', error)
  $('#toast').hidden = false
  toastTimer = setTimeout(() => { $('#toast').hidden = true }, error ? 6500 : 3500)
}

async function persist() {
  clearTimeout(saveTimer)
  saveTimer = undefined
  try {
    await saveWorkspace(structuredClone(state))
    storageAvailable = true
    $('#save-status').innerHTML = `${icon('CheckCheck', 12)} 已保存至本地`
  } catch {
    storageAvailable = false
    $('#save-status').textContent = '未能保存 · 请导出备份'
    toast('本地保存失败，内容仍在编辑器中。请导出文章或备份草稿。', true)
  }
}

function scheduleSave() {
  $('#save-status').textContent = '保存中…'
  clearTimeout(saveTimer)
  saveTimer = setTimeout(persist, 500)
}

function renderDrafts() {
  $('#draft-count').textContent = state.drafts.length
  $('#draft-list').innerHTML = state.drafts.map(d => `<div class="draft-item ${d.id === state.active ? 'selected' : ''}"><button class="draft-select" data-draft="${d.id}" ${d.id===state.active?'aria-current="true"':''}>${icon('FileText',17)}<span><strong>${escapeHTML(d.name || articleTitle(d.source))}</strong><small>${new Date(d.updated).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'})} <i>·</i> ${d.source.replace(/\s/g,'').length.toLocaleString()} 字符</small></span></button><button class="draft-more icon-btn" data-delete="${d.id}" aria-label="删除 ${escapeHTML(d.name || articleTitle(d.source))}" title="删除草稿">${icon('Trash2',13)}</button></div>`).join('')
}

function render() {
  clearTimeout(renderTimer)
  const s = settings(), p = platforms[s.platform]
  const warnings = renderArticle(article, active().source, s, active().images, active().basePath)
  document.documentElement.style.setProperty('--article-accent', s.color)
  $('#custom-theme-card').hidden = !s.customCSS
  document.querySelectorAll('[data-platform]').forEach(b=>{const selected=b.dataset.platform===s.platform;b.classList.toggle('selected',selected);b.setAttribute('aria-selected',selected)})
  document.querySelectorAll('[data-theme]').forEach(b=>{const selected=b.dataset.theme===s.theme;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)})
  document.querySelectorAll('[data-color]').forEach(b=>{const selected=b.dataset.color===s.color;b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',selected)})
  for (const key of ['font','fontSize','lineHeight']) $('#'+key).value=s[key]
  for (const key of ['includeTitle','footnotes','remote']) $('#'+key).checked=s[key]
  $('#footnotes-row').hidden=s.platform!=='wechat'
  $('#custom-color').value=s.color
  $('#color-label').textContent=s.color.toUpperCase()
  $('#preview-platform').textContent=p.short
  $('#paper-label').innerHTML=`${platformMark(s.platform)} ${p.name}`
  $('#paper-tag').textContent=s.platform==='juejin'?'Markdown 阅读预览':'文章排版预览'
  $('#copy-primary span').textContent=s.platform==='juejin'?'复制 Markdown':'复制排版'
  $('#word-count').textContent=`${active().source.replace(/\s/g,'').length.toLocaleString()} 字符 · 约 ${Math.max(1,Math.ceil(active().source.replace(/\s/g,'').length/400))} 分钟阅读`
  $('#warnings').hidden=!warnings.length
  $('#warnings').textContent=warnings.join('\n')
  document.title=`${active().name || articleTitle(active().source)} · MDInk`
  renderDrafts()
}

function switchDraft(id) {
  active().source=editor.state.doc.toString()
  state.active=id
  editor.setState(EditorState.create({doc:active().source,extensions:editorExtensions}))
  document.body.classList.remove('show-drafts')
  editor.scrollDOM.scrollTop=0
  $('#preview-scroll').scrollTop=0
  render(); scheduleSave()
}

function newDraft() {
  const d=draft()
  state.drafts.unshift(d)
  switchDraft(d.id)
  editor.focus()
}

const formats = {
  bold:['**','**','加粗文字'], italic:['*','*','斜体文字'], heading:['\n## ','\n','二级标题'], quote:['\n> ','\n','引用内容'], list:['\n- ','\n','列表项目'], link:['[','](https://example.com)','链接文字'], code:['\n```python\n','\n```\n','print("Hello, world!")'], table:['\n','\n','| 标题 | 标题 |\n| --- | --- |\n| 内容 | 内容 |'],
}
function insertFormat(key) {
  const [before,after,placeholder]=formats[key]
  const {from,to}=editor.state.selection.main
  const text=editor.state.sliceDoc(from,to)||placeholder
  editor.dispatch({changes:{from,to,insert:before+text+after},selection:{anchor:from+before.length,head:from+before.length+text.length}})
  editor.focus()
}

function download(content,filename,type) {
  const url=URL.createObjectURL(new Blob([content],{type}))
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove()
  setTimeout(()=>URL.revokeObjectURL(url),10000)
}

function markdownOutput() { return outputMarkdown(active().source, settings().includeTitle) }
function htmlOutput() { render(); return inlineHTML(article) }

async function copyContent(mode) {
  render()
  const isMarkdown=mode==='markdown'||(mode==='primary'&&settings().platform==='juejin')
  const rich=mode==='primary'&&!isMarkdown
  const html=rich||mode==='html'?inlineHTML(article):''
  const text=isMarkdown?markdownOutput():mode==='html'?html:article.innerText
  try {
    if (rich && navigator.clipboard?.write && typeof ClipboardItem!=='undefined') {
      await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([text],{type:'text/plain'})})])
    } else if (!rich && navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
    else throw new Error('Use legacy clipboard')
  } catch {
    const handler=event=>{
      event.preventDefault();event.clipboardData.setData('text/plain',text)
      if(rich)event.clipboardData.setData('text/html',html)
    }
    document.addEventListener('copy',handler)
    let copied=false
    try { copied=document.execCommand('copy') } catch { copied=false } finally { document.removeEventListener('copy',handler) }
    if(!copied){toast('复制未成功，请允许剪贴板权限，或导出 HTML 后打开并复制正文。',true);return}
  }
  toast(isMarkdown?'Markdown 已复制，可粘贴到掘金编辑器':mode==='html'?'HTML 源码已复制':`排版已复制，可粘贴到${platforms[settings().platform].short}正文`)
}

async function readImage(file) {
  if(file.size>8*1024*1024)throw new Error(`图片「${file.name}」超过 8 MB，请压缩后重试。`)
  if(!/\.(png|jpe?g|gif|webp)$/i.test(file.name))throw new Error('仅支持 PNG、JPG、GIF、WebP 图片。')
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer())
  const valid=(bytes[0]===0x89&&bytes[1]===0x50&&bytes[2]===0x4e&&bytes[3]===0x47)||(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)||(bytes[0]===0x47&&bytes[1]===0x49&&bytes[2]===0x46)||(bytes[0]===0x52&&bytes[1]===0x49&&bytes[2]===0x46&&bytes[8]===0x57&&bytes[9]===0x45&&bytes[10]===0x42&&bytes[11]===0x50)
  if(!valid)throw new Error(`「${file.name}」不是有效的受支持图片。`)
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)})
}

async function importFiles(files, insertImages=false) {
  try {
    const list=[...files].filter(f=>!/(^|\/)\./.test(f.webkitRelativePath||f.name))
    const markdownFiles=list.filter(f=>/\.(md|markdown|txt)$/i.test(f.name))
    const imageFiles=list.filter(f=>/\.(png|jpe?g|gif|webp)$/i.test(f.name))
    if(list.reduce((sum,f)=>sum+f.size,0)>60*1024*1024)throw new Error('单次导入总大小不能超过 60 MB，请分批导入。')
    const images={}, notes=[]
    for(const file of imageFiles) {
      try { images[imageKey(file.webkitRelativePath||file.name)]=await readImage(file) } catch(error) { notes.push(error.message) }
    }
    const imported=[]
    for(const file of markdownFiles) {
      if(file.size>2*1024*1024){notes.push(`「${file.name}」超过 2 MB，已跳过。`);continue}
      const d=draft(await file.text(),file.name.replace(/\.(md|markdown|txt)$/i,''))
      d.images={...images};d.basePath=(file.webkitRelativePath||'').split('/').slice(0,-1).join('/')
      imported.push(d)
    }
    if(imported.length) {
      state.drafts.unshift(...imported)
      switchDraft(imported[0].id)
    } else if(Object.keys(images).length) {
      Object.assign(active().images,images)
      if(insertImages) {
        const text=Object.keys(images).map(name=>`\n![${name.split('/').pop().replace(/\.[^.]+$/,'')}](<${name}>)\n`).join('')
        editor.dispatch(editor.state.replaceSelection(text))
      }
      render();scheduleSave()
    } else if(!notes.length)throw new Error('请选择 Markdown 文件或 PNG、JPG、GIF、WebP 图片。')
    if(notes.length)toast(notes.join(' '),true)
    else toast(imported.length?`已导入 ${imported.length} 篇文章、${Object.keys(images).length} 张图片`:`已导入 ${Object.keys(images).length} 张本地图片`)
  } catch(error) {toast(`导入失败：${error.message}`,true)}
}

async function restoreBackup(file) {
  try {
    if(file.size>100*1024*1024)throw new Error('备份文件超过 100 MB')
    const backup=JSON.parse(await file.text())
    if(!['mdink-backup-v1','draftbridge-backup-v1','inkpost-backup-v1'].includes(backup.format)||!Array.isArray(backup.drafts)||!backup.drafts.length||backup.drafts.length>200)throw new Error('不是有效的MDInk备份')
    const restored=backup.drafts.map(d=>{
      if(typeof d.source!=='string'||d.source.length>3*1024*1024)throw new Error('备份正文格式无效或过大')
      const next=draft(d.source,typeof d.name==='string'?d.name.slice(0,120):'')
      next.settings=cleanSettings(d.settings)
      if (next.settings.customCSS) compileCustomCSS(next.settings.customCSS)
      next.basePath=typeof d.basePath==='string'?d.basePath:''
      for(const [key,value] of Object.entries(d.images||{})) {
        if(typeof value!=='string'||!/^data:image\/(png|jpeg|gif|webp);base64,/i.test(value)||value.length>12*1024*1024)throw new Error('备份包含无效图片')
        next.images[imageKey(key)]=value
      }
      return next
    })
    state.drafts.unshift(...restored);switchDraft(restored[0].id)
    toast(`已恢复 ${restored.length} 篇文章，现有草稿仍保留`)
  } catch(error) {toast(`恢复失败：${error.message}`,true)}
}

function setPreviewWidth(narrow) {
  $('#paper').classList.toggle('narrow',narrow)
  for(const [id,value] of [['narrow-button',narrow],['wide-button',!narrow]]) {$('#'+id).classList.toggle('active',value);$('#'+id).setAttribute('aria-pressed',value)}
}

const actions={
  new:newDraft,
  import:()=>$('#file-input').click(),folder:()=>$('#folder-input').click(),image:()=>$('#image-input').click(),restore:()=>$('#restore-input').click(),
  undo:()=>{undo(editor);editor.focus()},redo:()=>{redo(editor);editor.focus()},'select-all':()=>{editor.dispatch({selection:{anchor:0,head:editor.state.doc.length}});editor.focus()},
  rename:()=>{const name=prompt('文章名称',active().name||articleTitle(active().source));if(name?.trim()){active().name=name.trim().slice(0,120);render();scheduleSave()}},
  sidebar:()=>document.body.classList.toggle(matchMedia('(max-width:800px)').matches?'show-drafts':'hide-drafts'),
  settings:()=>document.body.classList.toggle('hide-settings'),
  'mobile-preview':()=>{mobilePreview=!mobilePreview;document.body.classList.toggle('show-mobile-preview',mobilePreview)},
  'scroll-sync':()=>{scrollSync=!scrollSync;$('#sync-button').classList.toggle('active',scrollSync);$('#sync-button').setAttribute('aria-pressed',scrollSync)},
  wide:()=>setPreviewWidth(false),narrow:()=>setPreviewWidth(true),
  copy:()=>copyContent('primary'),'copy-html':()=>copyContent('html'),
  'export-html':()=>{const title=articleTitle(active().source);download(`<!doctype html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https: http:; style-src 'unsafe-inline'; base-uri 'none'"><title>${escapeHTML(title)}</title></head><body style="margin:0 auto;max-width:780px;background:#fff">${htmlOutput()}</body></html>`,safeName(title)+'.html','text/html;charset=utf-8');toast('排版 HTML 已导出，可离线打开')},
  'export-md':()=>{download(markdownOutput(),safeName(articleTitle(active().source))+'.md','text/markdown;charset=utf-8');toast('Markdown 已导出，图片路径保持原样，发布时请上传图片')},
  backup:()=>{download(JSON.stringify({format:'mdink-backup-v1',drafts:state.drafts},null,2),`MDInk草稿备份-${new Date().toLocaleDateString('sv-SE')}.json`,'application/json');toast('草稿备份已导出，包含本地图片和排版设置')},
  reset:()=>{const platform=settings().platform,p=platforms[platform];active().settings={...defaults,customCSS:settings().customCSS,platform,color:p.color,fontSize:p.size};render();scheduleSave()},
  'edit-style':openStyleEditor,'close-style':closeStyleEditor,'save-style':saveStyle,'export-css':()=>download(cssEditor.state.doc.toString(),safeName(articleTitle(active().source))+'-样式.css','text/css;charset=utf-8'),
  help:()=>$('#help-dialog').showModal(),'close-help':()=>$('#help-dialog').close(),
}

document.addEventListener('click',event=>{
  const button=event.target.closest('button')
  if(!button)return
  if(button.dataset.action){actions[button.dataset.action]?.();document.querySelectorAll('details[open]').forEach(d=>d.open=false)}
  if(button.dataset.format)insertFormat(button.dataset.format)
  if(button.dataset.platform){const key=button.dataset.platform;Object.assign(settings(),{platform:key,color:platforms[key].color,fontSize:platforms[key].size});render();scheduleSave()}
  if(button.dataset.theme){const theme=themes.find(t=>t.id===button.dataset.theme);settings().theme=button.dataset.theme;if(theme)for(const key of ['color','fontSize','lineHeight','font'])if(theme[key]!==undefined)settings()[key]=theme[key];render();scheduleSave()}
  if(button.dataset.styleTarget!==undefined){const target=styleTargets[Number(button.dataset.styleTarget)];if(target){const text=`\n\n${target[1]} {\n  /* ${target[2]} */\n}\n`;const end=cssEditor.state.doc.length;cssEditor.dispatch({changes:{from:end,insert:text},selection:{anchor:end+text.indexOf('  /*')}});cssEditor.focus()}}
  if(button.dataset.color){settings().color=button.dataset.color;render();scheduleSave()}
  if(button.dataset.draft)switchDraft(button.dataset.draft)
  if(button.dataset.delete&&confirm('删除这篇本地草稿？删除后无法撤销，建议先导出备份。')){
    state.drafts=state.drafts.filter(d=>d.id!==button.dataset.delete)
    if(!state.drafts.length)state.drafts.push(draft())
    if(state.active===button.dataset.delete)switchDraft(state.drafts[0].id)
    else {render();scheduleSave()}
  }
})
document.addEventListener('pointerdown',event=>{
  document.querySelectorAll('details[open]').forEach(d=>{if(!d.contains(event.target))d.open=false})
  if(!event.target.closest('.drafts-panel, [data-action="sidebar"]'))document.body.classList.remove('show-drafts')
})
document.addEventListener('keydown',event=>{
  if($('#style-dialog').open){if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='s'){event.preventDefault();saveStyle()}return}
  if(event.key==='Escape'){document.querySelectorAll('details[open]').forEach(d=>d.open=false);document.body.classList.add('hide-settings');document.body.classList.remove('show-drafts')}
  if((event.metaKey||event.ctrlKey)&&['o','s'].includes(event.key.toLowerCase())){event.preventDefault();if(event.key.toLowerCase()==='o')actions.import();else persist()}
})
document.querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',()=>{
  const key=el.dataset.setting
  settings()[key]=el.type==='checkbox'?el.checked:['fontSize','lineHeight'].includes(key)?Number(el.value):el.value
  render();scheduleSave()
}))
$('#custom-color').addEventListener('input',event=>{settings().color=event.target.value;render();scheduleSave()})
for(const [id,insert]of[['file-input',false],['folder-input',false],['image-input',true]])$('#'+id).addEventListener('change',event=>{importFiles(event.target.files,insert);event.target.value=''})
$('#restore-input').addEventListener('change',event=>{if(event.target.files[0])restoreBackup(event.target.files[0]);event.target.value=''})

let dragDepth=0
document.addEventListener('dragenter',event=>{if(event.dataTransfer.types.includes('Files')){event.preventDefault();dragDepth++;$('#drop-overlay').hidden=false}})
document.addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;$('#drop-overlay').hidden=true}})
document.addEventListener('dragover',event=>{if(event.dataTransfer.types.includes('Files'))event.preventDefault()})
document.addEventListener('drop',event=>{if(event.dataTransfer.types.includes('Files')){event.preventDefault();dragDepth=0;$('#drop-overlay').hidden=true;importFiles(event.dataTransfer.files)}})

function syncScroll(from,to) {
  if(!scrollSync||syncingScroll)return
  syncingScroll=true
  const range=from.scrollHeight-from.clientHeight
  to.scrollTop=range?from.scrollTop/range*(to.scrollHeight-to.clientHeight):0
  requestAnimationFrame(()=>{syncingScroll=false})
}
editor.scrollDOM.addEventListener('scroll',()=>syncScroll(editor.scrollDOM,$('#preview-scroll')))
$('#preview-scroll').addEventListener('scroll',()=>syncScroll($('#preview-scroll'),editor.scrollDOM))
window.addEventListener('beforeunload',event=>{if(!storageAvailable||saveTimer||($('#style-dialog').open&&cssEditor.state.doc.toString()!==initialStyleSource)){event.preventDefault();event.returnValue='';persist()}})
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()})

render()
if(matchMedia('(max-width:1020px)').matches)document.body.classList.add('hide-settings')
if(!storageAvailable)toast('当前浏览器未允许本地存储，请及时导出文章或备份草稿。',true)
else persist()
