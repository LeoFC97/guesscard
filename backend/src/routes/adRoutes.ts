import { Router } from 'express';
import { AdController } from '../controllers/adController';

const router = Router();

// Obter disponibilidade de anúncios para um usuário
router.get('/availability/:userId', (req, res) => AdController.getAdAvailability(req, res));

// Registrar visualização de anúncio e recompensar usuário
router.post('/watch', (req, res) => AdController.watchAd(req, res));

// Obter estatísticas de anúncios do usuário
router.get('/stats/:userId', (req, res) => AdController.getAdStats(req, res));

// Obter configurações públicas do sistema de anúncios
router.get('/config', (req, res) => AdController.getAdConfig(req, res));

export default router;