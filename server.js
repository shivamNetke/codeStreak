const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to file
const DATA_FILE = path.join(__dirname, 'details.txt');

// Helper: load user data
function loadUsers() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return data
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      const [username, password] = line.split('|');
      return { username, password };
    });
}

// Helper: save new user
function saveUser(username, password) {
  const line = `${username}|${password}\n`;
  fs.appendFileSync(DATA_FILE, line);
}

// Routes
app.get('/', (req, res) => {
  res.send('Backend for CodeStreak is running!');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });

  const users = loadUsers();
  const exists = users.find(user => user.username === username);

  if (exists)
    return res.status(409).json({ message: 'User already exists' });

  saveUser(username, password);
  res.status(201).json({ message: 'Registration successful' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const users = loadUsers();
  const validUser = users.find(user => user.username === username && user.password === password);

  if (validUser) {
    res.status(200).json({ message: 'Login successful' });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
