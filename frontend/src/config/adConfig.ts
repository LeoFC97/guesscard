// Configurações dos anúncios AdSense
export const AD_CONFIG = {
  // ID do Publisher (seu código principal do AdSense)
  PUBLISHER_ID: 'ca-pub-3322168839772907',
  
  // Ad Unit IDs - SUBSTITUA pelos IDs reais do painel AdSense
  AD_UNITS: {
    // Banner horizontal no topo da página inicial
    BANNER_TOP: '1234567890', // ⚠️ SUBSTITUA pelo ID real
    
    // Banner retângulo no modo texto  
    BANNER_TEXT_MODE: '2345678901', // ⚠️ SUBSTITUA pelo ID real
    
    // Sidebar esquerda durante o jogo
    SIDEBAR_LEFT: '3456789012', // ⚠️ SUBSTITUA pelo ID real
    
    // Sidebar direita durante o jogo
    SIDEBAR_RIGHT: '4567890123', // ⚠️ SUBSTITUA pelo ID real
    
    // Anúncio intersticial após vitórias
    INTERSTITIAL: '5678901234', // ⚠️ SUBSTITUA pelo ID real
  },
  
  // Configurações para teste (use durante desenvolvimento)
  TEST_MODE: false, // Mude para true para usar anúncios de teste
  
  // IDs de teste do Google (use apenas durante desenvolvimento)
  TEST_AD_UNITS: {
    BANNER_TOP: 'ca-app-pub-3940256099942544/6300978111',
    BANNER_TEXT_MODE: 'ca-app-pub-3940256099942544/6300978111', 
    SIDEBAR_LEFT: 'ca-app-pub-3940256099942544/1033173712',
    SIDEBAR_RIGHT: 'ca-app-pub-3940256099942544/1033173712',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  }
};

// Função helper para pegar o ID correto (teste ou produção)
export const getAdUnitId = (adType: keyof typeof AD_CONFIG.AD_UNITS): string => {
  if (AD_CONFIG.TEST_MODE) {
    return AD_CONFIG.TEST_AD_UNITS[adType];
  }
  return AD_CONFIG.AD_UNITS[adType];
};