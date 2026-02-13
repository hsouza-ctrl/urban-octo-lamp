# Casino In-Game Top Bar

Visualização de top bar para jogo de casino com informações do sistema, status de fidelidade, nível do jogador e botão de saída.

## Funcionalidades

- **Status Bar do Sistema**: Exibe hora atual, sinal de celular, Wi-Fi e bateria
- **Loyalty Status**: Indicador circular com progresso de fidelidade (com ícone de estrela/cristal)
- **Nível do Jogador**: Círculo com label "LV" e número do nível
- **Botão de Sair**: Botão no canto direito para sair do jogo

## Tecnologias

- React 18
- TypeScript
- Vite
- CSS3

## Instalação

```bash
npm install
```

## Desenvolvimento

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Estrutura do Projeto

```
src/
  components/
    TopBar.tsx          # Componente principal da barra superior
    SystemStatusBar.tsx # Barra de status do sistema (hora, bateria, etc.)
    LoyaltyStatus.tsx   # Indicador de status de fidelidade
    PlayerLevel.tsx     # Indicador de nível do jogador
    ExitButton.tsx      # Botão de sair
  App.tsx
  main.tsx
```

## Personalização

Os componentes aceitam props para personalização:

- `TopBar`: `loyaltyProgress` (0-100), `playerLevel` (número), `onExit` (callback)
- `LoyaltyStatus`: `progress` (0-100)
- `PlayerLevel`: `level` (número)
