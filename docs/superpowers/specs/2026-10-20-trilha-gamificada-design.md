# Trilha gamificada (estilo Duolingo) com conteúdo da cartilha

Data: 2026-10-20

## Objetivo

Trilha lúdica de 10 fases com explicações, quizzes e situações tirados da *Cartilha Cuidando da saúde mental na gestação e puerpério* (Morais; Rolim), seguindo as regras de `gaminificação/Proposta_Gamificacao_Gestacao_Revisada...pdf`. Visual e ritmo inspirados na trilha do Duolingo: caminho de bolinhas, lições curtas, feedback imediato.

Sucesso = a usuária abre Atividades → Trilha, faz a fase 1 offline, fecha no meio e retoma de onde parou, ganha pontos e conquistas conforme a proposta, e o progresso aparece em outro aparelho após o sync.

## Decisões

- **10 fases = 2 por capítulo da cartilha.** A conquista do tema sai ao fim da fase par (as 5 conquistas da proposta).
- **Local:** a sub-aba "Quiz" de Atividades vira "Trilha". "Conquistas" passa a mostrar as 5 conquistas reais.
- **Conteúdo embutido no app** (arquivo TS), não no banco. É estático, funciona offline e a equipe revisa num arquivo só.
- **Progresso:** SQLite + sync Supabase no padrão atual, com uma linha por casa concluída.
- **Conteúdo é rascunho** até validação pela equipe de saúde (proposta 2.7). Só informação presente na cartilha; nada externo (ex.: CVV não entra).

## Fases

| Tema (capítulo) | Fase | Conteúdo | Conquista |
|---|---|---|---|
| 1. Quando nasce um bebê, também nasce uma mãe | 1. Nasce uma mãe | foco só no bebê; mãe e bebê em adaptação; "mãe" inclui todas as pessoas que engravidam | — |
| | 2. Conectada a si mesma | manter atividades que dão prazer; lista de ideias | Cuidar de si |
| 2. Baby blues ou depressão pós-parto? | 3. O que é baby blues | hormonal; primeiras 24h até ~2 semanas; 50–80% das mães; sintomas; sem rejeição ao bebê; apoio emocional | — |
| | 4. Baby blues x DPP | DPP mais intensa, > 2 semanas, primeiras 4 semanas; sintomas; comunicar profissional de confiança | Compreender as emoções |
| 3. Autocuidado e rede de apoio | 5. Seus direitos | lei 11.108/2005 (acompanhante); lei 11.634/2007 (maternidade vinculada); conhecer direitos é autocuidado | — |
| | 6. Rede de apoio | o que é; fator de proteção; peça ajuda; não espere ser perfeita; firme-se na rede | Fortalecer a rede de apoio |
| 4. Sinais de risco | 7. Montanha-russa emocional | cada gravidez é única; autoestima e estresse; labilidade afetiva | — |
| | 8. Quando buscar ajuda | sono, alimentação, atividade física, acompanhamento psicológico; sinais de DPP → médico da UBS; tratamentos; medicação compatível com amamentação | Reconhecer os sinais |
| 5. Onde posso encontrar ajuda? | 9. Por onde começar | postinho/UBS, orientações e encaminhamentos | — |
| | 10. Urgência e CAPS | urgência → hospital ou SAMU; encaminhamento ao CAPS | Saber onde buscar ajuda |

## Casas

Toda fase tem 5 casas, nesta ordem: **Explicação → Quiz → Explicação → Quiz → Situação**.

- **Explicação:** card de 2–4 frases da cartilha + "Continuar". 0 pts.
- **Quiz:** pergunta com 4 alternativas (1 correta), ordem embaralhada a cada exibição. Acerto: confirma, +10. Erro: mostra a correta + explicação curta, 0 pts, avança mesmo assim.
- **Situação:** cenário fictício curto com 2–3 escolhas; cada escolha tem um retorno acolhedor (nenhuma é "errada"). +10 pela participação.
- **Fase completa** (as 5 casas concluídas na partida): +20 e libera a próxima.

Máximo por fase: 50 pts; trilha: 500 pts por partida.

**Banco:** cada casa de quiz tem 4 perguntas equivalentes (4x, proposta 2.2) → 8 por fase, 80 no total, + 10 situações. A pergunta é sorteada evitando a última exibida naquela casa (guardada só na memória da sessão; não precisa persistir).

## Regras de pontuação (proposta 2.5–2.6)

- Cada casa vale no máximo uma vez por partida: quiz até 10, situação 10, explicação 0.
- Quiz errado pode ser refeito (revisão da fase) e render os 10 que faltam. Quiz já pontuado mostra outra pergunta e não dá pontos.
- Bônus de fase: uma vez por partida.
- Pontos nunca diminuem por revisão.
- Após a fase 10: **Refazer mantendo pontos** (revisar qualquer fase, completar o que falta) ou **Nova partida** (partida + 1, pontos zerados, volta à fase 1).
- Conquistas são permanentes: valem se a fase par do tema foi completada em qualquer partida.

## Telas

**Atividades → Trilha** (`components/atividades/TrilhaMapa.tsx`):
- Topo: total de pontos da partida e "Fase N de 10".
- Card fixo **"Precisa de ajuda agora?"** → `BottomSheetModal` com sinais de risco e onde buscar ajuda (cap. 4 e 5 da cartilha). Sempre acessível, independente da fase (proposta 2.3).
- Faixa colorida por tema; as 10 fases são bolinhas em zigue-zague.
- Estados: concluída (check, cor do tema; tocável para revisar), atual (destaque pulsando + "Começar"), bloqueada (cinza + cadeado; toque mostra "Conclua a fase anterior").
- Após a fase 10: card "Trilha concluída" com os dois botões de recomeço.

**Lição** (`app/trilha/[fase].tsx`, tela cheia sem abas):
- Topo: ✕, barra de progresso das 5 casas, pontos ganhos na lição.
- Rodapé: botão "Verificar" (quiz/situação com escolha feita) ou "Continuar".
- Feedback do quiz: painel que sobe por baixo, verde ("Isso mesmo! +10") ou coral (correta + explicação), com `expo-haptics`.
- Cada casa é salva ao concluir. Ao sair pelo ✕ e voltar, retoma na primeira casa não concluída. Fase já completa: percorre todas as casas.
- Fim da fase: pontos ganhos e, em fase par, a conquista revelada → "Continuar" volta à trilha.

**Conquistas:** `BadgesGrid` lista as 5 conquistas reais (bloqueada/desbloqueada); `mockBadges` sai de uso.

## Dados

### Supabase (migration nova)

```
trilha_progresso
  id_progresso text primary key        -- "{id_user}:{partida}:{fase}:{casa}"
  id_user uuid not null default auth.uid() references usuario
  partida int not null check (partida >= 1)
  fase int not null check (fase between 1 and 10)
  casa int not null check (casa between 1 and 5)
  pontos int not null check (pontos in (0, 10))
  updated_at timestamptz not null default now()
  deleted_at timestamptz
```

- PK determinística: duas gravações da mesma casa (dois aparelhos offline) caem na mesma linha em vez de violar unicidade.
- Trigger `before update`: `new.pontos := greatest(old.pontos, new.pontos)` + o `tocar_updated_at` existente. Garante no servidor que pontos não diminuem mesmo com última-gravação-vence.
- Índice em `updated_at` (pull incremental) e em `id_user`.
- RLS: select/insert/update onde `id_user = auth.uid()`; sem delete; `revoke all from anon`.
- `usuario`: `trilha_partida int not null default 1 check (trilha_partida >= 1)`.

### SQLite (`lib/db.ts`)

- Esquema v2: se `user_version < 2`, cria `trilha_progresso` (mesmas colunas + `pendente`) e `ALTER TABLE usuario ADD COLUMN trilha_partida INTEGER NOT NULL DEFAULT 1`; `user_version = 2`. A criação v1 existente continua igual.
- `TABELAS`: adiciona `trilha_progresso` (pk `id_progresso`) e `trilha_partida` nas colunas de `usuario`. `ROTULOS` em `lib/sync.ts` ganha o rótulo da tabela.

### Estado derivado (`lib/trilha.ts`, puro)

A partir das linhas da partida atual + todas as partidas (para conquistas):
- `pontos` = soma de `pontos` + 20 × fases completas.
- `faseAtual` = primeira fase incompleta (11 = trilha concluída).
- `casaRetomada(fase)` = primeira casa ausente.
- `conquistas` = temas cuja fase par tem 5 casas em qualquer partida.
- `sortearPergunta(variacoes, ultimaVista)` e `embaralhar(alternativas)`.

### `lib/dados.ts`

- `lerTrilha()`: linhas do progresso da usuária + `trilha_partida`; devolve o estado derivado.
- `concluirCasa(fase, casa, pontos)`: grava/atualiza a linha com `max(pontos atual, novo)`, `pendente = 1`, chama `marcarAlterado()`.
- `novaPartida()`: incrementa `usuario.trilha_partida`, `pendente = 1`, `marcarAlterado()`.

## Conteúdo (`lib/trilhaConteudo.ts`)

Tipos: `Fase { numero, tema, titulo, conquista?, casas: [Explicacao, Quiz, Explicacao, Quiz, Situacao] }`; `Quiz { variacoes: { pergunta, alternativas: string[4], correta: number, explicacao }[4] }`; `Situacao { cenario, escolhas: { texto, retorno }[] }`. Cabeçalho do arquivo: "Rascunho — validar com a equipe responsável pela cartilha". Linguagem simples, nível básico/intermediário, sem diagnóstico ou avaliação da usuária.

## Testes

- `lib/trilha.test.mjs` (`npm test`): pontuação por casa, bônus de fase uma vez, desbloqueio sequencial, retomada no meio, revisão sem pontos extras, quiz errado pontuando depois, nova partida zerando pontos e mantendo conquistas, embaralhar preservando a correta, sorteio evitando a última vista.
- Mesmo arquivo, integridade do conteúdo: 10 fases, 5 casas na ordem fixa, cada quiz com 4 variações de 4 alternativas e `correta` válida, conquista só em fases pares.
- `supabase/tests/`: RLS (usuária não lê nem edita o progresso de outra) e trigger (update com pontos menores mantém o maior).

## Fora do escopo

StreakCard e Registro (seguem mock); ranking (proibido pela proposta); endereços e telefones locais na fase 10; análise de respostas.
