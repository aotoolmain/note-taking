const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = './data/db.json';
const UPLOAD_PATH = './uploads';

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_PATH);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

let db = { 
  notes: [], 
  categories: [
    { id: 1, name: '工作', isDefault: true },
    { id: 2, name: '学习', isDefault: true },
    { id: 3, name: '生活', isDefault: true }
  ] 
};

function loadDb() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      db = JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to load database:', err.message);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save database:', err.message);
  }
}

loadDb();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/notes', (req, res) => {
  let notes = db.notes;
  
  if (req.query.cateId && req.query.cateId !== 'all') {
    notes = notes.filter(n => n.cateId === parseInt(req.query.cateId));
  }
  
  if (req.query.search) {
    const search = req.query.search.toLowerCase();
    notes = notes.filter(n => n && (
      (n.title || '').toLowerCase().includes(search) || 
      (n.content || '').toLowerCase().includes(search)
    ));
  }
  
  notes.sort((a, b) => b.id - a.id);
  res.json(notes.map(n => {
    const cate = db.categories.find(c => c.id === n.cateId);
    return { 
      id: n.id, 
      title: n.title || '无标题', 
      time: n.time,
      cateName: cate ? cate.name : null
    };
  }));
});

app.get('/api/notes/:id', (req, res) => {
  const note = db.notes.find(n => n.id === parseInt(req.params.id));
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  const cate = db.categories.find(c => c.id === note.cateId);
  res.json({ 
    title: note.title || '无标题', 
    content: note.content || '', 
    cateId: note.cateId,
    cateName: cate ? cate.name : '未分类',
    time: note.time || new Date().toISOString()
  });
});

app.post('/api/notes', (req, res) => {
  const newNote = {
    id: Date.now(),
    title: req.body.title || '新笔记',
    content: req.body.content || '',
    cateId: req.body.cateId ? parseInt(req.body.cateId) : null,
    time: new Date().toISOString()
  };
  db.notes.push(newNote);
  saveDb();
  res.json({ id: newNote.id });
});

app.put('/api/notes/:id', (req, res) => {
  const index = db.notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  db.notes[index] = {
    ...db.notes[index],
    ...(req.body.title !== undefined && { title: req.body.title }),
    ...(req.body.content !== undefined && { content: req.body.content }),
    ...(req.body.cateId !== undefined && { cateId: req.body.cateId ? parseInt(req.body.cateId) : null }),
    time: new Date().toISOString()
  };
  saveDb();
  res.json({ success: true });
});

app.delete('/api/notes/:id', (req, res) => {
  const index = db.notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  db.notes.splice(index, 1);
  saveDb();
  res.json({ success: true });
});

app.get('/api/categories', (req, res) => {
  res.json(db.categories);
});

app.post('/api/categories', (req, res) => {
  if (!db.categories.find(c => c.name === req.body.name)) {
    const newId = db.categories.length > 0 ? Math.max(...db.categories.map(c => c.id)) + 1 : 1;
    db.categories.push({ id: newId, name: req.body.name });
    saveDb();
    res.json({ success: true, id: newId });
  } else {
    res.json({ success: false });
  }
});

app.put('/api/categories/:id', (req, res) => {
  const index = db.categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  if (db.categories[index].isDefault) {
    return res.status(403).json({ success: false, error: 'Cannot modify default category' });
  }
  db.categories[index].name = req.body.name;
  saveDb();
  res.json({ success: true });
});

app.delete('/api/categories/:id', (req, res) => {
  const index = db.categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Category not found' });
  }
  if (db.categories[index].isDefault) {
    return res.status(403).json({ success: false, error: 'Cannot delete default category' });
  }
  const cateId = db.categories[index].id;
  db.categories.splice(index, 1);
  db.notes.forEach(note => {
    if (note.cateId === cateId) {
      note.cateId = null;
    }
  });
  saveDb();
  res.json({ success: true });
});

app.use('/uploads', express.static(UPLOAD_PATH));

app.post('/api/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: '请选择图片文件' });
  }
  res.json({ 
    success: true, 
    url: `/uploads/${req.file.filename}` 
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});