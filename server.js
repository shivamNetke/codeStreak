const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'details.txt');
const USERS_DIR = path.join(__dirname, 'users');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Utility: Load users from details.txt
function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '');
    return [];
  }

  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return data
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [username, password] = line.split('|');
      return { username, password };
    });
}

// Utility: Save a new user
function saveUser(username, password) {
  fs.appendFileSync(DATA_FILE, `${username}|${password}\n`);
}

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  saveUser(username, password);
  res.json({ success: true, message: 'User registered successfully' });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const users = loadUsers();
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    res.json({ success: true, message: 'Login successful!' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid username or password' });
  }
});

// Submit code route
app.post('/submit-code', (req, res) => {
  const { username, code, date } = req.body;

  if (!username || !code || !date) {
    return res.status(400).json({ success: false, message: 'Missing data' });
  }

  const userDir = path.join(USERS_DIR, username);
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

  const filePath = path.join(userDir, `${date}.txt`);
  fs.writeFileSync(filePath, code);

  res.json({ success: true, message: 'Code saved' });
});

// Get code submissions by user
app.post('/get-codes', (req, res) => {
  const { username } = req.body;

  const userDir = path.join(USERS_DIR, username);
  if (!fs.existsSync(userDir)) return res.json({ success: true, codes: {} });

  const files = fs.readdirSync(userDir);
  const data = {};

  files.forEach(file => {
    const filePath = path.join(userDir, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    const date = file.replace('.txt', '');
    data[date] = code;
  });

  res.json({ success: true, codes: data });
});

// Admin: List all users
app.get('/admin/users', (req, res) => {
  if (!fs.existsSync(USERS_DIR)) return res.json([]);
  const users = fs.readdirSync(USERS_DIR).filter(folder =>
    fs.statSync(path.join(USERS_DIR, folder)).isDirectory()
  );
  res.json(users);
});

// Admin: Get user's code submissions
app.get('/admin/user/:username', (req, res) => {
  const username = req.params.username;
  const userDir = path.join(USERS_DIR, username);
  if (!fs.existsSync(userDir)) return res.status(404).json({ success: false, message: 'User not found' });

  const files = fs.readdirSync(userDir);
  const data = {};

  files.forEach(file => {
    const filePath = path.join(userDir, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    const date = file.replace('.txt', '');
    data[date] = code;
  });

  res.json({ success: true, codes: data });
});

// Root route
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
