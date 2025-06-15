const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'details.txt');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ---- User Auth (Same as before) ----
function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '');
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return data
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [username, password] = line.split('|');
      return { username, password };
    });
}

function saveUser(username, password) {
  fs.appendFileSync(DATA_FILE, `${username}|${password}\n`);
}

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }
  saveUser(username, password);
  res.json({ success: true });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// ---- Code Streak Routes ----

function getUserFile(username) {
  return path.join(__dirname, `code_${username}.json`);
}

app.post('/submit-code', (req, res) => {
  const { username, code, date } = req.body;
  if (!username || !code || !date) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }

  const filePath = getUserFile(username);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  data[date] = code;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

app.get('/get-data/:username', (req, res) => {
  const username = req.params.username;
  const filePath = getUserFile(username);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ success: true, data });
  } else {
    res.json({ success: true, data: {} });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
