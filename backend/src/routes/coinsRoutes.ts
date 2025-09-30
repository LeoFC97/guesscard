import { Router } from 'express';
import { CoinsController } from '../controllers/coinsController';

const router = Router();

// GET /api/coins/:userId - Obter saldo do usuário
router.get('/:userId', CoinsController.getUserCoins);

// GET /api/coins/:userId/stats - Obter estatísticas detalhadas
router.get('/:userId/stats', CoinsController.getUserCoinStats);

// GET /api/coins/:userId/history - Obter histórico de transações
router.get('/:userId/history', CoinsController.getCoinHistory);

// GET /api/coins/:userId/statement - Obter extrato completo de moedas
router.get('/:userId/statement', CoinsController.getCoinStatement);

// POST /api/coins/add - Adicionar moedas ao usuário
router.post('/add', CoinsController.addCoins);

// POST /api/coins/spend - Gastar moedas do usuário
router.post('/spend', CoinsController.spendCoins);

// POST /api/coins/reward - Recompensar usuário por conquista
router.post('/reward', CoinsController.rewardUser);

// GET /api/coins/prices - Obter tabela de preços
router.get('/prices', CoinsController.getPrices);

// PUT /api/coins/:userId/reset - Resetar moedas do usuário (admin)
router.put('/:userId/reset', CoinsController.resetUserCoins);

export default router;