import mongoose from 'mongoose';

const DailyCardSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // yyyy-mm-dd
  cardName: { type: String, required: true },
});

const DailyCard = mongoose.models.DailyCard || mongoose.model('DailyCard', DailyCardSchema);

export default {
  async setDailyCard(date: string, cardName: string) {
    return DailyCard.findOneAndUpdate(
      { date },
      { cardName },
      { upsert: true, new: true }
    );
  },
  async getDailyCard(date: string) {
    return DailyCard.findOne({ date });
  },
  async getAll() {
    return DailyCard.find({}).sort({ date: 1 });
  }
};
