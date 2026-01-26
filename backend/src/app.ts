
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
      { date: '2025-10-02', cardName: 'Lightning Bolt' },
      { date: '2025-10-03', cardName: 'Tarmogoyf' },
      { date: '2025-10-04', cardName: 'Thoughtseize' },
      { date: '2025-10-05', cardName: 'Ponder' },
      { date: '2025-10-06', cardName: 'Snapcaster Mage' },
      { date: '2025-10-07', cardName: 'Birds of Paradise' },
      { date: '2025-10-08', cardName: 'Stoneforge Mystic' },
      { date: '2025-10-09', cardName: 'Mox Opal' },
      { date: '2025-10-10', cardName: 'Liliana of the Veil' },
      { date: '2025-10-11', cardName: 'Serra Angel' },
      { date: '2025-10-12', cardName: 'Shivan Dragon' },
      { date: '2025-10-13', cardName: 'Wrath of God' },
      { date: '2025-10-14', cardName: 'Path to Exile' },
      { date: '2025-10-15', cardName: 'Ulamog, the Ceaseless Hunger' },
    ];
    const extraCards = [
      'Aether Vial',
      'Arcbound Ravager',
      'Balance',
      'Blood Moon',
      'Cryptic Command',
      'Deathrite Shaman',
      'Demonic Tutor',
      'Emrakul, the Aeons Torn',
      'Fabled Passage',
      'Fatal Push',
      'Force of Will',
      'Gaea\'s Cradle',
      'Goblin Guide',
      'Griselbrand',
      'Jace, the Mind Sculptor',
      'Karn Liberated',
      'Kiki-Jiki, Mirror Breaker',
      'Lightning Helix',
      'Lotus Petal',
      'Mana Drain',
      'Mox Amber',
      'Noble Hierarch',
      'Primeval Titan',
      'Ragavan, Nimble Pilferer',
      'Rancor',
      'Sol Ring',
      'Teferi, Time Raveler',
      'Thalia, Guardian of Thraben',
      'Uro, Titan of Nature\'s Wrath',
      'Wasteland',
      'Yawgmoth\'s Will',
    ];
    const startDate = new Date('2025-10-16');
    const endDate = new Date('2026-02-25');
    const seededDates = new Set(dailyCards.map(({ date }) => date));
    const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);
    let cardIndex = 0;
    const dayMs = 24 * 60 * 60 * 1000;
    for (let cursor = new Date(startDate); cursor <= endDate; cursor = new Date(cursor.getTime() + dayMs)) {
      const date = toIsoDate(cursor);
      if (seededDates.has(date)) {
        continue;
      }
      const cardName = extraCards[cardIndex % extraCards.length];
      dailyCards.push({ date, cardName });
      cardIndex += 1;
    }
    for (const { date, cardName } of dailyCards) {
      await dailyCardRepo.setDailyCard(date, cardName);
    }
    console.log('Daily cards seeded');
});