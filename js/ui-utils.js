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