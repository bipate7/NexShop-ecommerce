// js/auth.js - simple client-side mock auth (localStorage)

const USERS_KEY = "nexshop_users_v1";
const USER_KEY = "nexshop_user";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function setCurrentUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(USER_KEY);
  // update header if present
  if (typeof updateHeaderUser === "function") updateHeaderUser();
}

function registerUser({ firstName, lastName, email, phone, password }) {
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with that email already exists.");
  }
  const user = {
    id: "u" + Math.random().toString(36).slice(2, 10),
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    password, // plain for demo only
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser({
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
  });
  if (typeof updateHeaderUser === "function") updateHeaderUser();
  return user;
}

function loginUser({ email, password }) {
  const users = getUsers();
  const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!u || u.password !== password)
    throw new Error("Invalid email or password.");
  setCurrentUser({
    id: u.id,
    email: u.email,
    name: `${u.firstName} ${u.lastName}`,
  });
  if (typeof updateHeaderUser === "function") updateHeaderUser();
  return u;
}

// Page bindings
document.addEventListener("DOMContentLoaded", () => {
  console.log("auth.js loaded");

  // Bind register page if present
  const registerForm = document.querySelector(".register-form form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
          document.getElementById("confirmPassword").value;
        const terms = document.getElementById("terms").checked;
        if (!firstName || !lastName || !email || !password)
          throw new Error("Please fill all required fields.");
        if (password !== confirmPassword)
          throw new Error("Passwords do not match.");
        if (!terms) throw new Error("You must accept terms.");
        registerUser({ firstName, lastName, email, phone, password });
        alert("Registration successful. You are now logged in.");
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message || "Registration failed.");
      }
    });
  }

  // Bind login page if present
  const loginForm = document.querySelector(".login-form form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        if (!email || !password)
          throw new Error("Please enter email and password.");
        loginUser({ email, password });
        alert("Login successful.");
        window.location.href = "index.html";
      } catch (err) {
        alert(err.message || "Login failed.");
      }
    });
  }

  // Update header if helpers are available
  if (typeof updateHeaderUser === "function") updateHeaderUser();
});

// expose helpers
window.NexShop = window.NexShop || {};
window.NexShop.auth = {
  getUsers,
  getCurrentUser,
  loginUser,
  registerUser,
  logout,
};
