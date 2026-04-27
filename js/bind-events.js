function toggleShortcutDrawer() {
    const drawer = document.getElementById('shortcutDrawer');
    const overlay = document.getElementById('shortcutOverlay');
    const isOpen = drawer.classList.contains('translate-x-0');
    
    if (isOpen) {
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('translate-x-full');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        overlay.style.pointerEvents = 'none';
    } else {
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('translate-x-0');
        overlay.classList.remove('opacity-0');
        overlay.classList.add('opacity-100');
        overlay.style.pointerEvents = 'auto';
    }
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
    document.getElementById("theme-green").onclick = () => setTheme('dark-green');
    document.getElementById("theme-light").onclick = () => setTheme('light');
    document.getElementById("undoBtn").onclick = undo;
    document.getElementById("redoBtn").onclick = redo;
    document.getElementById("shortcutBtn").onclick = toggleShortcutDrawer;
    document.getElementById("closeShortcutBtn").onclick = toggleShortcutDrawer;
    document.getElementById("shortcutOverlay").onclick = toggleShortcutDrawer;
    
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
    
    document.addEventListener('click', handleCopyCode);
    document.addEventListener('click', handleCodeBlockToggle);
}