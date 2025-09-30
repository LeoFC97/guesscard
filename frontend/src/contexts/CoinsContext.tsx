import React, { createContext, useContext, useState, useCallback } from 'react';
import coinsApi from '../services/coinsApi';

interface CoinReward {
  coinsEarned: number;
  rewardType: string;
  newBalance: number;
  rewardDescription: string;
}

interface CoinsContextType {
  balance: number;
  loading: boolean;
  userId?: string;
  setUserId: (userId: string) => void;
  refreshBalance: () => Promise<void>;
  animateCoinsGain: (reward: CoinReward) => void;
  coinAnimation: {
    show: boolean;
    amount: number;
    description?: string;
  };
  clearAnimation: () => void;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

export const useCoins = () => {
  const context = useContext(CoinsContext);
  if (!context) {
    throw new Error('useCoins deve ser usado dentro de um CoinsProvider');
  }
  return context;
};

interface CoinsProviderProps {
  children: React.ReactNode;
}

export const CoinsProvider: React.FC<CoinsProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [coinAnimation, setCoinAnimation] = useState({
    show: false,
    amount: 0,
    description: undefined as string | undefined,
  });

  const refreshBalance = useCallback(async () => {
    if (!userId || userId === 'guest') {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      const userCoins = await coinsApi.getUserCoins(userId);
      setBalance(userCoins.balance);
    } catch (error) {
      console.error('Erro ao buscar saldo de moedas:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const animateCoinsGain = useCallback((reward: CoinReward) => {
    // Atualizar o saldo imediatamente
    setBalance(reward.newBalance);
    
    // Mostrar animação
    setCoinAnimation({
      show: true,
      amount: reward.coinsEarned,
      description: reward.rewardDescription,
    });

    // Esconder animação após 3 segundos
    setTimeout(() => {
      setCoinAnimation(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const clearAnimation = useCallback(() => {
    setCoinAnimation({
      show: false,
      amount: 0,
      description: undefined,
    });
  }, []);

  const value: CoinsContextType = {
    balance,
    loading,
    userId,
    setUserId,
    refreshBalance,
    animateCoinsGain,
    coinAnimation,
    clearAnimation,
  };

  return (
    <CoinsContext.Provider value={value}>
      {children}
    </CoinsContext.Provider>
  );
};