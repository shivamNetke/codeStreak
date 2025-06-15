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

// Utility: Load all data grouped by username and date
function loadAllUserData() {
  if (!fs.existsSync(DATA_FILE)) return {};

  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const lines = raw.split('\n').filter(line => line.trim() !== '');
  const users = {};

  for (const line of lines) {
    const [username, date, code] = line.split('|');
    if (!username || !date || !code) continue;

    if (!users[username]) users[username] = {};
    users[username][date] = code;
  }

  return users;
}

// Utility: Save a new code entry
function saveCode(username, date, code) {
  const entry = `${username}|${date}|${code.replace(/\n/g, ' ')}\n`;
  fs.appendFileSync(DATA_FILE, entry);
}

// Route: Submit code
app.post('/submit-code', (req, res) => {
  const { username, date, code } = req.body;

  if (!username || !date || !code) {
    return res.status(400).json({ success: false, message: 'Missing username, date, or code' });
  }

  saveCode(username, date, code);
  res.json({ success: true, message: 'Code saved successfully' });
});

// Route: Get user's code history
app.post('/get-codes', (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: 'Missing username' });
  }

  const allData = loadAllUserData();
  const userData = allData[username] || {};
  res.json({ success: true, codes: userData });
});

// Admin Route: Get all user data
app.get('/admin-data', (req, res) => {
  const allData = loadAllUserData();
  res.json({ success: true, data: allData });
});

// Admin Route: Download details.txt file
app.get('/download-details', (req, res) => {
  res.download(DATA_FILE, 'details.txt', (err) => {
    if (err) {
      res.status(500).send('Error downloading file.');
    }
  });
});

// Root test route
app.get('/', (req, res) => {
  res.send('CodeStreak backend is running.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
