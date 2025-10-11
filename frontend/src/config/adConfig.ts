// Configurações dos anúncios AdSense
export const AD_CONFIG = {
  // ID do Publisher (seu código principal do AdSense)
  PUBLISHER_ID: 'ca-pub-3322168839772907',
  
  // Ad Unit IDs - Use o mesmo ID válido para todos até ter IDs específicos
  AD_UNITS: {
    // Banner horizontal no topo da página inicial
    BANNER_TOP: '9071929096', // ✅ ID real do AdSense
    
    // Banner retângulo no modo texto - usando mesmo ID válido temporariamente
    BANNER_TEXT_MODE: '9071929096', // ✅ Usando ID válido
    
    // Sidebar esquerda durante o jogo - usando mesmo ID válido temporariamente
    SIDEBAR_LEFT: '9071929096', // ✅ Usando ID válido
    
    // Sidebar direita durante o jogo - usando mesmo ID válido temporariamente
    SIDEBAR_RIGHT: '9071929096', // ✅ Usando ID válido
    
    // Anúncio intersticial após vitórias - usando mesmo ID válido temporariamente
    INTERSTITIAL: '9071929096', // ✅ Usando ID válido
  },
  
  // Configurações para teste (use durante desenvolvimento)
  TEST_MODE: false, // false = anúncios reais, true = anúncios de teste
  
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