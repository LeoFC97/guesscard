import mongoose from 'mongoose';

const DailyMatchSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  date: { type: String, required: true }, // yyyy-mm-dd
  cardName: { type: String, required: true },
  attempts: { type: Number, required: true },
  timeSpent: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

DailyMatchSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyMatch = mongoose.models.DailyMatch || mongoose.model('DailyMatch', DailyMatchSchema);

export default {
  async saveDailyMatch({ userId, name, email, date, cardName, attempts, timeSpent }: any) {
    return DailyMatch.create({ userId, name, email, date, cardName, attempts, timeSpent });
  },
  async findByUserAndDate(userId: string, date: string) {
    return DailyMatch.findOne({ userId, date });
  },
  async getPlayedDates(userId: string) {
    const docs = await DailyMatch.find({ userId }).select('date -_id');
    return docs.map((d: any) => d.date);
  },
  async getAllByUser(userId: string) {
    return DailyMatch.find({ userId });
  },
};