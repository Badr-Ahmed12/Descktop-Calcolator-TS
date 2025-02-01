const { ipcRenderer } = require('electron');
const axios = require('axios');
const path = require('path');


let currentFile = null;
let isDark = store.get('darkMode') || false;
let isArabic = true;

// تهيئة أولية
document.addEventListener('DOMContentLoaded', () => {
    if (isDark) document.documentElement.classList.add('dark');
    initEditor();
    loadLastFile();
});

async function initEditor() {
    const editor = document.getElementById('editor');
    
    // تحميل النص الأخير
    const lastContent = store.get('lastContent');
    if (lastContent) editor.value = lastContent;
    
    // تحديث المعاينة
    editor.addEventListener('input', debounce(updatePreview, 300));
    
    // اختصارات لوحة المفاتيح
    editor.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveFile();
        }
    });
}

async function updatePreview() {
    const markdown = document.getElementById('editor').value;
    const html = marked.parse(markdown, {
        breaks: true,
        gfm: true
    });
    
    document.getElementById('preview').innerHTML = html;
    highlightCode();
    store.set('lastContent', markdown);
}

function highlightCode() {
    document.querySelectorAll('pre code').forEach(hljs.highlightElement);
}

// حفظ الملف
async function saveFile() {
    const content = document.getElementById('editor').value;
    
    if (!currentFile) {
        currentFile = await ipcRenderer.invoke('show-save-dialog');
        if (!currentFile) return;
    }

    try {
        await fs.promises.writeFile(currentFile, content);
        showNotification('تم الحفظ بنجاح!');
    } catch (error) {
        showNotification('خطأ في الحفظ!', 'error');
    }
}

// فتح الملف
async function openFile() {
    const filePath = await ipcRenderer.invoke('show-open-dialog');
    if (!filePath) return;

    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        document.getElementById('editor').value = content;
        currentFile = filePath;
        updatePreview();
    } catch (error) {
        showNotification('خطأ في فتح الملف!', 'error');
    }
}

// تحسين النص بالذكاء الاصطناعي
async function aiEnhance() {
    showLoading(true);
    try {
        const text = document.getElementById('editor').value;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: `Improve this text: ${text}` }]
        }, {
            headers: {
                'Authorization': `Bearer ${store.get('apiKey')}`
            }
        });

        document.getElementById('editor').value = response.data.choices[0].message.content;
        updatePreview();
    } catch (error) {
        showNotification('خطأ في التحسين!', 'error');
    } finally {
        showLoading(false);
    }
}

// وظائف مساعدة
function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), timeout);
    };
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'flex' : 'none';
}