# ⚡ PTCG Collector

> Aplicativo Android para gerenciar decks, rastrear sua coleção e consultar o pool de cartas do Pokémon TCG — 100% offline, sem login, sem anúncios.

---

## ✨ Funcionalidades

### 🃏 Meus Decks
- Importe listas de decks no formato padrão (`4 Torchic DRI 040`)
- Visualize o progresso de montagem de cada deck em tempo real
- Marque cartas individualmente com checkbox ou use os contadores +/−
- Copie a lista completa para a área de transferência com um toque

### ⚔️ Liga
- **Decks de Liga** — decks pré-cadastrados de Batalha de Liga com progresso de coleção
- **Pool da Liga** — biblioteca de Trainers, Ferramentas, Estádios, Energias e Básicos EX com texto de efeito e todos os números de impressão
- **Coleções** — navegue pelos 7 sets oficiais e rastreie carta por carta qual você possui

### 📦 Coleção Global
- Adicione cartas manualmente em lote pelo formato padrão
- Busca por nome e filtro por set
- Contador de cópias por carta
- Botão "Atualizar PT" para normalizar nomes em inglês para português

---

## 🗂️ Sets incluídos

| Sigla | Nome | Cartas |
|-------|------|--------|
| ASC | Heróis Excelsos | 295 |
| PFL | Fogo Fantasmagórico | 130 |
| MEG | Megaevolução | 188 |
| BLK | Raio Preto | 171 |
| WHT | Fogo Branco | 173 |
| DRI | Rivais Predestinados | 242 |
| MEP | Mega Evolution Promos | 31 |

**Total: 1.230 cartas catalogadas**

---

## 🛠️ Tecnologia

- **HTML + CSS + JavaScript puro** (Vanilla JS, sem frameworks)
- **localStorage** para persistência de dados no dispositivo
- **WebView Android** — casca Java que embala o app como APK instalável
- **PWA-ready** — manifest e Service Worker incluídos
- **Build automatizado** via GitHub Actions (sem necessidade de Android Studio)

---

## 🚀 Como gerar o APK

O APK é gerado automaticamente pelo GitHub Actions a cada push na branch `main`.

1. Faça um commit ou acesse **Actions → Build APK → Run workflow**
2. Aguarde ~2 minutos
3. Baixe o APK em **Actions → build mais recente → Artifacts → TCGManager-debug**

### Instalar no Android
1. Transfira o `.apk` para o celular
2. Abra o arquivo e permita **"Instalar de fontes desconhecidas"** se solicitado
3. Pronto — o app funciona 100% offline

---

## 📂 Estrutura do projeto

```
├── apk-project/
│   ├── app/
│   │   └── src/main/
│   │       ├── assets/
│   │       │   ├── index.html       # App completo (HTML + CSS + JS)
│   │       │   ├── manifest.json    # PWA manifest
│   │       │   └── sw.js            # Service Worker
│   │       ├── java/com/tcgmanager/
│   │       │   └── MainActivity.java  # WebView shell
│   │       └── res/                 # Ícones do app
│   └── build.gradle
└── .github/
    └── workflows/
        └── build.yml                # GitHub Actions — gera o APK
```

---

## 📋 Formato de importação de decks

O app aceita o formato padrão de listas de decks:

```
Quantidade NomeDaCarta SIGLA NÚMERO
```

**Exemplos:**
```
4 Torchic DRI 040
1 Mewtwo ex da Equipe Rocket DRI 081
2 Ultra Bola ASC 213
```

A quantidade é opcional — se omitida, assume 1 cópia.

---

## 🔒 Privacidade

Todos os dados ficam armazenados **localmente no dispositivo** via `localStorage`. Nenhuma informação é enviada para servidores externos. O app não requer internet após a instalação.

---

## 📄 Licença

Este projeto é de uso pessoal. As cartas, nomes e imagens do Pokémon TCG são propriedade da **The Pokémon Company**.
