let currentId = null;
let currentCateId = "all";
let search = "";
let layoutMode = 2;
let renderTimeout;
let currentTheme = localStorage.getItem("theme") || "dark-blue";
let historyStack = [];
let historyIndex = -1;

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