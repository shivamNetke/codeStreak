const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'details.txt');

// Middleware
app.use(cors());
app.use(express.json()); // To parse JSON request body
app.use(express.static('public')); // Serve static files from "public" folder

// Helper function to load users
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

// Register route
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  const users = loadUsers();
  const userExists = users.some(u => u.username === username);

  if (userExists) {
    return res.status(409).json({ success: false, message: 'Username already exists' });
  }

  // Append user to details.txt
  try {
    fs.appendFileSync(DATA_FILE, `${username}|${password}\n`);
    res.json({ success: true, message: 'Registration successful!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to save user' });
  }
});

// Root route (optional)
app.get('/', (req, res) => {
  res.send('Server is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
