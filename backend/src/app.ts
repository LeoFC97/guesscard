
import express from 'express';
import bodyParser from 'body-parser';
import { setRoutes } from './routes/mtgRoutes';
import coinsRoutes from './routes/coinsRoutes';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dailyCardRepo from './repositories/dailyCardRepository';
dotenv.config();



const app = express();
const PORT = process.env.PORT || 3001;

// Conexão com MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI não definida no .env');
}
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB Atlas conectado'))
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB Atlas:', err);
    process.exit(1);
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Routes
setRoutes(app);
app.use('/api/coins', coinsRoutes);

app.use(cors({
  origin: 'https://guesscard.vercel.app/' // ou a URL do seu frontend no Render/Vercel/Netlify
}));


app.listen(PORT, async () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Popular cartas do dia se não existirem
    const dailyCards = [
      { date: '2025-09-25', cardName: 'Black Lotus' },
      { date: '2025-09-26', cardName: 'Scryb Sprites' },
      { date: '2025-09-27', cardName: 'Brainstorm' },
      { date: '2025-09-28', cardName: 'Delver of Secrets' },
      { date: '2025-09-29', cardName: 'Counterspell' },
      { date: '2025-09-30', cardName: 'Dark Ritual' },
      { date: '2025-10-01', cardName: 'Walking Ballista' },
    ];
    for (const { date, cardName } of dailyCards) {
      await dailyCardRepo.setDailyCard(date, cardName);
    }
    console.log('Daily cards seeded');
});