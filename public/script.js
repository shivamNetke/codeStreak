// Utility to get users from "details.txt" (simulated via localStorage)
function getStoredUsers() {
  const data = localStorage.getItem("users_txt");
  if (!data) return [];
  return data.split("\n").map(line => {
    const [username, token] = line.split(":");
    return { username, token };
  });
}

// Save user into "details.txt" format
function storeNewUser(username, password) {
  const token = btoa(password);
  const users = getStoredUsers();

  if (users.find(u => u.username === username)) {
    return false; // User already exists
  }

  users.push({ username, token });
  const newData = users.map(u => `${u.username}:${u.token}`).join("\n");
  localStorage.setItem("users_txt", newData);
  return true;
}

// Validate login credentials
function validateUser(username, password) {
  const token = btoa(password);
  const users = getStoredUsers();
  return users.find(u => u.username === username && u.token === token);
}

// Handle Login
if (document.getElementById("loginForm")) {
  document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    const msg = document.getElementById("message");

    if (validateUser(user, pass)) {
      msg.style.color = "green";
      msg.textContent = "Login successful!";
    } else {
      msg.style.color = "red";
      msg.textContent = "Invalid username or password.";
    }
  });
}

// Handle Registration
if (document.getElementById("registerForm")) {
  document.getElementById("registerForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const user = document.getElementById("regUsername").value.trim();
    const pass = document.getElementById("regPassword").value.trim();
    const msg = document.getElementById("message");

    if (storeNewUser(user, pass)) {
      msg.style.color = "green";
      msg.textContent = "Registered successfully. You can now login.";
    } else {
      msg.style.color = "red";
      msg.textContent = "Username already exists.";
    }
  });
}
