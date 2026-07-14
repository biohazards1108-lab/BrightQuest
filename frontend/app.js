const API_BASE = 'http://localhost:3000'; // change to Railway URL when deployed

const ageInput = document.getElementById('age-input');
const ageButton = document.getElementById('age-button');
const ageError = document.getElementById('age-error');
const gamesList = document.getElementById('games-list');
const chatSection = document.getElementById('chat-section');
const chatMessages = document.getElementById('chat-messages');
const chatUserId = document.getElementById('chat-user-id');
const chatMessage = document.getElementById('chat-message');
const chatSend = document.getElementById('chat-send');

ageButton.addEventListener('click', async () => {
  const age = parseInt(ageInput.value);

  gamesList.innerHTML = '';
  ageError.textContent = '';

  if (isNaN(age) || age < 4 || age > 18) {
    ageError.textContent = 'Please enter an age between 4 and 18.';
    chatSection.style.display = 'none';
    return;
  }

  // show chat only for teens
  if (age >= 13) {
    chatSection.style.display = 'block';
    loadChatMessages();
  } else {
    chatSection.style.display = 'none';
  }

  try {
    const res = await fetch(`${API_BASE}/games/${age}`);
    const games = await res.json();

    if (games.length === 0) {
      gamesList.innerHTML = '<li>No games found for this age yet.</li>';
      return;
    }

    games.forEach(game => {
      const li = document.createElement('li');
      li.textContent = game.title + ' — ' + (game.description || '');
      gamesList.appendChild(li);
    });
  } catch (err) {
    gamesList.innerHTML = '<li>Could not load games. Please try again.</li>';
  }
});

async function loadChatMessages() {
  try {
    const res = await fetch(`${API_BASE}/chat`);
    const messages = await res.json();

    chatMessages.innerHTML = '';
    messages.forEach(msg => {
      const li = document.createElement('li');
      const name = msg.user_id || 'Anon';
      li.textContent = `${name}: ${msg.message}`;
      chatMessages.appendChild(li);
    });
  } catch (err) {
    chatMessages.innerHTML = '<li>Could not load chat.</li>';
  }
}

chatSend.addEventListener('click', async () => {
  const user = chatUserId.value.trim() || 'Anon';
  const message = chatMessage.value.trim();

  if (!message) return;

  try {
    await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user, message })
    });

    chatMessage.value = '';
    loadChatMessages();
  } catch (err) {
    alert('Could not send message.');
  }
});
