// ===============================
// BrightQuest Frontend Script
// ===============================

// IMPORTANT: set this to your Railway backend URL
const API_BASE = "https://postgres-production-cf4ee.up.railway.app";

// ---------- POPUP / AUTH UI ----------

const authPopup = document.getElementById("auth-popup");
const loginOpen = document.getElementById("login-open");
const signupOpen = document.getElementById("signup-open");
const popupClose = document.getElementById("popup-close");

const signupArea = document.getElementById("signup-area");
const loginArea = document.getElementById("login-area");
const popupTitle = document.getElementById("popup-title");

const signupUsername = document.getElementById("signup-username");
const signupAge = document.getElementById("signup-age");
const signupButton = document.getElementById("signup-button");
const signupError = document.getElementById("signup-error");

const loginUsername = document.getElementById("login-username");
const loginButton = document.getElementById("login-button");
const loginError = document.getElementById("login-error");

let currentUser = null;

loginOpen.addEventListener("click", () => {
  authPopup.classList.remove("hidden");
  signupArea.classList.add("hidden");
  loginArea.classList.remove("hidden");
  popupTitle.textContent = "Login";
});

signupOpen.addEventListener("click", () => {
  authPopup.classList.remove("hidden");
  signupArea.classList.remove("hidden");
  loginArea.classList.add("hidden");
  popupTitle.textContent = "Create Profile";
});

popupClose.addEventListener("click", () => {
  authPopup.classList.add("hidden");
});

// ---------- SIGNUP / LOGIN LOGIC ----------

signupButton.addEventListener("click", async () => {
  const username = signupUsername.value.trim();
  const age = parseInt(signupAge.value);

  signupError.textContent = "";

  if (!username || isNaN(age) || age < 4 || age > 18) {
    signupError.textContent = "Enter a username and age between 4 and 18.";
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
      signupError.textContent = data.message || "Username already exists.";
      return;
    }

    currentUser = data.user;
    loadUserProfile();
  } catch (err) {
    signupError.textContent = "Could not create profile.";
  }
});

loginButton.addEventListener("click", async () => {
  const username = loginUsername.value.trim();

  loginError.textContent = "";

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
  } catch (err) {
    loginError.textContent = "Could not login.";
  }
});

function loadUserProfile() {
  authPopup.classList.add("hidden");
  if (currentUser && currentUser.age) {
    ageInput.value = currentUser.age;
    ageButton.click();
  }
}

// ---------- AGE → GAMES ----------

const ageInput = document.getElementById("age-input");
const ageButton = document.getElementById("age-button");
const ageError = document.getElementById("age-error");

const gamesContainer = document.getElementById("games-container");
const chatSection = document.getElementById("chat-section");

ageButton.addEventListener("click", async () => {
  const age = parseInt(ageInput.value);

  gamesContainer.innerHTML = "";
  ageError.textContent = "";

  if (isNaN(age) || age < 4 || age > 18) {
    ageError.textContent = "Please enter an age between 4 and 18.";
    chatSection.style.display = "none";
    return;
  }

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

function displayGames(games) {
  gamesContainer.innerHTML = "";

  if (!games || games.length === 0) {
    gamesContainer.innerHTML = "<p>No games available yet. Johnny is still building them!</p>";
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

// ---------- CHAT ----------

const chatMessages = document.getElementById("chat-messages");
const chatUserId = document.getElementById("chat-user-id");
const chatMessage = document.getElementById("chat-message");
const chatSend = document.getElementById("chat-send");

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

setInterval(() => {
  if (chatSection.style.display === "block") {
    loadChatMessages();
  }
}, 5000);

chatSend.addEventListener("click", async () => {
  const user = chatUserId.value.trim() || "Anon";
  const message = chatMessage.value.trim();

  if (!message) return;

  try {
    await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user, message })
    });

    chatMessage.value = "";
    loadChatMessages();
  } catch (err) {
    alert("Could not send message.");
  }
});
