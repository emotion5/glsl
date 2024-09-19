const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// SQLite 데이터베이스 연결
const db = new sqlite3.Database('glsl_codes.db');

// 테이블 생성
db.run(`CREATE TABLE IF NOT EXISTS glsl_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  title TEXT,
  code TEXT
)`);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// GLSL 코드 저장
app.post('/api/save', (req, res) => {
  const { title, code } = req.body;
  db.run('INSERT INTO glsl_codes (title, code) VALUES (?, ?)', [title, code], function(err) {
    if (err) {
      res.status(500).send('Error saving code');
      return;
    }
    res.redirect('/?saved=true');
  });
});

// GLSL 코드 목록 조회
app.get('/api/list', (req, res) => {
  db.all('SELECT id, created_at, title FROM glsl_codes ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GLSL 코드 상세 조회
app.get('/api/code/:id', (req, res) => {
  db.get('SELECT * FROM glsl_codes WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Code not found' });
      return;
    }
    res.json(row);
  });
});

// GLSL 코드 삭제
app.delete('/api/delete/:id', (req, res) => {
  db.run('DELETE FROM glsl_codes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ success: false, error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});