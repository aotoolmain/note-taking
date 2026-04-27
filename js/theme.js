function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    const btnDark = document.getElementById('theme-dark');
    const btnLight = document.getElementById('theme-light');
    const btnGreen = document.getElementById('theme-green');
    
    // 重置所有按钮样式
    [btnDark, btnLight, btnGreen].forEach(btn => {
        btn.style.backgroundColor = 'transparent';
        btn.style.color = 'var(--text-muted)';
        btn.onmouseover = function() { this.style.color='var(--text-primary)'; this.style.backgroundColor='var(--bg-card-hover)'; };
        btn.onmouseout = function() { this.style.color='var(--text-muted)'; this.style.backgroundColor='transparent'; };
    });
    
    // 设置当前选中按钮样式
    let activeBtn;
    if (theme === 'dark-blue') {
        activeBtn = btnDark;
    } else if (theme === 'light') {
        activeBtn = btnLight;
    } else if (theme === 'dark-green') {
        activeBtn = btnGreen;
    }
    
    if (activeBtn) {
        activeBtn.style.backgroundColor = 'var(--accent)';
        activeBtn.style.color = 'white';
        activeBtn.onmouseover = function() { this.style.backgroundColor='var(--accent-hover)'; };
        activeBtn.onmouseout = function() { this.style.backgroundColor='var(--accent)'; };
    }
    
    updateHighlightStyle(theme);
}

function updateHighlightStyle(theme) {
    let existingLink = document.getElementById('highlight-style');
    if (existingLink) {
        existingLink.remove();
    }
    
    const link = document.createElement('link');
    link.id = 'highlight-style';
    link.rel = 'stylesheet';
    link.href = (theme === 'dark-blue' || theme === 'dark-green') ? 'lib/highlightjs/github-dark.min.css' : 'lib/highlightjs/github.min.css';
    document.head.appendChild(link);
}