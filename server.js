const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // allow cross-origin requests (from Netlify)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// File to store user data
const dataFile = 'details.txt';

// Helper to ensure file exists
if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(dataFile, '', 'utf-8');
}

// POST /register
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  const data = fs.readFileSync(dataFile, 'utf-8');
  const exists = data.split('\n').find(line => {
    const [storedUser] = line.split('|');
    return storedUser === username;
  });

  if (exists) {
    return res.status(409).send('⚠️ User already exists');
  }

  fs.appendFileSync(dataFile, `${username}|${password}\n`);
  res.send('✅ Registration successful');
});

// POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const data = fs.readFileSync(dataFile, 'utf-8');
  const found = data.split('\n').find(line => {
    const [storedUser, storedPass] = line.split('|');
    return storedUser === username && storedPass === password;
  });

  if (found) {
    res.send('✅ Login successful');
  } else {
    res.status(401).send('❌ Invalid username or password');
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('🟢 Backend is running: CodeStreak API');
});

app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
