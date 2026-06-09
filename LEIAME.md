# Diário da Cefaleia — guia rápido

App de uso domiciliar para o paciente registrar a dor de cabeça todo dia, ver o
próprio progresso e enviar o diário para a clínica. Instala como aplicativo, sem loja.

## Arquivos
- `index.html` — o app
- `manifest.webmanifest` — torna instalável
- `sw.js` — funcionamento offline
- `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` — ícones

Mantenha todos na mesma pasta.

## Como publicar (você)
Precisa de HTTPS para instalar como app. Duas opções:

1. **Vercel** (recomendado, igual ao que você já usa)
   - Crie um projeto novo e suba esta pasta, ou conecte um repositório do GitHub com estes arquivos.
   - O link gerado (ex.: `diario-cefaleia.vercel.app`) é o que você manda ao paciente.

2. **GitHub Pages**
   - Suba os arquivos num repositório, ative Pages na branch principal.

Não precisa de servidor, banco de dados nem build. É site estático.

## Como o paciente instala
- Abre o link no celular.
- **Android (Chrome):** aparece "Instalar app" / menu ⋮ → "Adicionar à tela inicial".
- **iPhone (Safari):** botão Compartilhar → "Adicionar à Tela de Início".
- Vira um ícone de app. Funciona offline depois da primeira abertura.

## Como os dados chegam até você
O paciente toca em **Enviar para a clínica** → compartilha o CSV pelo WhatsApp ou
e-mail. O `código do paciente` (em Ajustes) liga o diário ao prontuário e ao seu
fluxo em R. Os dados ficam só no aparelho até o paciente enviar (LGPD a favor).

## Importar no avaliador / R
O CSV abre direto no Excel e no R (`read.csv2` ou `readr::read_delim`). Colunas:
codigo, nome, data, teve_dor, intensidade, duracao, tomou_remedio, remedios,
sintomas, gatilhos, anotacao.
