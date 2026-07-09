# App Mobile — SEAD Enquadramento Tarifário

React Native + Expo. Consome o backend FastAPI (`/faturas/extrair` e `/enquadramentos`).

## Rodando localmente

```bash
npm install
npx expo start
```

Isso abre o Metro Bundler no terminal com um QR code. Você pode rodar em:
- **Expo Go** no seu celular (baixa na App Store/Play Store) — escaneia o QR code. **Precisa estar na mesma rede Wi-Fi do PC** rodando o backend.
- **Emulador Android** (`npx expo start --android`, com Android Studio instalado)
- **Simulador iOS** (`npx expo start --ios`, só em Mac com Xcode)

## ⚠️ Ajustar o endereço do backend antes de testar

Abra `src/api/client.ts` e ajuste `API_BASE_URL`:

| Onde você está testando | O que colocar |
|---|---|
| Emulador Android | `http://10.0.2.2:8000` (já é o padrão) |
| Simulador iOS | `http://localhost:8000` |
| Celular físico (Expo Go) | `http://SEU_IP_LOCAL:8000` (ex: `http://192.168.0.15:8000`) — celular e PC na mesma Wi-Fi |

Pra achar seu IP local no Linux: `ip addr show | grep "inet " | grep -v 127.0.0.1`

E lembra: o backend (`uvicorn app.main:app --reload`) precisa estar rodando com `--host 0.0.0.0` pra aceitar conexão de fora do próprio PC (celular físico), não só `--host 127.0.0.1` (padrão):

```bash
uvicorn app.main:app --reload --host 0.0.0.0
```

## Fluxo do app (o que já funciona)

```
Upload PDF (UC01/UC02)
   ↓ POST /faturas/extrair
Conferência dos dados (UC03)
   → se Fatura Unificada com várias UCs, escolhe qual conferir
   → se Grupo B, mostra só os dados básicos (sem botão de enquadramento)
   → se Grupo A, permite corrigir a demanda contratada e confirmar
   ↓ "Realizar Enquadramento"
Dashboard (UC07/UC08)
   ↓ POST /enquadramentos
   → demanda ideal, economia mensal/anual, recomendação
   → toggle Verde/Azul (Azul ainda desabilitado -- motor de cálculo
     Azul não foi implementado no backend ainda, só Verde)
```

## O que NÃO está implementado ainda (de propósito)

- **Persistência**: cada "Realizar Enquadramento" recalcula do zero. Não há lista de UCs
  salvas, nem histórico de faturas acumuladas -- isso depende do banco de dados no
  backend, que ainda não foi criado.
- **Tela "Lista de UCs por órgão" (UC10)**: por enquanto o app só processa 1 fatura por
  vez, de forma avulsa. Quando o banco existir, essa tela vira a home real do app.
- **Tarifa Azul**: o motor de cálculo (`app/calculo/enquadramento.py`) só implementa
  Verde. O toggle já está na UI, desabilitado, esperando essa implementação.
- **Optante B**: nem UI nem backend ainda.
- **Autenticação**: não tem login. Pra um app usado por servidores públicos, isso vai
  precisar entrar antes de qualquer deploy real.

## Publicando na App Store / Play Store (quando estiver pronto)

O Expo permite gerar o build de produção sem precisar de Mac (via **EAS Build**, na nuvem):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios       # gera o .ipa
eas build --platform android   # gera o .apk/.aab
```

Pra iOS você ainda vai precisar de uma conta Apple Developer (US$ 99/ano) pra publicar na
App Store, mesmo usando EAS Build (o build roda na nuvem, mas a assinatura/publicação
exige a conta). Pra Android, conta Google Play Console é pagamento único (~US$ 25).
