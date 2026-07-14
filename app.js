// ===============================
// BrightQuest Frontend Script
// ===============================
// POPUP LOGIC
const authPopup = document.getElementById("auth-popup");
const loginOpen = document.getElementById("login-open");
const signupOpen = document.getElementById("signup-open");
const popupClose = document.getElementById("popup-close");

loginOpen.addEventListener("click", () => {
  authPopup.classList.remove("hidden");
  document.getElementById("signup-area").classList.add("hidden");
  document.getElementById("login-area").classList.remove("hidden");
  document.getElementById("popup-title").textContent = "Login";
});

signupOpen.addEventListener("click", () => {
  authPopup.classList.remove("hidden");
  document.getElementById("signup-area").classList.remove("hidden");
  document.getElementById("login-area").classList.add("hidden");
  document.getElementById("popup-title").textContent = "Create Profile";
});

popupClose.addEventListener("click", () => {
  authPopup.classList.add("hidden");
});

// IMPORTANT: Replace this with your Railway backend URL
const API_BASE = "https://postgres-production-cf4ee.up.railway.app";

// DOM ELEMENTS
const ageInput = document.getElementById("age-input");
const ageButton = document.getElementById("age-button");
const ageError = document.getElementById("age-error");

const gamesContainer = document.getElementById("games-container");

const chatSection = document.getElementById("chat-section");
const chatMessages = document.getElementById("chat-messages");
const chatUserId = document.getElementById("chat-user-id");
const chatMessage = document.getElementById("chat-message");
const chatSend = document.getElementById("chat-send");

// ===============================
// AGE → GAME FETCHING
// ===============================

ageButton.addEventListener("click", async () => {
  const age = parseInt(ageInput.value);

  gamesContainer.innerHTML = "";
  ageError.textContent = "";

  if (isNaN(age) || age < 4 || age > 18) {
    ageError.textContent = "Please enter an age between 4 and 18.";
    chatSection.style.display = "none";
    return;
  }

  // Show chat only for teens
  if (age >= 13) {
    chatSection.style.display = "block";
    loadChatMessages();
  } else {
    chatSection.style.display = "none";
  }

  try {
    const res = await fetch(`${API_BASE}/games/${age}`);
    const games = await res.json();

    displayGames(games);
  } catch (err) {
    gamesContainer.innerHTML = "<p>Could not load games. Please try again.</p>";
  }
});

// ===============================
// GAME CARD RENDERING
// ===============================

function displayGames(games) {
  gamesContainer.innerHTML = "";

  if (!games || games.length === 0) {
    gamesContainer.innerHTML = "<p>No games available yet.</p>";
    return;
  }

  games.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    card.innerHTML = `
      <h3>${game.title}</h3>
      <p>${game.description || ""}</p>
    `;

    gamesContainer.appendChild(card);
  });
}

// ===============================
// CHAT SYSTEM
// ===============================

async function loadChatMessages() {
  try {
    const res = await fetch(`${API_BASE}/chat`);
    const messages = await res.json();

    chatMessages.innerHTML = "";

    messages.forEach((msg) => {
      const li = document.createElement("li");
      const name = msg.user_id || "Anon";
      li.textContent = `${name}: ${msg.message}`;
      chatMessages.appendChild(li);
    });
  } catch (err) {
    chatMessages.innerHTML = "<li>Could not load chat.</li>";
  }
}

// Auto-refresh chat every 5 seconds (only if visible)
setInterval(() => {
  if (chatSection.style.display === "block") {
    loadChatMessages();
  }
}, 5000);

// ===============================
// SEND CHAT MESSAGE
// ===============================

chatSend.addEventListener("click", async () => {
  const user = chatUserId.value.trim() || "Anon";
  const message = chatMessage.value.trim();

  if (!message) return;

  try {
    await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user, message }),
    });

    chatMessage.value = "";
    loadChatMessages();
  } catch (err) {
    alert("Could not send message.");
  }
});
// ===============================
// LOGIN + SIGNUP
// ===============================

const signupUsername = document.getElementById("signup-username");
const signupAge = document.getElementById("signup-age");
const signupButton = document.getElementById("signup-button");
const signupError = document.getElementById("signup-error");

const loginUsername = document.getElementById("login-username");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");

let currentUser = null;

// SIGNUP
signupButton.addEventListener("click", async () => {
  const username = signupUsername.value.trim();
  const age = parseInt(signupAge.value);

  if (!username || isNaN(age)) {
    signupError.textContent = "Please enter a username and age.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, age })
    });

    const data = await res.json();

    if (!data.success) {
      signupError.textContent = "Username already exists.";
      return;
    }

    currentUser = data.user;
    loadUserProfile();
  } catch {
    signupError.textContent = "Could not create profile.";
  }
});

// LOGIN
loginButton.addEventListener("click", async () => {
  const username = loginUsername.value.trim();

  if (!username) {
    loginError.textContent = "Enter your username.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });

    const data = await res.json();

    if (!data.success) {
      loginError.textContent = "Profile not found.";
      return;
    }

    currentUser = data.user;
    loadUserProfile();
  } catch {
    loginError.textContent = "Could not login.";
  }
});

// LOAD USER PROFILE
function loadUserProfile() {
  document.getElementById("auth-section").style.display = "none";

  ageInput.value = currentUser.age;
  ageButton.click();
}
