# API de Dicas - MTGdle

## Visão Geral
Sistema de dicas monetizadas para o jogo MTGdle que permite aos jogadores adquirir informações sobre cartas em troca de moedas.

## Endpoints

### 1. Obter Dicas Disponíveis
```
GET /api/available-hints
```

**Descrição:** Retorna informações sobre todas as dicas disponíveis no sistema.

**Resposta:**
```json
{
  "success": true,
  "hints": [
    {
      "type": "mana_cost",
      "cost": 1,
      "description": "Dica do custo de mana"
    },
    {
      "type": "card_type",
      "cost": 1,
      "description": "Dica do tipo da carta"
    }
  ]
}
```

### 2. Solicitar Dica
```
POST /api/request-hint
```

**Middlewares aplicados:**
- `validateHintRateLimit` - Controle de taxa de requisições
- `validateHintRequest` - Validação dos campos obrigatórios

**Body da requisição:**
```json
{
  "gameId": "string",       // ID da partida ativa
  "hintType": "mana_cost",  // Tipo da dica: "mana_cost" | "card_type"
  "userId": "string"        // ID do usuário
}
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "hintType": "mana_cost",
  "hintValue": 3,
  "costPaid": 1,
  "newBalance": 15,
  "message": "Hint revealed for 1 coin(s)"
}
```

**Resposta de erro - Moedas insuficientes:**
```json
{
  "message": "Insufficient coins for hint",
  "required": 1,
  "current": 0
}
```

**Resposta de erro - Jogo não encontrado:**
```json
{
  "message": "Game not found. Please start a new game."
}
```

## Tipos de Dicas

### Custo de Mana (mana_cost)
- **Custo:** 1 moeda
- **Retorna:** Valor numérico do custo de mana convertido da carta
- **Exemplo:** Para uma carta com custo {2}{U}{U}, retorna 4

### Tipo da Carta (card_type)
- **Custo:** 1 moeda
- **Retorna:** Primeiro tipo da carta (Creature, Instant, Sorcery, etc.)
- **Exemplo:** Para "Creature — Human Wizard", retorna "Creature"

## Rate Limiting

O sistema possui controle de taxa de requisições por usuário:
- **Máximo por hora:** 30 requisições
- **Máximo por minuto:** 5 requisições

## Validações

### Campos obrigatórios:
- `gameId` (string, 1-100 caracteres)
- `hintType` (string, deve ser 'mana_cost' ou 'card_type')
- `userId` (string, 1-100 caracteres)

### Validações de negócio:
- Usuário deve ter moedas suficientes
- Jogo deve existir e estar ativo
- Tipo de dica deve ser válido

## Fluxo de Pagamento

1. Sistema verifica se o usuário tem moedas suficientes
2. Se sim, debita o valor das moedas do usuário
3. Busca informações da carta no Scryfall
4. Processa a dica específica solicitada
5. Retorna a informação e o novo saldo

## Logs e Monitoramento

O sistema registra detalhadamente:
- Início e fim de cada requisição de dica
- Performance (tempo de resposta)
- Erros e falhas
- Informações de auditoria (usuário, tipo de dica, valor pago)

## Configuração

Todas as configurações do sistema estão centralizadas em `/config/hintConfig.ts`:
- Custos das dicas
- Tipos válidos
- Descrições
- Limites de rate limiting

## Exemplo de Uso Completo

```typescript
// 1. Verificar dicas disponíveis
const hintsResponse = await fetch('/api/available-hints');
const { hints } = await hintsResponse.json();

// 2. Solicitar dica de custo de mana
const hintResponse = await fetch('/api/request-hint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    gameId: 'abc-123-def',
    hintType: 'mana_cost',
    userId: 'user-456'
  })
});

const result = await hintResponse.json();
console.log(`A carta custa ${result.hintValue} de mana. Saldo restante: ${result.newBalance}`);
```