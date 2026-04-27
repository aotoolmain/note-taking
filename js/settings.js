const defaultShortcuts = {
    'bold': { key: 'b', ctrl: true, shift: false, alt: false },
    'italic': { key: 'i', ctrl: true, shift: false, alt: false },
    'strikethrough': { key: 's', ctrl: true, shift: true, alt: false },
    'h1': { key: '1', ctrl: true, shift: false, alt: false },
    'h2': { key: '2', ctrl: true, shift: false, alt: false },
    'h3': { key: '3', ctrl: true, shift: false, alt: false },
    'h4': { key: '4', ctrl: true, shift: false, alt: false },
    'h5': { key: '5', ctrl: true, shift: false, alt: false },
    'h6': { key: '6', ctrl: true, shift: false, alt: false },
    'h7': { key: '7', ctrl: true, shift: false, alt: false },
    'ulist': { key: 'l', ctrl: true, shift: false, alt: false },
    'olist': { key: 'o', ctrl: true, shift: false, alt: false },
    'task': { key: 't', ctrl: true, shift: false, alt: false },
    'link': { key: 'k', ctrl: true, shift: false, alt: false },
    'image': { key: 'g', ctrl: true, shift: false, alt: false },
    'quote': { key: 'q', ctrl: true, shift: false, alt: false },
    'table': { key: 'e', ctrl: true, shift: false, alt: false },
    'hr': { key: '-', ctrl: true, shift: false, alt: false },
    'code': { key: '`', ctrl: true, shift: false, alt: false },
    'codeblock': { key: 'c', ctrl: true, shift: true, alt: false },
    'save': { key: 's', ctrl: true, shift: false, alt: false },
    'undo': { key: 'z', ctrl: true, shift: false, alt: false },
    'redo': { key: 'z', ctrl: true, shift: false, alt: true }
};

const shortcutLabels = {
    'bold': '粗体',
    'italic': '斜体',
    'strikethrough': '删除线',
    'h1': '一级标题',
    'h2': '二级标题',
    'h3': '三级标题',
    'h4': '四级标题',
    'h5': '五级标题',
    'h6': '六级标题',
    'h7': '七级标题',
    'ulist': '无序列表',
    'olist': '有序列表',
    'task': '待办事项',
    'link': '链接',
    'image': '图片',
    'quote': '引用',
    'table': '表格',
    'hr': '分割线',
    'code': '行内代码',
    'codeblock': '代码块',
    'save': '保存',
    'undo': '撤销',
    'redo': '重做'
};

let currentShortcuts = {};

const SHORTCUTS_VERSION = '1.1';

function loadShortcuts() {
    const savedVersion = localStorage.getItem('shortcutsVersion');
    const saved = localStorage.getItem('customShortcuts');
    
    if (saved && savedVersion === SHORTCUTS_VERSION) {
        try {
            const savedShortcuts = JSON.parse(saved);
            currentShortcuts = { ...defaultShortcuts, ...savedShortcuts };
        } catch (e) {
            currentShortcuts = { ...defaultShortcuts };
        }
    } else {
        currentShortcuts = { ...defaultShortcuts };
        localStorage.setItem('customShortcuts', JSON.stringify(currentShortcuts));
        localStorage.setItem('shortcutsVersion', SHORTCUTS_VERSION);
    }
    validateShortcuts();
}

function validateShortcuts() {
    Object.keys(defaultShortcuts).forEach(action => {
        if (!currentShortcuts[action]) {
            currentShortcuts[action] = { ...defaultShortcuts[action] };
        }
    });
}

function saveShortcuts() {
    localStorage.setItem('customShortcuts', JSON.stringify(currentShortcuts));
}

function resetShortcuts() {
    currentShortcuts = { ...defaultShortcuts };
    saveShortcuts();
    renderShortcutsSettings();
}

function shortcutToString(shortcut) {
    const parts = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
}

function renderShortcutsSettings() {
    const container = document.getElementById('shortcutsSettings');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(shortcutLabels).forEach(action => {
        const shortcut = currentShortcuts[action] || defaultShortcuts[action];
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between p-2 rounded-lg';
        row.style.backgroundColor = 'var(--bg-tertiary)';
        
        const label = document.createElement('span');
        label.style.color = 'var(--text-secondary)';
        label.textContent = shortcutLabels[action];
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'px-3 py-1 rounded-md text-sm w-32 text-center';
        input.style.backgroundColor = 'var(--bg-primary)';
        input.style.color = 'var(--text-primary)';
        input.style.border = '1px solid var(--border-color)';
        input.value = shortcutToString(shortcut);
        input.dataset.action = action;
        
        input.addEventListener('focus', function() {
            this.value = '';
            this.style.borderColor = 'var(--accent)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'var(--border-color)';
            if (!this.value) {
                const current = currentShortcuts[this.dataset.action] || defaultShortcuts[this.dataset.action];
                this.value = shortcutToString(current);
            }
        });
        
        input.addEventListener('keydown', function(e) {
            e.preventDefault();
            
            const newShortcut = {
                key: e.key.toLowerCase(),
                ctrl: e.ctrlKey,
                shift: e.shiftKey,
                alt: e.altKey
            };
            
            if (!newShortcut.ctrl && !newShortcut.alt && !newShortcut.shift) {
                return;
            }
            
            currentShortcuts[this.dataset.action] = newShortcut;
            this.value = shortcutToString(newShortcut);
            saveShortcuts();
            this.blur();
        });
        
        row.appendChild(label);
        row.appendChild(input);
        container.appendChild(row);
    });
}

function toggleSettingsDrawer(show) {
    const drawer = document.getElementById('settingsDrawer');
    const overlay = document.getElementById('settingsOverlay');
    
    if (show) {
        drawer.classList.remove('translate-x-full');
        overlay.style.opacity = '1';
        overlay.style.pointerEvents = 'auto';
        renderShortcutsSettings();
    } else {
        drawer.classList.add('translate-x-full');
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
    }
}

function bindSettingsEvents() {
    const settingsBtn = document.getElementById('settingsBtn');
    const closeBtn = document.getElementById('closeSettingsBtn');
    const resetBtn = document.getElementById('resetShortcutsBtn');
    const overlay = document.getElementById('settingsOverlay');
    
    settingsBtn?.addEventListener('click', () => toggleSettingsDrawer(true));
    closeBtn?.addEventListener('click', () => toggleSettingsDrawer(false));
    resetBtn?.addEventListener('click', resetShortcuts);
    overlay?.addEventListener('click', () => toggleSettingsDrawer(false));
}

function getShortcutForAction(action) {
    return currentShortcuts[action] || defaultShortcuts[action];
}

function matchShortcut(e) {
    for (const [action, shortcut] of Object.entries(currentShortcuts)) {
        if (e.key.toLowerCase() === shortcut.key &&
            e.ctrlKey === shortcut.ctrl &&
            e.shiftKey === shortcut.shift &&
            e.altKey === shortcut.alt) {
            return action;
        }
    }
    return null;
}

loadShortcuts();
bindSettingsEvents();

window.shortcutManager = {
    loadShortcuts,
    saveShortcuts,
    resetShortcuts,
    getShortcutForAction,
    matchShortcut,
    toggleSettingsDrawer
};