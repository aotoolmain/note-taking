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
    const toolButtons = document.querySelectorAll('.tool-btn');
    
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
        toolButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    } else if (mode === 1) {
        editorPanel.style.display = 'flex';
        previewPanel.classList.remove('hidden');
        btnBoth.style.backgroundColor = 'var(--accent)';
        btnBoth.style.color = 'white';
        btnBoth.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnBoth.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
        toolButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    } else {
        editorPanel.style.display = 'none';
        previewPanel.classList.remove('hidden');
        btnPreview.style.backgroundColor = 'var(--accent)';
        btnPreview.style.color = 'white';
        btnPreview.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        btnPreview.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
        toolButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
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
    const result = await showLinkPrompt('插入链接', '请输入链接信息');
    if (!result || !result.url) return;
    const text = result.text || result.url;
    const linkMarkdown = `[${text}](${result.url})`;
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

const codeLanguages = [
    'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'c', 'cpp', 'csharp',
    'bash', 'shell', 'powershell',
    'html', 'css', 'scss', 'sass', 'less',
    'sql', 'mysql', 'postgresql', 'sqlite',
    'json', 'yaml', 'xml', 'markdown',
    'php', 'ruby', 'swift', 'kotlin', 'dart',
    'dockerfile', 'makefile', 'gradle', 'maven',
    'vue', 'react', 'angular', 'svelte', 'solidity'
];

async function insertCodeBlock() {
    const lang = await showSelectPrompt('插入代码块', '请选择代码语言', codeLanguages, 'javascript', 'fa-code');
    if (!lang) return;
    let codePlaceholder = '// 你的代码';
    if (lang === 'python') {
        codePlaceholder = '# 你的代码';
    } else if (lang === 'bash' || lang === 'shell') {
        codePlaceholder = '# 你的命令';
    } else if (lang === 'html') {
        codePlaceholder = '<!-- 你的 HTML -->';
    } else if (lang === 'css' || lang === 'scss' || lang === 'sass' || lang === 'less') {
        codePlaceholder = '/* 你的 CSS */';
    } else if (lang === 'sql' || lang === 'mysql' || lang === 'postgresql' || lang === 'sqlite') {
        codePlaceholder = '-- 你的 SQL';
    } else if (lang === 'yaml') {
        codePlaceholder = '# 你的配置';
    } else if (lang === 'dockerfile') {
        codePlaceholder = '# 你的 Dockerfile';
    } else if (lang === 'makefile') {
        codePlaceholder = '# 你的 Makefile';
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

function undo() {
    const editor = document.getElementById('editor');
    if (historyIndex > 0) {
        historyIndex--;
        editor.value = historyStack[historyIndex].content;
        updatePreview();
    }
}

function redo() {
    const editor = document.getElementById('editor');
    if (historyIndex < historyStack.length - 1) {
        historyIndex++;
        editor.value = historyStack[historyIndex].content;
        updatePreview();
    }
}