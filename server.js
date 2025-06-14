const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_FILE = path.join(__dirname, 'details.txt');

// Middlewares
app.use(cors());
app.use(express.json()); // REQUIRED to read req.body
app.use(express.static('public')); // serve static files like HTML/CSS/JS

// Helper to load user data
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

// Routes
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

// Root test route (optional)
app.get('/', (req, res) => {
  res.send('Server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
