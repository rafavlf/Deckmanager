# PTCG Collector

> Aplicativo Android para jogadores do Pokémon TCG gerenciarem decks, rastrearem coleção, consultarem o pool de ferramentas da Liga e completarem a Pokédex 151 — **100% offline, sem login, sem anúncios.**

---

## Funcionalidades

### Meus Decks
- Importe listas de decks no formato padrão (`4 Torchic DRI 040`)
- Barra de progresso e indicador **"Faltam X cartas"** em tempo real
- Filtro **"Mostrar apenas o que falta"** para facilitar compras e trocas
- Marque cartas individualmente com checkbox ou use os contadores +/−
- Cópias de uma carta em qualquer set contam para o mesmo slot do deck (**reprints reconhecidos**)
- Copie a lista completa para a área de transferência com um toque

### Pool
**Pool Tools** — biblioteca de referência do formato Liga:
- 66+ Trainers (Itens, Ferramentas, Estádios, Energias)
- 20 Pokémon Básicos EX
- Filtros por tipo e busca por nome
- Contadores integrados com a Coleção Global
- Toque em qualquer código de impressão para abrir no Limitless TCG

**Coleções Principais** — 10 sets catalogados com 1.724 cartas:

| Sigla | Nome | Cartas |
|-------|------|--------|
| ASC | Heróis Excelsos | 295 |
| PFL | Fogo Fantasmagórico | 130 |
| MEG | Megaevolução | 188 |
| BLK | Raio Preto | 171 |
| WHT | Fogo Branco | 173 |
| DRI | Rivais Predestinados | 242 |
| MEP | Mega Evolution Promos | 31 |
| JTG | Amigos de Jornada | 190 |
| PRE | Evoluções Prismáticas | 180 |
| POR | Equilíbrio Perfeito | 124 |

**Pokédex 151** — rastreie os 151 Pokémon originais:
- Vincule qualquer carta de qualquer set ao slot correspondente
- Badge **"Na coleção"** destaca cartas que você já possui
- Marcação manual para Pokémon ainda sem carta nos sets cadastrados
- Sincronização bidirecional automática com a Coleção Global
- Slots verdes = carta vinculada · Âmbar = marcado manualmente

### Coleção Global
- Adicione cartas em lote pelo formato padrão
- **Cartas com reprints agrupadas** — mesmo nome, sets diferentes em sub-linhas
- Busca por nome e filtro por set
- **Exportar** → gera `.csv` com toda a coleção via share sheet nativo do Android
- **Importar** → carrega `.csv` e mescla com a coleção existente
- Botão "Atualizar PT" para normalizar nomes em inglês para português

---

## Integração com Limitless TCG

Em qualquer tela que exiba cartas, toque no botão **🔍 Ver** para abrir a página da carta no [Limitless TCG](https://limitlesstcg.com) — com imagem, texto do efeito e preços atualizados.

---

## Tecnologia

- **HTML + CSS + JavaScript puro** — Vanilla JS, sem frameworks, sem dependências externas
- **Armazenamento nativo Android** via `JavascriptInterface` — dados persistem entre atualizações de APK
- **WebView Android** — casca Java que embala o app como APK instalável

### Pontes nativas (JavascriptInterface)

| Bridge | Função |
|--------|--------|
| `AndroidStorage` | Salva dados em `/data/data/.../files/` — sobrevive a atualizações |
| `AndroidBrowser` | Abre URLs externas no navegador do sistema |
| `AndroidExport` | Exporta CSV via share sheet e importa via file picker nativos |

---

## Como gerar o APK

O APK é gerado automaticamente pelo GitHub Actions a cada push na branch `main`.

1. Faça um commit ou acesse **Actions → Build APK → Run workflow**
2. Aguarde ~2 minutos
3. Baixe em **Actions → build mais recente → Artifacts → TCGManager-debug**

### Instalar no Android
1. Transfira o `.apk` para o celular
2. Abra o arquivo e permita **"Instalar de fontes desconhecidas"** se solicitado
3. Instale **por cima** da versão anterior — os dados são preservados

> Os dados ficam em `/data/data/com.tcgmanager/files/` e sobrevivem a atualizações instaladas por cima. Só são apagados ao **desinstalar** o app. Antes de desinstalar, use **Exportar** para backup.

---

## Estrutura do projeto

```
├── apk-project/
│   ├── app/src/main/
│   │   ├── assets/
│   │   │   ├── index.html           # App completo (HTML + CSS + JS)
│   │   │   ├── manifest.json        # PWA manifest
│   │   │   └── sw.js                # Service Worker
│   │   ├── java/com/tcgmanager/
│   │   │   ├── MainActivity.java    # WebView shell + todas as pontes nativas
│   │   │   └── StorageBridge.java   # Armazenamento persistente nativo
│   │   ├── res/xml/provider_paths.xml   # FileProvider para exportar CSV
│   │   └── AndroidManifest.xml
│   └── app/build.gradle
└── .github/workflows/build.yml      # GitHub Actions
```

---

## Formato de importação de decks

```
Quantidade NomeDaCarta SIGLA NÚMERO
```

```
4 Torchic DRI 040
1 Mewtwo ex da Equipe Rocket DRI 081
2 Ultra Bola ASC 213
```

A quantidade é opcional — se omitida, assume 1 cópia. Cartas de qualquer set são reconhecidas como reprints automaticamente.

---

## Formato CSV de coleção

```csv
id,name,set,number,qty
DRI_081,"Mewtwo ex da Equipe Rocket",DRI,081,2
ASC_213,"Ultra Bola",ASC,213,4
```

---

## Privacidade

Todos os dados ficam armazenados **localmente no dispositivo**. Nenhuma informação é enviada para servidores externos. O app não requer internet após a instalação.

---

## Licença

Projeto de uso pessoal. Cartas, nomes e imagens do Pokémon TCG são propriedade da **The Pokémon Company**.
