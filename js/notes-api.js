async function autoSave() {
    if (!currentId) return;
    const content = document.getElementById('editor').value;
    await fetch(`/api/notes/${currentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
}

function getDateGroupLabel(dateStr) {
    const noteDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const noteDateStart = new Date(noteDate);
    noteDateStart.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((noteDateStart - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今天';
    } else if (diffDays === -1) {
        return '昨天';
    } else if (diffDays > 0) {
        return `${diffDays}天后`;
    } else {
        return noteDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function groupNotesByDate(notes) {
    const groups = {};
    
    notes.forEach(note => {
        const label = getDateGroupLabel(note.time);
        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(note);
    });
    
    const sortedGroups = Object.entries(groups).sort((a, b) => {
        const order = ['今天', '昨天'];
        const indexA = order.indexOf(a[0]);
        const indexB = order.indexOf(b[0]);
        
        if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB;
        } else if (indexA !== -1) {
            return -1;
        } else if (indexB !== -1) {
            return 1;
        } else {
            return new Date(b[0]) - new Date(a[0]);
        }
    });
    
    return sortedGroups;
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
    
    const groupedNotes = groupNotesByDate(notes);
    
    groupedNotes.forEach(([dateLabel, groupNotes], index) => {
        const groupId = 'group-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        const isFirst = index === 0;
        
        const groupHeader = document.createElement("div");
        groupHeader.className = "note-group-header flex items-center gap-2 py-2 px-1 cursor-pointer";
        groupHeader.style.color = 'var(--text-muted)';
        groupHeader.innerHTML = `
            <i class="fa ${isFirst ? 'fa-chevron-down' : 'fa-chevron-right'} text-xs group-toggle-icon"></i>
            <i class="fa fa-calendar-o text-xs"></i>
            <span class="text-sm font-medium">${dateLabel}</span>
            <span class="text-xs ml-auto opacity-60">${groupNotes.length} 篇</span>
        `;
        groupHeader.dataset.groupId = groupId;
        
        const groupContainer = document.createElement("div");
        groupContainer.className = "note-group-container space-y-1 pl-4 mr-4" + (isFirst ? '' : ' collapsed');
        groupContainer.id = groupId;
        
        groupHeader.addEventListener('click', function() {
            const container = document.getElementById(this.dataset.groupId);
            const icon = this.querySelector('.group-toggle-icon');
            
            if (container.classList.contains('collapsed')) {
                container.classList.remove('collapsed');
                icon.className = 'fa fa-chevron-down text-xs group-toggle-icon';
            } else {
                container.classList.add('collapsed');
                icon.className = 'fa fa-chevron-right text-xs group-toggle-icon';
            }
        });
        
        list.appendChild(groupHeader);
        
        groupNotes.forEach(note => {
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
        groupContainer.appendChild(item);
        });
        
        list.appendChild(groupContainer);
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
    const editor = document.getElementById('editor');
    editor.value = note.content || '';
    historyStack = [{ content: editor.value, timestamp: Date.now() }];
    historyIndex = 0;
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
    const editor = document.getElementById('editor');
    editor.value = '';
    historyStack = [{ content: '', timestamp: Date.now() }];
    historyIndex = 0;
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