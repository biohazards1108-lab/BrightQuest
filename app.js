// ===============================
// BrightQuest Frontend Script
// ===============================

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
