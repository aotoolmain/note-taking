async function markdownToHtml(rawMarkdown) {
    if (window.marked && typeof window.marked.parse === 'function') {
        try {
            let rawHtml = await window.marked.parse(rawMarkdown);
            return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
        } catch (e) {
            console.error('Markdown parse error:', e);
            return rawMarkdown.replace(/\n/g, '<br>');
        }
    } else {
        return rawMarkdown.replace(/\n/g, '<br>');
    }
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function exportPdf() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const cateName = note.cateName || '未分类';
    const time = formatDateTime(note.time);
    const rawMarkdown = document.getElementById('editor').value;
    const content = await markdownToHtml(rawMarkdown);
    
    const pdfContent = document.createElement("div");
    pdfContent.innerHTML = `
        <style>
            .pdf-container { width: 595px; margin: 0 auto; padding: 20px; background: white; }
            .pdf-meta { font-size: 12px; color: #64748b; margin-bottom: 15px; }
            .pdf-meta span { margin-right: 20px; }
            .pdf-title { font-size: 24px; font-weight: bold; color: #003b6f; border-bottom: 2px solid #003b6f; padding-bottom: 10px; margin-bottom: 20px; }
            .pdf-content { font-size: 14px; line-height: 1.8; color: #212529; }
            .pdf-content img { max-width: 100%; height: auto; }
            .pdf-content table { border-collapse: collapse; width: 100%; margin: 10px 0; }
            .pdf-content th, .pdf-content td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .pdf-content th { background-color: #f5f5f5; }
            .pdf-content ul, .pdf-content ol { padding-left: 20px; }
            .pdf-content pre { background: #1e293b; padding: 12px; border-radius: 4px; overflow-x: auto; }
            .pdf-content code { font-family: 'Fira Code', monospace; font-size: 13px; }
            .pdf-content pre code { color: #e2e8f0; }
            .pdf-content blockquote { border-left: 4px solid #2563eb; padding-left: 12px; color: #64748b; margin: 10px 0; }
            .pdf-content h1 { font-size: 22px; margin: 20px 0 10px; }
            .pdf-content h2 { font-size: 20px; margin: 18px 0 8px; }
            .pdf-content h3 { font-size: 18px; margin: 16px 0 6px; }
            .pdf-content h4, .pdf-content h5, .pdf-content h6 { font-size: 16px; margin: 14px 0 6px; }
            .pdf-content a { color: #2563eb; text-decoration: underline; }
            .pdf-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
        </style>
        <div class="pdf-container">
            <div class="pdf-meta">
                <span>分类：${cateName}</span>
                <span>创建时间：${time}</span>
            </div>
            <div class="pdf-title">${title}</div>
            <div class="pdf-content">${content}</div>
        </div>
    `;
    
    document.body.appendChild(pdfContent);
    
    try {
        const canvas = await html2canvas(pdfContent, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const fileName = `${title.replace(/[\\/:*?"<>|]/g, '_')}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('PDF export error:', error);
        alert('导出PDF失败');
    } finally {
        document.body.removeChild(pdfContent);
    }
}

async function exportHtml() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const cateName = note.cateName || '未分类';
    const time = formatDateTime(note.time);
    const rawMarkdown = document.getElementById('editor').value;
    const content = await markdownToHtml(rawMarkdown);
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; background: #f8fafc; }
        .content-wrapper { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
        .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
        .meta span { margin-right: 24px; }
        h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-top: 0; }
        h2 { color: #1e40af; }
        h3 { color: #1e3a8a; }
        img { max-width: 100%; height: auto; border-radius: 4px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
        th { background-color: #f1f5f9; }
        ul, ol { padding-left: 20px; }
        pre { background: #1e293b; padding: 16px; border-radius: 6px; overflow-x: auto; }
        code { font-family: 'Fira Code', 'Consolas', monospace; font-size: 14px; }
        pre code { color: #e2e8f0; }
        blockquote { border-left: 4px solid #2563eb; padding-left: 16px; color: #64748b; margin: 16px 0; background: #f8fafc; padding: 10px 16px; border-radius: 0 4px 4px 0; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="content-wrapper">
        <div class="meta">
            <span>分类：${cateName}</span>
            <span>创建时间：${time}</span>
        </div>
        <h1>${title}</h1>
        <div>${content}</div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportMd() {
    if (!currentId) {
        await showAlert("请先选择或创建一篇笔记");
        return;
    }
    const res = await fetch(`/api/notes/${currentId}`);
    const note = await res.json();
    const title = note.title || "无标题";
    const content = document.getElementById('editor').value;
    
    const mdContent = `# ${title}\n\n---\n\n${content}`;
    
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}