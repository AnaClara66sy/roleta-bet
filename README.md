# Roleta de Brindes

Aplicação React + TypeScript + Tailwind CSS para eventos. A roleta usa SVG com setores proporcionais aos pesos configurados e sorteio por `crypto.getRandomValues()`.

## Executar

Requer Node.js 18+.

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite. Para validar e gerar a versão de produção:

```bash
npm test
npm run build
```

## Funcionamento

Os cinco prêmios e suas probabilidades ficam em `src/prizes.ts`. O sorteio ocorre antes da animação. A roleta gira seis voltas e termina com o centro do setor sorteado sob o ponteiro. Cada resultado concluído é salvo em `localStorage`, exclusivamente neste navegador. O painel administrativo mostra contagens, percentuais observados e as últimas 20 jogadas; a limpeza requer confirmação. Para consolidar resultados entre dispositivos ou impedir manipulação local em um evento, será necessário um servidor e controle de acesso próprios.
