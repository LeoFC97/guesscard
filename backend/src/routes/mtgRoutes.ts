import { Router } from 'express';
import { MtgController } from '../controllers/mtgController';

const router = Router();
const controller = new MtgController();

router.post('/guess', (req, res) => controller.guessCard(req, res));
router.get('/card/:name', (req, res) => controller.getCard(req, res));
router.post('/new-game', (req, res) => MtgController.newGame(req, res));
router.get('/daily-game', (req, res) => MtgController.dailyGame(req, res));
router.get('/daily-played-dates/:userId', (req, res) => MtgController.getDailyPlayedDates(req, res));
router.get('/user-stats/:userId', (req, res) => MtgController.getUserStats(req, res));

// Leaderboard routes
router.get('/leaderboards/normal', (req, res) => MtgController.getNormalLeaderboard(req, res));
router.get('/leaderboards/daily', (req, res) => MtgController.getDailyLeaderboard(req, res));
router.get('/leaderboards/speed/:gameType', (req, res) => MtgController.getSpeedLeaderboard(req, res));
router.get('/leaderboards/perfect/:gameType', (req, res) => MtgController.getPerfectLeaderboard(req, res));


export function setRoutes(app: any) {
    app.use('/api', router);
}