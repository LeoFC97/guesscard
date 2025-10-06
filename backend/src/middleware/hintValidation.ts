import { Request, Response, NextFunction } from 'express';
import { HintType, isValidHintType } from '../config/hintConfig';

export interface ValidatedHintRequest extends Request {
    body: {
        gameId: string;
        hintType: HintType;
        userId: string;
    };
}

export const validateHintRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { gameId, hintType, userId } = req.body;

    // Validar presença dos campos obrigatórios
    if (!gameId || typeof gameId !== 'string') {
        res.status(400).json({ 
            message: 'GameId is required and must be a string',
            field: 'gameId'
        });
        return;
    }

    if (!userId || typeof userId !== 'string') {
        res.status(400).json({ 
            message: 'UserId is required and must be a string',
            field: 'userId'
        });
        return;
    }

    if (!hintType || typeof hintType !== 'string') {
        res.status(400).json({ 
            message: 'HintType is required and must be a string',
            field: 'hintType'
        });
        return;
    }

    // Validar tipo de dica
    if (!isValidHintType(hintType)) {
        res.status(400).json({ 
            message: 'Invalid hint type. Must be mana_cost or card_type',
            field: 'hintType',
            allowedValues: ['mana_cost', 'card_type']
        });
        return;
    }

    // Validar formato do gameId
    if (gameId.length < 1 || gameId.length > 100) {
        res.status(400).json({ 
            message: 'GameId must be between 1 and 100 characters',
            field: 'gameId'
        });
        return;
    }

    // Validar formato do userId
    if (userId.length < 1 || userId.length > 100) {
        res.status(400).json({ 
            message: 'UserId must be between 1 and 100 characters',
            field: 'userId'
        });
        return;
    }

    next();
};

export const validateHintRateLimit = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Sistema simples de rate limiting para dicas
    // Pode ser expandido com Redis ou similar para produção
    const userAgent = req.get('User-Agent') || 'unknown';
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Por enquanto, apenas log para monitoramento
    console.log(`Hint request from IP: ${clientIP}, User-Agent: ${userAgent}`);
    
    next();
};