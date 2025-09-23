import { Router } from 'express';
import { MtgController } from '../controllers/mtgController';

const router = Router();
const controller = new MtgController();

router.post('/guess', (req, res) => controller.guessCard(req, res));
router.get('/card/:name', (req, res) => controller.getCard(req, res));
router.post('/new-game', (req, res) => MtgController.newGame(req, res));

export function setRoutes(app: any) {
    app.use('/api', router);
}