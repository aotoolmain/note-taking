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
    link.href = theme === 'dark-blue' ? 'lib/highlightjs/github-dark.min.css' : 'lib/highlightjs/github.min.css';
    document.head.appendChild(link);
}