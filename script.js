let currentId = null;
let currentCateId = "all";
let search = "";
let layoutMode = 2;
let renderTimeout;
let currentTheme = localStorage.getItem("theme") || "dark-blue";

marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    headerIds: true,
    mangle: false
});

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("confirmModal");
        const messageEl = document.getElementById("confirmMessage");
        const cancelBtn = document.getElementById("confirmCancel");
        const okBtn = document.getElementById("confirmOk");
        
        messageEl.textContent = message;
        modal.style.display = "flex";
        
        const handleCancel = () => {
            modal.style.display = "none";
            cancelBtn.removeEventListener("click", handleCancel);
            okBtn.removeEventListener("click", handleOk);
            resolve(false);
        };
        
        const handleOk = () => {
            modal.style.display = "none";
            cancelBtn.removeEventListener("click", handleCancel);
            okBtn.removeEventListener("click", handleOk);
            resolve(true);
        };
        
        cancelBtn.addEventListener("click", handleCancel);
        okBtn.addEventListener("click", handleOk);
    });
}

function showAlert(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById("alertModal");
        const messageEl = document.getElementById("alertMessage");
        const okBtn = document.getElementById("alertOk");
        
        messageEl.textContent = message;
        modal.style.display = "flex";
        
        const handleOk = () => {
            modal.style.display = "none";
            okBtn.removeEventListener("click", handleOk);
            resolve();
        };
        
        okBtn.addEventListener("click", handleOk);
    });
}

function showPrompt(title, message, placeholder = '', icon = 'fa-pencil') {
    return new Promise((resolve) => {
        const modal = document.getElementById("promptModal");
        const titleEl = document.getElementById("promptTitle");
        const messageEl = document.getElementById("promptMessage");
        const inputEl = document.getElementById("promptInput");
        const iconEl = document.getElementById("promptIcon");
        const okBtn = document.getElementById("promptOk");
        const cancelBtn = document.getElementById("promptCancel");
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        inputEl.value = '';
        inputEl.placeholder = placeholder;
        iconEl.className = `fa ${icon} text-blue-500 text-3xl`;
        modal.style.display = "flex";
        inputEl.focus();
        
        const handleOk = () => {
            modal.style.display = "none";
            okBtn.removeEventListener("click", handleOk);
            cancelBtn.removeEventListener("click", handleCancel);
            resolve(inputEl.value || null);
        };
        
        const handleCancel = () => {
            modal.style.display = "none";
            okBtn.removeEventListener("click", handleOk);
            cancelBtn.removeEventListener("click", handleCancel);
            resolve(null);
        };
        
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        okBtn.addEventListener("click", handleOk);
        cancelBtn.addEventListener("click", handleCancel);
        inputEl.addEventListener("keydown", handleKeydown);
    });
}

function updatePreview() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(async () => {
        const textarea = document.getElementById('editor');
        const preview = document.getElementById('preview');
        if (!textarea || !preview) return;
        
        const rawMarkdown = textarea.value;
        
        if (window.marked && typeof window.marked.parse === 'function') {
            try {
                let rawHtml = await window.marked.parse(rawMarkdown);
                const cleanHtml = DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
                preview.innerHTML = cleanHtml;
                
                preview.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            } catch (e) {
                console.error('Markdown parse error:', e);
                preview.innerHTML = rawMarkdown.replace(/\n/g, '<br>');
            }
        } else {
            preview.innerHTML = rawMarkdown.replace(/\n/g, '<br>');
        }
    }, 30);
}

function setLayout(mode) {
    const editorPanel = document.getElementById('editorPanel');
    const previewPanel = document.getElementById('previewPanel');
    const btnEditor = document.getElementById('layoutEditor');
    const btnBoth = document.getElementById('layoutBoth');
    const btnPreview = document.getElementById('layoutPreview');
    
    btnEditor.style.backgroundColor = 'transparent';
    btnEditor.style.color = 'var(--text-muted)';
    btnBoth.style.backgroundColor = 'transparent';
    btnBoth.style.color = 'var(--text-muted)';
    btnPreview.style.backgroundColor = 'transparent';
    btnPreview.style.color = 'var(--text-muted)';
    
    btnEditor.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
    btnEditor.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    btnBoth.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
    btnBoth.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    btnPreview.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
    btnPreview.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    
    if (mode === 0) {
        editorPanel.style.display = 'flex';
        previewPanel.classList.add('hidden');
        btnEditor.style.backgroundColor = 'var(--accent)';
        btnEditor.style.color = 'white';
        btnEditor.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnEditor.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    } else if (mode === 1) {
        editorPanel.style.display = 'flex';
        previewPanel.classList.remove('hidden');
        btnBoth.style.backgroundColor = 'var(--accent)';
        btnBoth.style.color = 'white';
        btnBoth.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnBoth.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    } else {
        editorPanel.style.display = 'none';
        previewPanel.classList.remove('hidden');
        btnPreview.style.backgroundColor = 'var(--accent)';
        btnPreview.style.color = 'white';
        btnPreview.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnPreview.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    }
    layoutMode = mode;
    updatePreview();
}

function replaceSelectedText(replacement, selectReplacement = false) {
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let newText;
    
    if (typeof replacement === 'function') {
        newText = replacement(selected);
    } else {
        newText = replacement;
    }
    
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + newText + after;
    
    if (selectReplacement && typeof newText === 'string') {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + newText.length;
    } else {
        const newCursorPos = start + newText.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
    }
    textarea.focus();
    updatePreview();
}

function wrapSelection(prefix, suffix, defaultMiddle = 'text') {
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    let content = selected;
    if (content === '') {
        content = defaultMiddle;
    }
    const wrapped = prefix + content + suffix;
    replaceSelectedText(wrapped, true);
    
    if (selected === '' && wrapped.includes(defaultMiddle)) {
        const newStart = start + prefix.length;
        const newEnd = newStart + defaultMiddle.length;
        textarea.selectionStart = newStart;
        textarea.selectionEnd = newEnd;
        textarea.focus();
    }
}

function addPrefixToLines(prefix) {
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, start);
    const selectedText = textarea.value.substring(start, end);
    const textAfter = textarea.value.substring(end);
    
    if (selectedText.length === 0) {
        const lineStart = textBefore.lastIndexOf('\n') + 1;
        const currentLine = textarea.value.substring(lineStart, end);
        const newLine = prefix + currentLine;
        const newValue = textarea.value.substring(0, lineStart) + newLine + textarea.value.substring(end);
        textarea.value = newValue;
        const newCursor = lineStart + newLine.length;
        textarea.selectionStart = newCursor;
        textarea.selectionEnd = newCursor;
    } else {
        const lines = selectedText.split(/\n/);
        const newLines = lines.map(line => prefix + line);
        const newSelected = newLines.join('\n');
        const newValue = textBefore + newSelected + textAfter;
        textarea.value = newValue;
        textarea.selectionStart = start;
        textarea.selectionEnd = start + newSelected.length;
    }
    textarea.focus();
    updatePreview();
}

function addOrderedList() {
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = textarea.value.substring(0, start);
    const selectedText = textarea.value.substring(start, end);
    const textAfter = textarea.value.substring(end);
    
    if (selectedText.length === 0) {
        addPrefixToLines('1. ');
        return;
    }
    
    const lines = selectedText.split(/\n/);
    const newLines = lines.map((line, idx) => `${idx + 1}. ${line}`);
    const newSelected = newLines.join('\n');
    textarea.value = textBefore + newSelected + textAfter;
    textarea.selectionStart = start;
    textarea.selectionEnd = start + newSelected.length;
    textarea.focus();
    updatePreview();
}

async function insertLink() {
    const url = await showPrompt('插入链接', '请输入链接地址', 'https://', 'fa-link');
    if (!url) return;
    let text = await showPrompt('插入链接', '请输入链接文字', '链接描述', 'fa-file-text-o');
    if (!text) text = url;
    const linkMarkdown = `[${text}](${url})`;
    replaceSelectedText(linkMarkdown, true);
}

async function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const alt = await showPrompt('插入图片', '请输入图片描述', '图片描述', 'fa-image');
        
        try {
            const formData = new FormData();
            formData.append('image', file);
            
            const res = await fetch('/api/upload/image', {
                method: 'POST',
                body: formData
            });
            
            const result = await res.json();
            if (result.success) {
                const imageMarkdown = `![${alt || 'image'}](${result.url})`;
                replaceSelectedText(imageMarkdown, true);
            } else {
                await showAlert('图片上传失败: ' + result.error);
            }
        } catch (error) {
            console.error('图片上传失败:', error);
            await showAlert('图片上传失败，请重试');
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

async function insertCodeBlock() {
    const lang = await showPrompt('插入代码块', '请输入代码语言 (留空自动识别)', 'javascript', 'fa-code');
    let codePlaceholder = '// 你的代码';
    if (lang === 'python') {
        codePlaceholder = '# 你的代码';
    } else if (lang === 'bash' || lang === 'shell') {
        codePlaceholder = '# 你的命令';
    } else if (lang === 'html') {
        codePlaceholder = '<!-- 你的 HTML -->';
    } else if (lang === 'css') {
        codePlaceholder = '/* 你的 CSS */';
    } else if (lang === 'sql') {
        codePlaceholder = '-- 你的 SQL';
    }
    let block = '```' + (lang || '') + '\n' + codePlaceholder + '\n```';
    replaceSelectedText(block, true);
    
    const textarea = document.getElementById('editor');
    const start = textarea.selectionStart - (codePlaceholder.length + 2);
    const end = start + codePlaceholder.length;
    textarea.selectionStart = start;
    textarea.selectionEnd = end;
    textarea.focus();
}

function handleToolAction(action) {
    switch(action) {
        case 'h1': addPrefixToLines('# '); break;
        case 'h2': addPrefixToLines('## '); break;
        case 'h3': addPrefixToLines('### '); break;
        case 'bold': wrapSelection('**', '**', '粗体文本'); break;
        case 'italic': wrapSelection('*', '*', '斜体文本'); break;
        case 'strikethrough': wrapSelection('~~', '~~', '删除线文本'); break;
        case 'ulist': addPrefixToLines('- '); break;
        case 'olist': addOrderedList(); break;
        case 'link': insertLink(); break;
        case 'image': insertImage(); break;
        case 'codeblock': insertCodeBlock(); break;
        case 'quote': addPrefixToLines('> '); break;
        case 'hr': replaceSelectedText('\n---\n'); break;
        case 'table': replaceSelectedText('\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 值1 | 值2 | 值3 |\n'); break;
        case 'code': wrapSelection('`', '`', '代码'); break;
        case 'task': addPrefixToLines('- [ ] '); break;
        default: break;
    }
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const btnDark = document.getElementById('theme-dark');
    const btnLight = document.getElementById('theme-light');
    
    btnDark.style.backgroundColor = 'transparent';
    btnDark.style.color = 'var(--text-muted)';
    btnDark.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
    btnDark.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    
    btnLight.style.backgroundColor = 'transparent';
    btnLight.style.color = 'var(--text-muted)';
    btnLight.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
    btnLight.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    
    if (theme === 'dark-blue') {
        btnDark.style.backgroundColor = 'var(--accent)';
        btnDark.style.color = 'white';
        btnDark.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnDark.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    } else {
        btnLight.style.backgroundColor = 'var(--accent)';
        btnLight.style.color = 'white';
        btnLight.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnLight.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    }
}

async function init() {
    setTheme(currentTheme);
    
    await loadCate();
    await loadNotes();
    bindEvents();
    
    const editor = document.getElementById('editor');
    editor.addEventListener('input', function() {
        autoSave();
        updatePreview();
    });
    
    editor.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const value = editor.value;
            editor.value = value.substring(0, start) + '\t' + value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 1;
            updatePreview();
            return;
        }
        
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            switch(e.key.toLowerCase()) {
                case 'b': handleToolAction('bold'); break;
                case 'i': handleToolAction('italic'); break;
                case 's': handleToolAction('strikethrough'); break;
                case '1': handleToolAction('h1'); break;
                case '2': handleToolAction('h2'); break;
                case '3': handleToolAction('h3'); break;
                case 'l': handleToolAction('ulist'); break;
                case 'o': handleToolAction('olist'); break;
                case 't': handleToolAction('task'); break;
                case 'k': handleToolAction('link'); break;
                case 'g': handleToolAction('image'); break;
                case 'q': handleToolAction('quote'); break;
                case 'e': handleToolAction('table'); break;
                case '-': handleToolAction('hr'); break;
                case '`': handleToolAction('code'); break;
            }
            if (e.shiftKey && e.key.toLowerCase() === 'c') {
                handleToolAction('codeblock');
            }
        }
    });
    
    const buttons = document.querySelectorAll('.tool-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            if (action) handleToolAction(action);
        });
    });
    
    updatePreview();
}

async function autoSave() {
    if (!currentId) return;
    const content = document.getElementById('editor').value;
    await fetch(`/api/notes/${currentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
}

async function loadNotes() {
    const list = document.getElementById("noteList");
    const empty = document.getElementById("empty");
    list.innerHTML = "";
    
    const url = new URL('/api/notes', window.location.origin);
    if (currentCateId !== "all") url.searchParams.set('cateId', currentCateId);
    if (search) url.searchParams.set('search', search);
    
    const res = await fetch(url);
    const notes = await res.json();
    
    if (!notes.length) { 
        empty.style.display = "block"; 
        return; 
    }
    empty.style.display = "none";
    
    notes.forEach(note => {
        const item = document.createElement("div");
        item.className = "note-item flex justify-between items-start";
        item.style.backgroundColor = 'var(--bg-secondary)';
        item.style.borderLeft = '3px solid transparent';
        item.draggable = true;
        item.dataset.noteId = note.id;
        item.onmouseover = function() { this.style.backgroundColor = 'var(--bg-card-hover)'; };
        item.onmouseout = function() { if (!this.classList.contains('active')) { this.style.backgroundColor = 'var(--bg-secondary)'; this.style.borderLeft = '3px solid transparent'; } };
        if (currentId === note.id) {
            item.classList.add("active");
            item.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))';
            item.style.borderLeft = '3px solid var(--accent)';
            item.onmouseout = function() { if (this.classList.contains('active')) { this.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))'; this.style.borderLeft = '3px solid var(--accent)'; } };
        }
        
        item.ondragstart = (e) => {
            e.dataTransfer.setData("text/plain", note.id);
            item.style.opacity = "0.5";
        };
        
        item.ondragend = () => {
            item.style.opacity = "1";
            document.querySelectorAll("[data-cate-id]").forEach(cate => {
                cate.classList.remove("drop-target");
            });
        };
        
        const iconDiv = document.createElement("div");
        iconDiv.className = "mr-2 flex-shrink-0";
        iconDiv.innerHTML = '<i class="fa fa-file-text-o" style="color: var(--text-muted);"></i>';
        
        const titleDiv = document.createElement("div");
        titleDiv.className = "font-medium truncate";
        titleDiv.style.color = 'var(--text-primary)';
        titleDiv.textContent = note.title;
        titleDiv.title = note.title;
        
        const metaDiv = document.createElement("div");
        metaDiv.className = "flex items-center gap-2 flex-wrap";
        
        const cateDiv = document.createElement("span");
        cateDiv.className = "text-xs px-2 py-0.5 rounded-full";
        cateDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
        cateDiv.style.color = 'var(--accent)';
        cateDiv.textContent = note.cateName || "未分类";
        
        const timeDiv = document.createElement("span");
        timeDiv.className = "text-xs";
        timeDiv.style.color = 'var(--text-muted)';
        timeDiv.textContent = formatTime(note.time);
        
        metaDiv.appendChild(cateDiv);
        metaDiv.appendChild(timeDiv);
        
        const textContent = document.createElement("div");
        textContent.className = "flex-1 min-w-0";
        textContent.appendChild(titleDiv);
        textContent.appendChild(metaDiv);
        
        const content = document.createElement("div");
        content.className = "flex items-start flex-1 min-w-0";
        content.appendChild(iconDiv);
        content.appendChild(textContent);
        content.onclick = () => openNote(note.id);
        
        const editBtn = document.createElement("button");
        editBtn.className = "p-1 opacity-0 pointer-events-none transition";
        editBtn.style.color = 'var(--text-muted)';
        editBtn.style.background = 'none';
        editBtn.style.border = 'none';
        editBtn.style.cursor = 'pointer';
        editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
        editBtn.onmouseover = function() { this.style.color = 'var(--accent)'; };
        editBtn.onmouseout = function() { this.style.color = 'var(--text-muted)'; };
        editBtn.onclick = async (e) => {
            e.stopPropagation();
            
            const input = document.createElement("input");
            input.type = "text";
            input.value = note.title;
            input.className = "font-medium w-full px-2 py-1 rounded outline-none";
            input.style.backgroundColor = 'var(--bg-secondary)';
            input.style.border = '1px solid var(--border-color)';
            input.style.color = 'var(--text-primary)';
            
            let isHandled = false;
            
            const handleEdit = async (save) => {
                if (isHandled) return;
                isHandled = true;
                
                input.removeEventListener("keydown", handleKeydown);
                input.removeEventListener("blur", handleBlur);
                input.removeEventListener("click", handleClick);
                
                if (save) {
                    const newTitle = input.value.trim();
                    if (newTitle && newTitle !== note.title) {
                        await fetch(`/api/notes/${note.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: newTitle })
                        });
                    }
                }
                await loadNotes();
            };
            
            const handleKeydown = (e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    handleEdit(true);
                } else if (e.key === "Escape") {
                    handleEdit(false);
                }
            };
            
            const handleBlur = () => {
                handleEdit(true);
            };
            
            const handleClick = (e) => {
                e.stopPropagation();
            };
            
            input.addEventListener("keydown", handleKeydown);
            input.addEventListener("blur", handleBlur);
            input.addEventListener("click", handleClick);
            
            titleDiv.replaceWith(input);
            input.focus();
            const len = input.value.length;
            input.setSelectionRange(len, len);
        };
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "p-1 opacity-0 pointer-events-none transition";
        deleteBtn.style.color = 'var(--text-muted)';
        deleteBtn.style.background = 'none';
        deleteBtn.style.border = 'none';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.innerHTML = '<i class="fa fa-trash-o"></i>';
        deleteBtn.onmouseover = function() { this.style.color = '#ef4444'; };
        deleteBtn.onmouseout = function() { this.style.color = 'var(--text-muted)'; };
        deleteBtn.onclick = async (e) => {
            e.stopPropagation();
            const confirmed = await showConfirm("确定要删除这篇笔记吗？");
            if (!confirmed) return;
            
            await fetch(`/api/notes/${note.id}`, {
                method: 'DELETE'
            });
            
            if (currentId === note.id) {
                currentId = null;
                document.getElementById('editor').value = '';
            }
            
            await loadNotes();
        };
        
        const actions = document.createElement("div");
        actions.className = "flex gap-1";
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(content);
        item.appendChild(actions);
        item.addEventListener("mouseenter", () => {
            editBtn.style.opacity = "1";
            editBtn.style.pointerEvents = "auto";
            deleteBtn.style.opacity = "1";
            deleteBtn.style.pointerEvents = "auto";
        });
        item.addEventListener("mouseleave", () => {
            editBtn.style.opacity = "0";
            editBtn.style.pointerEvents = "none";
            deleteBtn.style.opacity = "0";
            deleteBtn.style.pointerEvents = "none";
        });
        list.appendChild(item);
    });
}

function formatTime(timeStr) {
    const date = new Date(timeStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function openNote(id) {
    await autoSave();
    currentId = id;
    const res = await fetch(`/api/notes/${id}`);
    const note = await res.json();
    document.getElementById('editor').value = note.content || '';
    updatePreview();
    await loadNotes();
}

async function newNote() {
    await autoSave();
   
    const cateId = currentCateId !== "all" ? currentCateId : null;
    const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新笔记', content: '', cateId: cateId })
    });
    const data = await res.json();
    currentId = data.id;
    document.getElementById('editor').value = '';
    await loadNotes();
}

async function newCategory() {
    const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '新分类' })
    });
    const data = await res.json();
    await loadCate();
    selectCategory(data.id);
}

async function loadCate() {
    const list = document.getElementById("categoryList");
    const items = list.querySelectorAll("[data-cate-id]:not([data-cate-id='all'])");
    items.forEach(i => i.remove());
    
    const res = await fetch('/api/categories');
    const categories = await res.json();
    
    categories.forEach(cat => {
        const d = document.createElement("div");
        d.className = "p-2 rounded cursor-pointer flex items-center justify-between transition";
        d.style.color = 'var(--text-primary)';
        d.style.backgroundColor = 'transparent';
        d.onmouseover = function() { this.style.backgroundColor = 'var(--bg-card-hover)'; };
        d.onmouseout = function() { if (!this.classList.contains('active')) this.style.backgroundColor = 'transparent'; };
        if (currentCateId === String(cat.id)) {
            d.classList.add("active");
            d.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))';
            d.onmouseout = function() { if (this.classList.contains('active')) this.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))'; };
        }
        d.dataset.cateId = cat.id;
        
        const nameDiv = document.createElement("div");
        nameDiv.className = "flex items-center flex-1";
        nameDiv.innerHTML = `<i class="fa fa-folder-o mr-2" style="color: var(--accent);"></i>${cat.name}`;
        nameDiv.onclick = async () => { 
            selectCategory(cat.id);
        };
        d.appendChild(nameDiv);
        
        if (!cat.isDefault) {
            const actions = document.createElement("div");
            actions.className = "flex gap-1 opacity-0";
            
            const editBtn = document.createElement("button");
            editBtn.style.color = 'var(--text-muted)';
            editBtn.style.padding = '4px';
            editBtn.style.background = 'none';
            editBtn.style.border = 'none';
            editBtn.style.cursor = 'pointer';
            editBtn.innerHTML = '<i class="fa fa-pencil"></i>';
            editBtn.onmouseover = function() { this.style.color = 'var(--accent)'; };
            editBtn.onmouseout = function() { this.style.color = 'var(--text-muted)'; };
            editBtn.onclick = async (e) => {
                e.stopPropagation();
                const input = document.createElement("input");
                input.type = "text";
                input.value = cat.name;
                input.className = "font-medium w-full px-2 py-1 rounded outline-none";
                input.style.backgroundColor = 'var(--bg-secondary)';
                input.style.border = '1px solid var(--border-color)';
                input.style.color = 'var(--text-primary)';
                
                const handleEdit = async (save) => {
                    input.removeEventListener("keydown", handleKeydown);
                    input.removeEventListener("blur", handleBlur);
                    
                    if (save) {
                        const newName = input.value.trim();
                        if (newName && newName !== cat.name) {
                            const res = await fetch(`/api/categories/${cat.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: newName })
                            });
                            const data = await res.json();
                            if (data.success) {
                                await loadCate();
                                return;
                            }
                        }
                    }
                    nameDiv.innerHTML = `<i class="fa fa-folder-o mr-2"></i>${cat.name}`;
                };
                
                const handleKeydown = (e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleEdit(true);
                    } else if (e.key === "Escape") {
                        handleEdit(false);
                    }
                };
                
                const handleBlur = () => {
                    handleEdit(true);
                };
                
                input.addEventListener("keydown", handleKeydown);
                input.addEventListener("blur", handleBlur);
                
                nameDiv.innerHTML = '';
                nameDiv.appendChild(input);
                input.focus();
                const len = input.value.length;
                input.setSelectionRange(len, len);
            };
            
            const deleteBtn = document.createElement("button");
            deleteBtn.style.color = 'var(--text-muted)';
            deleteBtn.style.padding = '4px';
            deleteBtn.style.background = 'none';
            deleteBtn.style.border = 'none';
            deleteBtn.style.cursor = 'pointer';
            deleteBtn.innerHTML = '<i class="fa fa-trash-o"></i>';
            deleteBtn.onmouseover = function() { this.style.color = '#ef4444'; };
            deleteBtn.onmouseout = function() { this.style.color = 'var(--text-muted)'; };
            deleteBtn.onclick = async (e) => {
                e.stopPropagation();
                const confirmed = await showConfirm("确定要删除这个分类吗？该分类下的笔记将被移到未分类。");
                if (!confirmed) return;
                
                const res = await fetch(`/api/categories/${cat.id}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    if (currentCateId === String(cat.id)) {
                        selectCategory("all");
                    }
                    await loadCate();
                    await loadNotes();
                }
            };
            
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
            d.appendChild(actions);
            
            d.addEventListener("mouseenter", () => {
                actions.style.opacity = "1";
            });
            d.addEventListener("mouseleave", () => {
                actions.style.opacity = "0";
            });
        }
        
        d.ondragover = (e) => {
            e.preventDefault();
            d.classList.add("drop-target");
        };
        
        d.ondragleave = () => {
            d.classList.remove("drop-target");
        };
        
        d.ondrop = async (e) => {
            e.preventDefault();
            d.classList.remove("drop-target");
            
            const noteId = parseInt(e.dataTransfer.getData("text/plain"));
            if (noteId) {
                await fetch(`/api/notes/${noteId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cateId: cat.id })
                });
                await loadNotes();
            }
        };
        
        list.appendChild(d);
    });
}

function selectCategory(cateId) {
    const categoryItems = document.querySelectorAll("[data-cate-id]");
    categoryItems.forEach(item => {
        item.classList.remove("active");
        item.style.backgroundColor = 'transparent';
        item.onmouseout = function() { this.style.backgroundColor = 'transparent'; };
    });
    
    const activeItem = document.querySelector(`[data-cate-id="${cateId}"]`);
    if (activeItem) {
        activeItem.classList.add("active");
        activeItem.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))';
        activeItem.onmouseout = function() { if (this.classList.contains('active')) this.style.backgroundColor = 'var(--bg-card-active, var(--bg-card-hover))'; };
    }
    
    currentCateId = String(cateId);
    loadNotes();
}

async function markdownToHtml(rawMarkdown) {
    if (window.marked && typeof window.marked.parse === 'function') {
        try {
            let rawHtml = await window.marked.parse(rawMarkdown);
            return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        } catch (e) {
            console.error('Markdown parse error:', e);
            return rawMarkdown.replace(/\n/g, '<br>');
        }
    } else {
        return rawMarkdown.replace(/\n/g, '<br>');
    }
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function exportPdf() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const cateName = note.cateName || '未分类';
    const time = formatDateTime(note.time);
    const rawMarkdown = document.getElementById('editor').value;
    const content = await markdownToHtml(rawMarkdown);
    
    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
        <style>
            .pdf-container { width: 595px; margin: 0 auto; padding: 20px; background: white; }
            .pdf-meta { font-size: 12px; color: #64748b; margin-bottom: 15px; }
            .pdf-meta span { margin-right: 20px; }
            .pdf-title { font-size: 24px; font-weight: bold; color: #003b6f; border-bottom: 2px solid #003b6f; padding-bottom: 10px; margin-bottom: 20px; }
            .pdf-content { font-size: 14px; line-height: 1.8; color: #212529; }
            .pdf-content img { max-width: 100%; height: auto; }
            .pdf-content table { border-collapse: collapse; width: 100%; margin: 10px 0; }
            .pdf-content th, .pdf-content td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .pdf-content th { background-color: #f5f5f5; }
            .pdf-content ul, .pdf-content ol { padding-left: 20px; }
            .pdf-content pre { background: #1e293b; padding: 12px; border-radius: 4px; overflow-x: auto; }
            .pdf-content code { font-family: 'Fira Code', monospace; font-size: 13px; }
            .pdf-content pre code { color: #e2e8f0; }
            .pdf-content blockquote { border-left: 4px solid #2563eb; padding-left: 12px; color: #64748b; margin: 10px 0; }
            .pdf-content h1 { font-size: 22px; margin: 20px 0 10px; }
            .pdf-content h2 { font-size: 20px; margin: 18px 0 8px; }
            .pdf-content h3 { font-size: 18px; margin: 16px 0 6px; }
            .pdf-content h4, .pdf-content h5, .pdf-content h6 { font-size: 16px; margin: 14px 0 6px; }
            .pdf-content a { color: #2563eb; text-decoration: underline; }
            .pdf-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
        </style>
        <div class="pdf-container">
            <div class="pdf-meta">
                <span>分类：${cateName}</span>
                <span>创建时间：${time}</span>
            </div>
            <div class="pdf-title">${title}</div>
            <div class="pdf-content">${content}</div>
        </div>
    `;
    
    document.body.appendChild(pdfContent);
    
    try {
        const canvas = await html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const fileName = `${title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('导出PDF失败');
    } finally {
        document.body.removeChild(pdfContent);
    }
}

async function exportHtml() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const cateName = note.cateName || '未分类';
    const time = formatDateTime(note.time);
    const rawMarkdown = document.getElementById('editor').value;
    const content = await markdownToHtml(rawMarkdown);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; background: #f8fafc; }
        .content-wrapper { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
        .meta span { margin-right: 24px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-top: 0; }
        h2 { color: #1e40af; }
        h3 { color: #1e3a8a; }
        img { max-width: 100%; height: auto; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; }
        ul, ol { padding-left: 20px; }
        pre { background: #1e293b; padding: 16px; border-radius: 6px; overflow-x: auto; }
        code { font-family: 'Fira Code', 'Consolas', monospace; font-size: 14px; }
        pre code { color: #e2e8f0; }
        blockquote { border-left: 4px solid #2563eb; padding-left: 16px; color: #64748b; margin: 16px 0; background: #f8fafc; padding: 10px 16px; border-radius: 0 4px 4px 0; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="content-wrapper">
        <div class="meta">
            <span>分类：${cateName}</span>
            <span>创建时间：${time}</span>
        </div>
        <h1>${title}</h1>
        <div>${content}</div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportMd() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const content = document.getElementById('editor').value;
    
    const mdContent = `# ${title}\n\n---\n\n${content}`;
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function bindEvents() {
    document.getElementById("newNoteSide").onclick = newNote;
    document.getElementById("exportPdf").onclick = exportPdf;
    document.getElementById("exportHtml").onclick = exportHtml;
    document.getElementById("exportMd").onclick = exportMd;
    document.getElementById("layoutEditor").onclick = () => setLayout(0);
    document.getElementById("layoutBoth").onclick = () => setLayout(1);
    document.getElementById("layoutPreview").onclick = () => setLayout(2);
    document.getElementById("theme-dark").onclick = () => setTheme('dark-blue');
    document.getElementById("theme-light").onclick = () => setTheme('light');
    
    document.getElementById("search").oninput = async e => { 
        search = e.target.value; 
        await loadNotes();
        document.getElementById("clearSearch").style.display = search ? "block" : "none";
    };
    
    document.getElementById("clearSearch").onclick = async () => {
        document.getElementById("search").value = '';
        search = '';
        document.getElementById("clearSearch").style.display = "none";
        await loadNotes();
    };
    
    document.querySelector("[data-cate-id='all']").onclick = () => {
        selectCategory("all");
    };
    
    document.getElementById("addCategory").onclick = newCategory;
}

window.addEventListener("DOMContentLoaded", init);