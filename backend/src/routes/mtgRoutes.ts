import { Router } from 'express';
import { MtgController } from '../controllers/mtgController';

const router = Router();
const controller = new MtgController();

router.post('/guess', (req, res) => controller.guessCard(req, res));
router.get('/card/:name', (req, res) => controller.getCard(req, res));
router.post('/new-game', (req, res) => MtgController.newGame(req, res));
router.post('/new-text-game', (req, res) => MtgController.newTextGame(req, res));
router.post('/new-blur-game', (req, res) => MtgController.newBlurGame(req, res));
router.get('/blur-game/:gameId', (req, res) => MtgController.getBlurGameStatus(req, res));
router.get('/daily-game', (req, res) => MtgController.dailyGame(req, res));
router.get('/daily-played-dates/:userId', (req, res) => MtgController.getDailyPlayedDates(req, res));
router.get('/user-stats/:userId', (req, res) => MtgController.getUserStats(req, res));
router.get('/user-blur-stats/:userId', (req, res) => MtgController.getUserBlurStats(req, res));
router.get('/user-text-stats/:userId', (req, res) => MtgController.getUserTextStats(req, res));

// Leaderboard routes
router.get('/leaderboards/normal', (req, res) => MtgController.getNormalLeaderboard(req, res));
router.get('/leaderboards/daily', (req, res) => MtgController.getDailyLeaderboard(req, res));
router.get('/leaderboards/blur', (req, res) => MtgController.getBlurLeaderboard(req, res));
router.get('/leaderboards/blur-speed', (req, res) => MtgController.getBlurSpeedLeaderboard(req, res));
router.get('/leaderboards/blur-perfect', (req, res) => MtgController.getBlurPerfectLeaderboard(req, res));
router.get('/leaderboards/text', (req, res) => MtgController.getTextLeaderboard(req, res));
router.get('/leaderboards/text-speed', (req, res) => MtgController.getTextSpeedLeaderboard(req, res));
router.get('/leaderboards/text-perfect', (req, res) => MtgController.getTextPerfectLeaderboard(req, res));
router.get('/leaderboards/speed/:gameType', (req, res) => MtgController.getSpeedLeaderboard(req, res));
router.get('/leaderboards/perfect/:gameType', (req, res) => MtgController.getPerfectLeaderboard(req, res));


export function setRoutes(app: any) {
    app.use('/api', router);
}