# 📋 Guia: Como Obter Ad Unit IDs do Google AdSense

## 🚀 Passo a Passo Completo

### 1. **Acesse o Painel do AdSense**
```
https://www.google.com/adsense/
```

### 2. **Navegue para Anúncios**
```
Menu Lateral → "Anúncios" → "Por site"
```

### 3. **Criar Unidades de Anúncio**

Para cada área do seu site, você precisa criar uma unidade:

#### 🔹 **Banner Superior (728x90)**
```
1. Clique "Criar unidade de anúncio"
2. Selecione "Anúncio display"
3. Nome: "Banner Superior Home" 
4. Tamanho: Responsivo (ou fixo 728x90)
5. Clique "Criar"
6. COPIE o código: data-ad-slot="1234567890"
```

#### 🔹 **Banner Retângulo (300x250)**
```
1. Nova unidade de anúncio
2. Nome: "Banner Modo Texto"
3. Tamanho: Responsivo (ou fixo 300x250)
4. COPIE o Ad Slot ID
```

#### 🔹 **Sidebar Vertical (160x600)**
```
1. Nova unidade de anúncio  
2. Nome: "Sidebar Jogo"
3. Tamanho: Responsivo (ou fixo 160x600)
4. COPIE o Ad Slot ID
```

#### 🔹 **Anúncio Intersticial**
```
1. Nova unidade de anúncio
2. Selecione "Anúncio intersticial"
3. Nome: "Intersticial Pós-Jogo"
4. COPIE o Ad Slot ID
```

### 4. **Onde Encontrar o Ad Slot ID**

Após criar cada unidade, você verá um código HTML como este:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3322168839772907"
     crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-3322168839772907"
     data-ad-slot="1234567890"    ← ESTE É O ID QUE VOCÊ PRECISA!
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

**O número após `data-ad-slot=` é o seu Ad Unit ID!**

### 5. **Como Configurar no Código**

Abra o arquivo: `frontend/src/config/adConfig.ts`

Substitua os IDs de exemplo pelos reais:

```typescript
AD_UNITS: {
  BANNER_TOP: '1234567890',        // ← Cole o ID do Banner Superior aqui
  BANNER_TEXT_MODE: '2345678901',  // ← Cole o ID do Banner Texto aqui  
  SIDEBAR_LEFT: '3456789012',      // ← Cole o ID da Sidebar aqui
  SIDEBAR_RIGHT: '4567890123',     // ← Cole outro ID da Sidebar aqui
  INTERSTITIAL: '5678901234',      // ← Cole o ID do Intersticial aqui
}
```

### 6. **Modo de Teste**

Enquanto você não tem os IDs reais, pode usar o modo de teste:

```typescript
// Em adConfig.ts, mude para:
TEST_MODE: true,
```

Isso usará anúncios de teste do Google para você desenvolver sem problemas!

## ⚠️ **IMPORTANTE**

- **NÃO use IDs de teste em produção** - Isso pode banir sua conta
- **Aguarde aprovação** - Seus anúncios só funcionarão após o AdSense aprovar seu site
- **Teste primeiro** - Use TEST_MODE: true durante desenvolvimento

## 🎯 **Status Atual**

✅ Código de verificação adicionado  
✅ Espaços para anúncios criados  
⏳ Aguardando: Aprovação do AdSense  
⏳ Próximo: Obter Ad Unit IDs reais  