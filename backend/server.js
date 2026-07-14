import express from 'express';
import cors from 'cors';
import gamesRoutes from './routes/games.js';
import chatRoutes from './routes/chat.js';
import authRoutes from "./routes/auth.js";
app.use("/auth", authRoutes);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/games', gamesRoutes);
app.use('/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('BrightQuest API is running');
});

app.listen(3000, () => console.log('Server running on port 3000'));
