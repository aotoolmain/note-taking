let currentId = null;
let currentCateId = "all";
let search = "";
let layoutMode = 2;
let renderTimeout;
let currentTheme = localStorage.getItem("theme") || "dark-blue";
let historyStack = [];
let historyIndex = -1;

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

marked.setOptions({
    gfm: true,
    breaks: true,
    pedantic: false,
    headerIds: true,
    mangle: false,
    smartLists: true,
    smartypants: true,
    listStart: 1,
    langPrefix: 'language-'
});

marked.use({
    renderer: {
        code: function(text, lang, escaped) {
            const language = lang && lang.trim().toLowerCase();
            let highlighted = escapeHtml(text || '');
            
            try {
                if (text && hljs) {
                    const escapedText = escapeHtml(text);
                    highlighted = hljs.highlightAuto(escapedText, language ? [language] : undefined).value;
                }
            } catch (e) {
                console.warn('Highlight error:', e);
            }
            
            return `
                <div class="code-block-container">
                    <div class="code-block-header">
                        <span class="code-block-lang">${language || 'code'}</span>
                        <button class="code-block-copy" data-copy-btn>
                            <i class="fa fa-copy"></i>
                            <span>复制</span>
                        </button>
                    </div>
                    <pre><code class="${language ? 'language-' + language : ''}">${highlighted}</code></pre>
                </div>
            `;
        }
    }
});

function handleCopyCode(e) {
    const btn = e.target.closest('[data-copy-btn]');
    if (!btn) return;
    
    try {
        const container = btn.closest('.code-block-container');
        if (!container) {
            console.error('找不到 code-block-container');
            return;
        }
        
        const codeElement = container.querySelector('code');
        if (!codeElement) {
            console.error('找不到 code 元素');
            return;
        }
        
        const code = codeElement.textContent;
        if (!code) {
            console.error('代码内容为空');
            return;
        }
        
        navigator.clipboard.writeText(code).then(() => {
            const icon = btn.querySelector('i');
            const text = btn.querySelector('span');
            
            if (icon) icon.className = 'fa fa-check';
            if (text) text.textContent = '已复制';
            btn.classList.add('copied');
            
            setTimeout(() => {
                if (icon) icon.className = 'fa fa-copy';
                if (text) text.textContent = '复制';
                btn.classList.remove('copied');
            }, 2000);
        }).catch((err) => {
            console.error('复制失败:', err);
            fallbackCopy(code, btn);
        });
    } catch (err) {
        console.error('复制函数出错:', err);
    }
}

function fallbackCopy(text, btn) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        const icon = btn.querySelector('i');
        const text = btn.querySelector('span');
        
        if (icon) icon.className = 'fa fa-check';
        if (text) text.textContent = '已复制';
        btn.classList.add('copied');
        
        setTimeout(() => {
            if (icon) icon.className = 'fa fa-copy';
            if (text) text.textContent = '复制';
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('备用复制方法也失败:', err);
        alert('复制失败，请手动复制');
    } finally {
        document.body.removeChild(textarea);
    }
}

window.addEventListener("DOMContentLoaded", init);

async function init() {
    setTheme(currentTheme);
    await loadCate();
    await loadNotes();
    bindEvents();
    
    const editor = document.getElementById('editor');
    
    const saveHistory = () => {
        if (!currentId) return;
        const content = editor.value;
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push({ content, timestamp: Date.now() });
        historyIndex = historyStack.length - 1;
        if (historyStack.length > 50) {
            historyStack.shift();
            historyIndex--;
        }
    };

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
            const handledKeys = ['b', 'i', 's', '1', '2', '3', 'l', 'o', 't', 'k', 'g', 'q', 'e', '-', '`'];
            
            if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            
            if (e.key.toLowerCase() === 'z' && e.shiftKey) {
                e.preventDefault();
                redo();
                return;
            }
            
            if (handledKeys.includes(e.key.toLowerCase())) {
                e.preventDefault();
                handleToolAction(e.key.toLowerCase());
            }
            
            if (e.shiftKey && e.key.toLowerCase() === 'c') {
                e.preventDefault();
                insertCodeBlock();
            }
        }
    });
    
    editor.addEventListener('input', function() {
        saveHistory();
        autoSave();
        updatePreview();
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