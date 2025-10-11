// Utilitários para debug do AdSense

export const checkAdSenseStatus = () => {
    console.log('=== AdSense Debug Info ===');
    console.log('window.adsbygoogle exists:', !!window.adsbygoogle);
    console.log('AdSense script loaded:', !!document.querySelector('script[src*="adsbygoogle"]'));
    
    // Verificar se há elementos de anúncio na página
    const adElements = document.querySelectorAll('.adsbygoogle');
    console.log('Ad elements found:', adElements.length);
    
    adElements.forEach((element, index) => {
        const slot = element.getAttribute('data-ad-slot');
        const client = element.getAttribute('data-ad-client');
        const format = element.getAttribute('data-ad-format');
        
        console.log(`Ad ${index + 1}:`, {
            slot,
            client,
            format,
            hasContent: element.innerHTML.trim() !== '',
            styles: window.getComputedStyle(element)
        });
    });
    
    // Verificar se AdSense está funcionando
    if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
        console.log('AdSense array initialized, length:', window.adsbygoogle.length);
    } else {
        console.warn('AdSense may not be loaded properly');
    }
    
    console.log('==========================');
};

export const waitForAdSense = (timeout = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkAdSense = () => {
            if (window.adsbygoogle) {
                resolve(true);
                return;
            }
            
            if (Date.now() - startTime > timeout) {
                resolve(false);
                return;
            }
            
            setTimeout(checkAdSense, 100);
        };
        
        checkAdSense();
    });
};

// Função para tentar recarregar anúncios
export const reloadAds = () => {
    console.log('Tentando recarregar anúncios...');
    
    const adElements = document.querySelectorAll('.adsbygoogle');
    adElements.forEach((element) => {
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('Erro ao recarregar anúncio:', error);
        }
    });
};

// Adicionar função ao objeto global para debug no console
declare global {
    interface Window {
        adDebug: {
            check: () => void;
            reload: () => void;
        };
    }
}

window.adDebug = {
    check: checkAdSenseStatus,
    reload: reloadAds
};