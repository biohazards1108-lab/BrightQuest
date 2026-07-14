import express from 'express';
import cors from 'cors';

import gamesRoutes from './routes/games.js';
import chatRoutes from './routes/chat.js';
import authRoutes from './routes/auth.js';

const app = express();

// Railway requires this:
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ROUTES
app.use('/auth', authRoutes);
app.use('/games', gamesRoutes);
app.use('/chat', chatRoutes);

// ROOT TEST
app.get('/', (req, res) => {
  res.send('BrightQuest API is running');
});

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
