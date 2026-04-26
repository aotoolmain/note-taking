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
        let inputEl = document.getElementById("promptInput");
        const iconEl = document.getElementById("promptIcon");
        const okBtn = document.getElementById("promptOk");
        const cancelBtn = document.getElementById("promptCancel");
        
        if (!inputEl) {
            const container = document.createElement('div');
            container.innerHTML = '<input id="promptInput" type="text" class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-blue-500 mb-4" placeholder="请输入内容">';
            const btnContainer = document.querySelector('.flex.gap-3');
            btnContainer.parentNode.insertBefore(container.firstChild, btnContainer);
            inputEl = document.getElementById("promptInput");
        }
        
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

function showSelectPrompt(title, message, options = [], defaultValue = '', icon = 'fa-pencil') {
    return new Promise((resolve) => {
        const modal = document.getElementById("promptModal");
        const titleEl = document.getElementById("promptTitle");
        const messageEl = document.getElementById("promptMessage");
        const iconEl = document.getElementById("promptIcon");
        const okBtn = document.getElementById("promptOk");
        const cancelBtn = document.getElementById("promptCancel");
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        iconEl.className = `fa ${icon} text-blue-500 text-3xl`;
        
        const existingSelect = document.getElementById("promptSelectInput");
        const existingDropdown = document.getElementById("promptSelectDropdown");
        const oldInput = document.getElementById("promptInput");
        
        if (existingSelect) existingSelect.remove();
        if (existingDropdown) existingDropdown.remove();
        if (oldInput) oldInput.remove();
        
        const selectInput = document.createElement('input');
        selectInput.id = 'promptSelectInput';
        selectInput.type = 'text';
        selectInput.className = 'w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-gray-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-4';
        selectInput.placeholder = defaultValue || '请选择或输入语言';
        selectInput.value = defaultValue;
        
        const dropdown = document.createElement('div');
        dropdown.id = 'promptSelectDropdown';
        dropdown.className = 'absolute w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg max-h-48 overflow-y-auto z-10 hidden';
        
        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'px-4 py-2 hover:bg-gray-700 cursor-pointer text-gray-300';
            item.textContent = opt;
            dropdown.appendChild(item);
        });
        
        const selectContainer = document.createElement('div');
        selectContainer.className = 'relative';
        selectContainer.appendChild(selectInput);
        selectContainer.appendChild(dropdown);
        
        const btnContainer = modal.querySelector('.flex.gap-3');
        btnContainer.parentNode.insertBefore(selectContainer, btnContainer);
        
        let selectedLang = defaultValue;
        
        modal.style.display = "flex";
        selectInput.focus();
        
        const inputHandler = () => {
            selectedLang = selectInput.value;
            const filter = selectInput.value.toLowerCase();
            const items = dropdown.querySelectorAll('div');
            items.forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(filter) ? 'block' : 'none';
            });
            dropdown.classList.remove('hidden');
        };
        
        const clickHandler = () => {
            dropdown.classList.remove('hidden');
        };
        
        const dropdownClickHandler = (e) => {
            if (e.target.tagName === 'DIV') {
                selectedLang = e.target.textContent;
                selectInput.value = e.target.textContent;
                dropdown.classList.add('hidden');
            }
        };
        
        const handleOk = () => {
            cleanup();
            modal.style.display = "none";
            resolve(selectedLang || null);
        };
        
        const handleCancel = () => {
            cleanup();
            modal.style.display = "none";
            resolve(null);
        };
        
        const handleOutsideClick = (e) => {
            if (!selectContainer.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        };
        
        const handleKeydown = (e) => {
            if (e.key === 'Enter') {
                handleOk();
            } else if (e.key === 'Escape') {
                handleCancel();
            }
        };
        
        const cleanup = () => {
            selectInput.removeEventListener('input', inputHandler);
            selectInput.removeEventListener('click', clickHandler);
            selectInput.removeEventListener('keydown', handleKeydown);
            dropdown.removeEventListener('click', dropdownClickHandler);
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            document.removeEventListener('click', handleOutsideClick);
            selectInput.remove();
            dropdown.remove();
        };
        
        selectInput.addEventListener('input', inputHandler);
        selectInput.addEventListener('click', clickHandler);
        selectInput.addEventListener('keydown', handleKeydown);
        dropdown.addEventListener('click', dropdownClickHandler);
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        document.addEventListener('click', handleOutsideClick);
    });
}