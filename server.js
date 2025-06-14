const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'details.txt');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Load users from details.txt
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

// Save a new user
function saveUser(username, password) {
  fs.appendFileSync(DATA_FILE, `${username}|${password}\n`);
}

// Routes
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const users = loadUsers();
  const exists = users.find(u => u.username === username);

  if (exists) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  saveUser(username, password);
  res.json({ success: true, message: 'User registered successfully' });
});

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

app.get('/download', (req, res) => {
  res.download(DATA_FILE, 'details.txt', (err) => {
    if (err) {
      res.status(500).send('Error downloading file');
    }
  });
});

app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
