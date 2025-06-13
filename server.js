const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const FILE = "details.txt";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  const token = Buffer.from(password).toString("base64");

  if (fs.existsSync(FILE)) {
    const data = fs.readFileSync(FILE, "utf-8");
    const userExists = data.split("\n").some(line => line.startsWith(username + ":"));
    if (userExists) return res.send("Username already exists.");
  }

  fs.appendFileSync(FILE, `${username}:${token}\n`);
  res.send("Registered successfully.");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const token = Buffer.from(password).toString("base64");

  if (fs.existsSync(FILE)) {
    const data = fs.readFileSync(FILE, "utf-8");
    const users = data.split("\n");
    for (let line of users) {
      const [storedUser, storedToken] = line.trim().split(":");
      if (storedUser === username && storedToken === token) {
        return res.send("Login successful!");
      }
    }
  }

  res.send("Invalid username or password.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
