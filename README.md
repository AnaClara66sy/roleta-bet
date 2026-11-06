# Roleta de Brindes

Aplicação React + TypeScript + Tailwind CSS para eventos, com identidade visual Mottainai. A roleta usa SVG com cinco setores visualmente iguais; o sorteio mantém os pesos configurados e usa `crypto.getRandomValues()`.

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

Os cinco prêmios e suas probabilidades ficam em `src/prizes.ts`. O sorteio ocorre antes da animação. A roleta gira seis voltas e termina com o centro do setor sorteado sob o ponteiro. Pode ser acionada pelo botão ou pelo centro. Após o resultado, um toque na tela volta à roleta.

O arquivo `render.yaml` configura a publicação como site estático no Render, usando a branch `codex/roleta-interativa` e a pasta `dist`.
