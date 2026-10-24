// Conteúdo da trilha gamificada (Atividades → Trilha).
// RASCUNHO — validar com a equipe responsável pela cartilha antes de publicar.
// Fonte: MORAIS, G. I. L.; ROLIM, A. C. A. Cuidando da saúde mental na gestação e puerpério. UFRN/EMCM, [s.d.].
// Cada explicação traz o conteúdo da cartilha (texto + cartões de tópicos) e o quiz seguinte só cobra o que acabou de ser mostrado.
// Única informação fora da cartilha: o número do SAMU (192), que ela cita sem o telefone.
// Em todas as perguntas a alternativa correta é a primeira (correta: 0); o app embaralha na exibição.
// Regras de pontuação e progressão: lib/trilha.ts.

export type Topico = { icone: string; titulo: string; texto: string }; // icone: MaterialCommunityIcons
export type Explicacao = { tipo: 'explicacao'; titulo: string; texto: string; topicos?: Topico[] };
export type Variacao = { pergunta: string; alternativas: string[]; correta: number; explicacao: string };
export type Quiz = { tipo: 'quiz'; variacoes: Variacao[] };
export type Situacao = { tipo: 'situacao'; cenario: string; escolhas: { texto: string; retorno: string }[] };
export type Casa = Explicacao | Quiz | Situacao;
export type Conquista = { titulo: string; descricao: string; icone: string }; // icone: MaterialCommunityIcons
export type Fase = { numero: number; tema: number; titulo: string; conquista?: Conquista; casas: Casa[] };

// cor: destaque do tema; sombra: tom escuro para o efeito 3D das bolinhas; icone: MaterialCommunityIcons
export const TEMAS = [
  { numero: 1, titulo: 'Quando nasce um bebê, também nasce uma mãe', cor: '#D97D54', sombra: '#B5603B', icone: 'mother-heart' },
  { numero: 2, titulo: 'Baby blues ou depressão pós-parto?', cor: '#EC4899', sombra: '#C0307A', icone: 'weather-partly-rainy' },
  { numero: 3, titulo: 'Autocuidado e rede de apoio', cor: '#4FA3A5', sombra: '#367F81', icone: 'hand-heart' },
  { numero: 4, titulo: 'Sinais de risco', cor: '#6366F1', sombra: '#4547C9', icone: 'heart-pulse' },
  { numero: 5, titulo: 'Onde posso encontrar ajuda?', cor: '#A37262', sombra: '#7F5546', icone: 'map-marker-path' },
];

const v = (pergunta: string, alternativas: string[], explicacao: string): Variacao => ({
  pergunta,
  alternativas,
  correta: 0,
  explicacao,
});

export const FASES: Fase[] = [
  // ---------------------------------------------------------------- Tema 1
  {
    numero: 1,
    tema: 1,
    titulo: 'Nasce uma mãe',
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'A mãe também precisa de cuidado',
        texto:
          'Quando a gravidez é anunciada, o foco costuma ir para o bebê, e quem gera e cuida dele acaba sendo esquecida. Mas a mãe também precisa de cuidado e amparo, porque essa fase desperta muita ansiedade.',
        topicos: [
          { icone: 'baby-face-outline', titulo: 'O foco vai para o bebê', texto: 'Perguntas, presentes e atenção quase sempre são para ele.' },
          { icone: 'heart-pulse', titulo: 'A ansiedade é esperada', texto: 'Gravidez e pós-parto despertam ansiedade, e isso merece amparo.' },
          { icone: 'human-pregnant', titulo: 'O corpo também pesa', texto: 'Estudos apontam que as mudanças no corpo contribuem para o sofrimento comum no pós-parto (puerpério).' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Quando a gravidez é anunciada, o que costuma acontecer com a atenção das pessoas?',
            ['Vai quase toda para o bebê, e a mãe pode ser esquecida', 'Divide-se igualmente entre mãe e bebê', 'Vai toda para a mãe', 'Some até o parto'],
            'O foco costuma ir para o bebê, e quem gera e cuida dele às vezes é esquecida. Por isso lembrar da mãe faz diferença.',
          ),
          v(
            'Por que a mãe precisa de cuidado e amparo durante a gravidez e o pós-parto?',
            ['Porque essa fase desperta ansiedade', 'Porque ela fica incapaz de decidir', 'Porque o bebê não depende dela', 'Porque o cuidado é só do pai'],
            'A gravidez e o pós-parto despertam ansiedade, e por isso a mãe também precisa de amparo, não só o bebê.',
          ),
          v(
            'Qual destes fatores contribui para o sofrimento comum no pós-parto (puerpério)?',
            ['As mudanças no corpo', 'Ter feito o pré-natal', 'Dormir demais', 'Ter recebido visitas'],
            'Estudos citados pela cartilha apontam as mudanças corporais como um dos fatores que contribuem para esse sofrimento.',
          ),
          v(
            'Uma amiga grávida diz: “Todo mundo só pergunta do bebê, ninguém pergunta de mim”. O que isso mostra?',
            ['Que o cuidado com a gestante costuma ser esquecido, e ele importa', 'Que ela está exagerando', 'Que gestantes não precisam de atenção', 'Que só depois do parto alguém precisa de cuidado'],
            'É justamente o que a cartilha alerta: o cuidado com a gestante não deve ser esquecido.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Quando nasce um bebê, nasce uma mãe',
        texto:
          'A frase quer dizer que, com o nascimento, duas pessoas estão em adaptação: a mãe, ao novo papel de maternar, e o bebê, que está conhecendo o mundo. É importante que a identidade dela seja preservada.',
        topicos: [
          { icone: 'account-multiple', titulo: 'Duas pessoas em adaptação', texto: 'A mãe se adapta ao papel de maternar; o bebê, ao mundo.' },
          { icone: 'earth', titulo: 'Cada uma do seu jeito', texto: 'Cada pessoa materna de forma única, conforme as construções sociais e culturais que viveu.' },
          { icone: 'gender-non-binary', titulo: '“Mãe” inclui todas', texto: 'A cartilha usa “mãe” e pronomes femininos para todas as pessoas que engravidam.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que significa “quando nasce um bebê, também nasce uma mãe”?',
            ['Que mãe e bebê estão se adaptando a uma nova fase', 'Que a mãe já nasce sabendo tudo', 'Que só o bebê muda', 'Que a mãe deixa de ser quem era'],
            'Duas pessoas estão em adaptação: a mãe, ao papel de maternar, e o bebê, ao mundo.',
          ),
          v(
            'Quem está incluído quando a cartilha fala em “mãe”?',
            ['Todas as pessoas que engravidam', 'Só quem já tem outros filhos', 'Só mulheres casadas', 'Só quem planejou a gravidez'],
            'A palavra “mãe” e os pronomes femininos incluem todas as pessoas que engravidam, não só um gênero.',
          ),
          v(
            'Sobre o jeito de maternar, o que é correto?',
            ['Cada pessoa vive de forma única, conforme sua história e cultura', 'Existe um único jeito certo', 'Toda mãe deve repetir o que a própria mãe fez', 'Quem sente dúvidas não está maternando bem'],
            'Cada pessoa passa por construções socioculturais na forma de maternar e de se adaptar a essa vivência única.',
          ),
          v(
            'Além de cuidar do bebê, o que também é importante para a mãe?',
            ['Ter a própria identidade preservada', 'Abrir mão de quem era', 'Esconder o que sente', 'Dar conta de tudo sozinha'],
            'A cartilha reforça que o cuidado com a gestante não seja esquecido e que sua identidade seja preservada.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Lara está grávida de 7 meses. Na visita da família, todos só perguntam sobre o bebê, e ela sente falta de alguém perguntar como ela está. O que Lara pode fazer?',
        escolhas: [
          {
            texto: 'Contar para alguém de confiança como está se sentindo',
            retorno: 'Boa ideia! A mãe também precisa de cuidado e amparo. Falar sobre o que sente ajuda as pessoas a perceberem isso.',
          },
          {
            texto: 'Guardar para si, achando que é bobagem',
            retorno: 'É comum pensar assim, mas o que Lara sente importa. O cuidado com a gestante não deve ser esquecido.',
          },
          {
            texto: 'Lembrar a si mesma que a identidade dela também importa',
            retorno: 'Isso mesmo! Preservar quem você é faz parte do cuidado: nasce um bebê e também nasce uma mãe.',
          },
        ],
      },
    ],
  },
  {
    numero: 2,
    tema: 1,
    titulo: 'Conectada a si mesma',
    conquista: { titulo: 'Cuidar de si', descricao: 'Concluiu o tema “Nasce uma mãe”', icone: 'sprout' },
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Continue fazendo o que te faz bem',
        texto:
          'É importante continuar com as atividades que já te faziam bem antes de você se descobrir mãe. Elas não precisam ser “mirabolantes”: podem ser momentos simples em que você se sinta conectada a si mesma.',
        topicos: [
          { icone: 'history', titulo: 'Retome o que já era seu', texto: 'O que te fazia bem antes da gravidez continua valendo.' },
          { icone: 'emoticon-happy-outline', titulo: 'Simples já basta', texto: 'Nada de grandes planos: o importante é você se sentir bem.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Quais atividades a cartilha recomenda manter durante a maternidade?',
            ['As que já te faziam bem antes de você descobrir-se mãe', 'Só as que envolvem o bebê', 'Apenas as caras e elaboradas', 'Nenhuma, até o bebê crescer'],
            'A orientação é continuar as atividades que, antes mesmo de descobrir-se mãe, faziam você se sentir bem.',
          ),
          v(
            'Como devem ser essas atividades de bem-estar?',
            ['Podem ser simples, desde que você se sinta conectada a si mesma', 'Precisam ser grandiosas', 'Devem ser feitas sempre em grupo', 'Têm de ser intensas'],
            'Não precisam ser “mirabolantes”: momentos simples, em que você se sinta conectada a si mesma, já ajudam.',
          ),
          v(
            'Qual é o objetivo de manter essas atividades?',
            ['Que você se sinta bem e conectada a si mesma', 'Ocupar todo o tempo livre', 'Mostrar aos outros que está tudo bem', 'Substituir o pré-natal'],
            'O importante, diz a cartilha, é que você se sinta bem.',
          ),
          v(
            'Marina acha que só vale “cuidar de si” se for algo grandioso, como uma viagem. O que dizer a ela?',
            ['Que momentos simples já contam', 'Que ela tem razão', 'Que cuidar de si é egoísmo', 'Que é melhor esperar o bebê crescer'],
            'Momentos simples contam! Cuidar de si não precisa ser algo grandioso.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Ideias para se cuidar',
        texto: 'A cartilha sugere algumas ideias e convida você a aumentar a lista do seu jeito. O importante é você se sentir bem!',
        topicos: [
          { icone: 'account-group', titulo: 'Encontrar amigos ou familiares', texto: 'Estar com pessoas de quem você gosta.' },
          { icone: 'food-apple', titulo: 'Comer algo de que goste', texto: 'Um pequeno prazer à mesa.' },
          { icone: 'meditation', titulo: 'Ter um momento a sós', texto: 'Um tempo só seu.' },
          { icone: 'walk', titulo: 'Caminhar ou se exercitar com segurança', texto: 'Exercício físico seguro para a sua condição.' },
          { icone: 'music', titulo: 'Ouvir músicas', texto: 'Sua playlist favorita.' },
          { icone: 'movie-open', titulo: 'Assistir a um filme', texto: 'Uma pausa para relaxar.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Qual destas é uma ideia de autocuidado sugerida pela cartilha?',
            ['Ter um momento a sós', 'Evitar encontrar amigos', 'Ficar sem dormir para adiantar tarefas', 'Deixar de comer o que gosta'],
            'Ter um momento a sós está na lista. Também: encontrar amigos ou familiares, comer algo de que goste, caminhar, ouvir música e assistir a um filme.',
          ),
          v(
            'Sobre exercício físico durante a gravidez e o pós-parto, o que a cartilha sugere?',
            ['Escolher um exercício seguro para a sua condição', 'Fazer o mais intenso possível', 'Evitar qualquer movimento', 'Treinar só com o bebê no colo'],
            'A sugestão é uma caminhada ou outro exercício físico seguro para a sua condição.',
          ),
          v(
            'Qual das opções é uma forma simples de cuidar de si, segundo a cartilha?',
            ['Ouvir músicas', 'Reorganizar a casa inteira', 'Comparar-se com outras mães', 'Adiar todo prazer'],
            'Ouvir músicas é uma das sugestões. A lista é aberta: você pode acrescentar o que te faz bem.',
          ),
          v(
            'A lista de ideias da cartilha é:',
            ['Aberta: você pode aumentar com o que gosta', 'Fechada: só vale o que está nela', 'Obrigatória, com todos os itens', 'Só para quem tem tempo livre'],
            'A cartilha convida: “Sinta-se à vontade para aumentar esta lista”.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Bia tem um bebê de 3 semanas. Antes, ela amava caminhar ao fim da tarde, mas deixou de fazer isso e agora se sente esgotada. O que pode ajudar?',
        escolhas: [
          {
            texto: 'Combinar com alguém da família uma caminhada curta, se estiver liberada para isso',
            retorno: 'Ótimo! Retomar algo simples que te fazia bem, em um exercício seguro para a sua condição, ajuda a se reconectar consigo.',
          },
          {
            texto: 'Esperar o bebê crescer para pensar nela mesma',
            retorno: 'Não precisa esperar: momentos simples agora já fazem diferença no seu bem-estar.',
          },
          {
            texto: 'Ouvir uma música de que gosta enquanto descansa um pouco',
            retorno: 'Perfeito! Ouvir músicas é uma das ideias da cartilha. Pequenos prazeres contam.',
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- Tema 2
  {
    numero: 3,
    tema: 2,
    titulo: 'O que é baby blues',
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Você já ouviu falar em baby blues?',
        texto:
          'Durante as transformações do corpo, como as alterações hormonais, é comum viver o chamado baby blues. Ele aparece nos primeiros dias depois do parto e dura mais ou menos de uma a duas semanas.',
        topicos: [
          { icone: 'calendar-clock', titulo: 'Quando aparece', texto: 'Nos primeiros dias após o parto, durando cerca de 1 a 2 semanas.' },
          { icone: 'account-group', titulo: 'É muito comum', texto: 'Atinge de 50% a 80% das mães.' },
          { icone: 'heart-outline', titulo: 'Não é rejeição ao bebê', texto: 'Mães com baby blues não rejeitam o bebê.' },
          { icone: 'hand-heart', titulo: 'O que ajuda', texto: 'O tratamento pode ser feito com apoio emocional.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Por quanto tempo o baby blues costuma durar?',
            ['Mais ou menos de uma a duas semanas', 'Poucas horas', 'Pelo menos um ano', 'Até o bebê completar 5 anos'],
            'O baby blues aparece nos primeiros dias após o parto e dura em torno de uma a duas semanas.',
          ),
          v(
            'Qual a frequência do baby blues entre as mães?',
            ['De 50% a 80% delas', 'Menos de 5%', 'Só mães de primeira viagem', 'Quase nenhuma'],
            'É muito comum: atinge de 50% a 80% das mães. Sentir isso não significa que algo está errado com você.',
          ),
          v(
            'Mães com baby blues costumam rejeitar o bebê?',
            ['Não, elas não têm rejeição ao bebê', 'Sim, sempre', 'Sim, nos primeiros dias', 'Só quando não planejaram a gravidez'],
            'Mesmo com os sintomas, as mães com baby blues não têm rejeição ao bebê.',
          ),
          v(
            'Como o baby blues pode ser tratado?',
            ['Com apoio emocional', 'Só com remédios fortes', 'Ignorando o que sente', 'Evitando contato com o bebê'],
            'O tratamento do baby blues pode ser feito com apoio emocional.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Como o baby blues aparece',
        texto:
          'Os sintomas podem incluir ansiedade, choro, apetite diminuído, exaustão, perda de interesse nas atividades de antes, mudanças de humor, tristeza, problemas no sono e preocupação. Há uma combinação de perdas e adaptações que a puérpera vive.',
        topicos: [
          { icone: 'human-pregnant', titulo: 'Mudanças no corpo', texto: 'O corpo se transforma depois do parto.' },
          { icone: 'cloud-question', titulo: 'Expectativa x realidade', texto: 'O encontro com uma realidade diferente da que se esperava quando o bebê chega.' },
          { icone: 'clock-alert-outline', titulo: 'Necessidades adiadas', texto: 'Suas próprias necessidades nem sempre podem ser atendidas, por causa das demandas do bebê.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Qual destes pode ser um sintoma de baby blues?',
            ['Choro e mudanças de humor', 'Febre alta', 'Aumento de peso do bebê', 'Dor de dente'],
            'Choro, tristeza, mudanças de humor, ansiedade, exaustão e problemas no sono estão entre os sintomas.',
          ),
          v(
            'Qual situação pode contribuir para o baby blues?',
            ['Encontrar uma realidade diferente da que se esperava', 'Receber muitas visitas de amigos', 'Ter feito o pré-natal', 'Dormir bem toda noite'],
            'Há uma combinação de perdas e adaptações, como o encontro com uma realidade diferente da expectativa.',
          ),
          v(
            'Por que as necessidades da própria mãe podem ficar de lado nos primeiros dias?',
            ['Porque as demandas do bebê tomam o tempo', 'Porque ela não tem necessidades', 'Porque o bebê dorme o dia todo', 'Porque isso é obrigação da mãe'],
            'As próprias necessidades podem não ser atendidas por causa das demandas do bebê, e isso contribui para o baby blues.',
          ),
          v(
            'Mudanças no corpo depois do parto, em relação ao baby blues, são:',
            ['Um fator importante que contribui para esse estado', 'Irrelevantes', 'Sinal de que a mãe fez algo errado', 'Um problema só de quem não se cuida'],
            'As mudanças corporais são um importante fator entre os que contribuem para esse estado.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Ana tem um bebê de 5 dias. Está chorando à toa, dorme mal e se sente insegura com os cuidados. Ela se pergunta se tem algo errado com ela. O que pode ajudar?',
        escolhas: [
          {
            texto: 'Entender que isso é comum no começo e contar com apoio emocional de quem está perto',
            retorno: 'Isso! Esses sintomas atingem de 50% a 80% das mães, e o apoio emocional é o caminho.',
          },
          {
            texto: 'Esconder o que sente para não preocupar ninguém',
            retorno: 'Guardar tudo pesa mais. O baby blues pode ser tratado com apoio emocional, então falar com alguém ajuda.',
          },
          {
            texto: 'Concluir que não vai conseguir cuidar do bebê',
            retorno: 'Não é isso. Mães com baby blues não rejeitam o bebê, e a fase costuma passar em uma a duas semanas.',
          },
        ],
      },
    ],
  },
  {
    numero: 4,
    tema: 2,
    titulo: 'Baby blues x depressão pós-parto',
    conquista: { titulo: 'Compreender as emoções', descricao: 'Concluiu o tema “Baby blues ou DPP?”', icone: 'heart-outline' },
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'E a depressão pós-parto?',
        texto:
          'Os sintomas da depressão pós-parto (DPP) são mais intensos e persistem por mais de duas semanas. Nesse caso, é preciso buscar ajuda profissional. Na grande maioria das vezes, eles surgem nas quatro primeiras semanas depois do parto.',
        topicos: [
          { icone: 'timer-sand', titulo: 'Mais de duas semanas', texto: 'Os sintomas persistem e são mais intensos que os do baby blues.' },
          { icone: 'calendar-week', titulo: 'Quando surge', texto: 'Quase sempre nas quatro primeiras semanas após o parto.' },
          { icone: 'stethoscope', titulo: 'O que fazer', texto: 'Buscar ajuda profissional.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que diferencia a depressão pós-parto do baby blues na duração?',
            ['Os sintomas da DPP persistem por mais de duas semanas', 'A DPP dura só um dia', 'Não há diferença', 'A DPP sempre passa sozinha em três dias'],
            'Na DPP os sintomas são mais intensos e persistem por mais de duas semanas.',
          ),
          v(
            'Quando a depressão pós-parto costuma se desenvolver?',
            ['Quase sempre nas quatro primeiras semanas após o parto', 'Só depois de um ano', 'Apenas durante a gravidez', 'Só em quem não amamenta'],
            'Em sua grande maioria, os sintomas da DPP se desenvolvem nas quatro primeiras semanas após o parto.',
          ),
          v(
            'Se os sintomas são intensos e passam de duas semanas, o que fazer?',
            ['Buscar ajuda profissional', 'Esperar passar sozinho', 'Evitar falar do assunto', 'Mudar a alimentação do bebê'],
            'Nesse caso é necessário buscar ajuda profissional.',
          ),
          v(
            'Qual destas características aponta mais para a DPP do que para o baby blues?',
            ['Sintomas mais intensos que persistem por mais de duas semanas', 'Choro nos primeiros dias que logo melhora', 'Cansaço depois de uma noite agitada', 'Alegria constante'],
            'A intensidade e a persistência (mais de duas semanas) são o que caracteriza a DPP.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Sinais para ficar atenta',
        texto:
          'Alguns sinais que podem indicar depressão pós-parto: dificuldade para criar sentimentos amorosos com o bebê, afastamento de amigos e familiares, mudanças fortes no apetite, falta de higiene da mãe e do bebê, e pensamentos de morte ou de se machucar. Se aparecerem, converse com um profissional de confiança.',
        topicos: [
          { icone: 'heart-broken-outline', titulo: 'Vínculo', texto: 'Dificuldade para desenvolver sentimentos amorosos com o bebê.' },
          { icone: 'account-off-outline', titulo: 'Isolamento', texto: 'Afastamento da rede de apoio: amigos e familiares.' },
          { icone: 'food-off-outline', titulo: 'Apetite', texto: 'Comer muito mais ou muito menos que o habitual.' },
          { icone: 'hand-wash-outline', titulo: 'Higiene', texto: 'Falta de cuidado com a higiene da mãe e do bebê.' },
          { icone: 'alert-circle-outline', titulo: 'Pensamentos graves', texto: 'Ideias de suicídio, de morte ou de prejudicar a si mesma ou ao bebê.' },
          { icone: 'doctor', titulo: 'Quem procurar', texto: 'Enfermeiro, agente de saúde ou médico de confiança, no pré-natal ou no pós-parto.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Qual destes é um sinal que pode indicar depressão pós-parto?',
            ['Afastamento de amigos e familiares', 'Vontade de passear com o bebê', 'Ter sono depois de uma noite agitada', 'Gostar de música'],
            'O afastamento da rede de apoio, formada por amigos e familiares, é um dos sinais.',
          ),
          v(
            'Pensamentos de morte ou de prejudicar a si mesma ou ao bebê são:',
            ['Um sinal sério que deve ser comunicado a um profissional', 'Algo comum que passa sozinho', 'Motivo de vergonha', 'Sinal de que a mãe é fraca'],
            'São sinais importantes. Converse o quanto antes com um profissional de confiança.',
          ),
          v(
            'Durante o pré-natal ou o pós-parto, a quem comunicar esses sintomas?',
            ['A um profissional de confiança, como enfermeiro, agente de saúde ou médico', 'Só a uma rede social', 'A ninguém, é melhor esperar', 'Apenas ao vizinho'],
            'É de extrema importância comunicar a um profissional de confiança, como o enfermeiro, o agente de saúde ou o médico, para que seja tratado.',
          ),
          v(
            'Qual alteração no dia a dia pode indicar DPP?',
            ['Falta de higiene da mãe e do bebê', 'Escolher o nome do bebê', 'Arrumar o quartinho', 'Fazer uma refeição leve'],
            'A falta de higiene da mãe e do bebê aparece entre os sinais, junto de mudanças no apetite e afastamento de pessoas queridas.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Júlia tem um bebê de 5 semanas. Há semanas sente muito cansaço, não consegue se aproximar do bebê como gostaria e deixou de responder às amigas. O que ela pode fazer?',
        escolhas: [
          {
            texto: 'Procurar o médico, o enfermeiro ou o agente de saúde e contar o que está sentindo',
            retorno: 'Exatamente! Sintomas intensos por mais de duas semanas pedem ajuda profissional, e falar com alguém de confiança é o primeiro passo.',
          },
          {
            texto: 'Esperar mais um tempo, achando que vai passar sozinho',
            retorno: 'Como já passaram semanas, é melhor não esperar. Quanto antes buscar ajuda, melhor.',
          },
          {
            texto: 'Se isolar ainda mais, para não incomodar',
            retorno: 'O afastamento é um dos sinais. Manter-se perto de quem você confia ajuda no cuidado.',
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- Tema 3
  {
    numero: 5,
    tema: 3,
    titulo: 'Seus direitos',
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Direito a acompanhante',
        texto:
          'Desde 2005, a lei nº 11.108 garante que os serviços do SUS (próprios ou conveniados) permitam a presença de 1 acompanhante durante todo o trabalho de parto, o parto e o pós-parto imediato. Isso traz mais apoio familiar e emocional, segurança e tranquilidade.',
        topicos: [
          { icone: 'scale-balance', titulo: 'Lei nº 11.108/2005', texto: 'Garante acompanhante à mulher em trabalho de parto, no SUS.' },
          { icone: 'account-heart', titulo: '1 acompanhante', texto: 'Durante o trabalho de parto, o parto e o pós-parto imediato.' },
          { icone: 'shield-check-outline', titulo: 'Por que importa', texto: 'Pessoas conhecidas por perto trazem segurança e tranquilidade num momento de expectativa.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que a lei nº 11.108, de 2005, garante?',
            ['A presença de 1 acompanhante no trabalho de parto, no parto e no pós-parto imediato', 'Que o parto seja sempre cesariana', 'Licença do trabalho por 2 anos', 'Um quarto particular no hospital'],
            'Ela obriga os serviços do SUS a permitir 1 acompanhante durante todo o trabalho de parto, parto e pós-parto imediato.',
          ),
          v(
            'Quantos acompanhantes a lei garante durante o parto?',
            ['1 acompanhante', '3 acompanhantes', 'Nenhum, só profissionais', 'A família inteira'],
            'A lei fala em 1 acompanhante durante todo o período.',
          ),
          v(
            'Por que a presença de um acompanhante é importante?',
            ['Traz apoio emocional, segurança e tranquilidade', 'Substitui a equipe de saúde', 'Evita o pré-natal', 'Serve só para registrar fotos'],
            'O momento do parto pede a presença de pessoas conhecidas, o que dá mais segurança e tranquilidade.',
          ),
          v(
            'Em quais serviços o direito ao acompanhante vale?',
            ['Nos serviços do SUS, próprios ou conveniados', 'Só em hospitais particulares', 'Somente em cidades grandes', 'Apenas se o hospital concordar'],
            'Os serviços do SUS, da rede própria ou conveniada, ficam obrigados a permitir a presença do acompanhante.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Saber onde o bebê vai nascer',
        texto:
          'Outra lei, a nº 11.634 (2007), garante à gestante conhecer e se vincular à maternidade onde receberá assistência pelo SUS. Na inscrição no pré-natal, ela deve ser informada em qual maternidade será o parto. Conhecer seus direitos também é uma forma de autocuidado.',
        topicos: [
          { icone: 'hospital-building', titulo: 'Lei nº 11.634/2007', texto: 'Direito de conhecer e se vincular à maternidade do parto.' },
          { icone: 'clipboard-check-outline', titulo: 'No pré-natal', texto: 'Ao se inscrever no programa de pré-natal, você deve saber onde será o parto.' },
          { icone: 'book-open-variant', titulo: 'Direitos são autocuidado', texto: 'Conhecê-los traz segurança e a certeza de ter suporte emocional.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que a lei nº 11.634, de 2007, assegura à gestante?',
            ['Saber em qual maternidade será o parto', 'Escolher o sexo do bebê', 'Receber auxílio em dinheiro', 'Dispensa do pré-natal'],
            'Ela garante o direito de conhecer e se vincular à maternidade onde receberá assistência pelo SUS.',
          ),
          v(
            'Quando a gestante deve ser informada sobre a maternidade do parto?',
            ['No ato de inscrição no pré-natal', 'Só no dia do parto', 'No oitavo mês', 'Depois do nascimento'],
            'No ato de inscrição no programa de assistência pré-natal ela deve ser informada em qual maternidade será realizado o parto.',
          ),
          v(
            'Por que conhecer seus direitos é considerado autocuidado?',
            ['Porque traz informação, segurança e a certeza de suporte no parto', 'Porque dispensa ajuda de profissionais', 'Porque evita qualquer sintoma', 'Porque só serve para advogados'],
            'Ter acesso às informações e a um acompanhante de livre escolha traz mais segurança e suporte emocional.',
          ),
          v(
            'O que as duas leis têm em comum?',
            ['Dão acesso à informação e a mais segurança no parto', 'Falam só de dinheiro', 'Vale apenas para quem paga plano de saúde', 'Substituem o pré-natal'],
            'As duas leis fazem parte de um movimento por acesso às informações e à presença de um acompanhante de livre escolha.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Camila está no 7º mês. Ela está insegura porque não sabe em qual maternidade vai ganhar o bebê, e acha que vai passar o parto sozinha. O que ela pode lembrar e fazer?',
        escolhas: [
          {
            texto: 'Perguntar na unidade do pré-natal qual será a maternidade e lembrar do direito a 1 acompanhante',
            retorno: 'Isso mesmo! Conhecer seus direitos é uma forma de autocuidado e traz segurança para o parto.',
          },
          {
            texto: 'Esperar o dia do parto para descobrir',
            retorno: 'Você tem o direito de saber desde a inscrição no pré-natal. Perguntar antes dá mais tranquilidade.',
          },
          {
            texto: 'Pedir que o hospital escolha qualquer pessoa para acompanhá-la',
            retorno: 'O acompanhante é de livre escolha: alguém conhecido, que traga segurança e apoio emocional.',
          },
        ],
      },
    ],
  },
  {
    numero: 6,
    tema: 3,
    titulo: 'Rede de apoio',
    conquista: { titulo: 'Fortalecer a rede de apoio', descricao: 'Concluiu o tema “Autocuidado e rede de apoio”', icone: 'account-group-outline' },
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'O que é rede de apoio?',
        texto:
          'Nenhuma intervenção sozinha controla o baby blues ou a depressão pós-parto, mas a rede de apoio é considerada um dos fatores mais importantes para preveni-los. Ela é formada por pessoas em quem você confia, que dão suporte e acolhimento e com quem você pode contar.',
        topicos: [
          { icone: 'account-heart-outline', titulo: 'Quem faz parte', texto: 'Pessoas de confiança, que acolhem e dão suporte.' },
          { icone: 'shield-check-outline', titulo: 'Fator de proteção', texto: 'Ajuda a prevenir o baby blues e a depressão pós-parto.' },
          { icone: 'hand-heart-outline', titulo: 'Apoio físico e afetivo', texto: 'Além de ajudar nas tarefas, encoraja e faz você se sentir validada na função materna.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que é a rede de apoio?',
            ['Pessoas de confiança que dão suporte e acolhimento', 'Um aplicativo de pagamentos', 'Só os profissionais de saúde', 'Apenas quem mora na mesma casa'],
            'A rede de apoio é construída por pessoas em quem você confia, que dão suporte e geram acolhimento.',
          ),
          v(
            'Qual o papel da rede de apoio em relação ao baby blues e à DPP?',
            ['É um dos fatores mais importantes para a prevenção', 'Não faz diferença', 'Cura sozinha qualquer caso', 'Só atrapalha'],
            'Nenhuma intervenção sozinha controla esses quadros, mas a rede de apoio é considerada um dos fatores de maior importância para a prevenção.',
          ),
          v(
            'Além do apoio físico, o que a rede de apoio oferece?',
            ['Apoio afetivo e encorajamento, para você se sentir validada', 'Nada além de tarefas', 'Críticas para melhorar', 'Comparação com outras mães'],
            'O apoio não é só físico, mas afetivo: dá encorajamento para que a mãe se sinta validada em sua função materna.',
          ),
          v(
            'A rede de apoio funciona como:',
            ['Um fator de proteção à maternidade', 'Um luxo dispensável', 'Um risco para a mãe', 'Algo que só vale depois de 1 ano'],
            'A presença de uma rede de apoio é um dos fatores de proteção à maternidade.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Dicas para se apoiar',
        texto: 'A cartilha deixa três orientações para quem está nessa fase. Guarde-as com carinho.',
        topicos: [
          { icone: 'hand-wave-outline', titulo: 'Peça ajuda', texto: 'Não precisa dar conta de tudo, principalmente no pós-parto. Divida as tarefas com companheiro(a), acompanhante ou alguém disposto.' },
          { icone: 'flower-outline', titulo: 'Não espere ser perfeita', texto: 'Ninguém é. Você não está só, e não existe culpa em ter baby blues: qualquer pessoa no puerpério pode passar por isso.' },
          { icone: 'link-variant', titulo: 'Firme-se na sua rede', texto: 'Não se envergonhe de buscá-la sempre que sentir necessidade.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'No pós-parto, quem tem a chance de pedir ajuda deve:',
            ['Pedir e dividir as tarefas da rotina', 'Dar conta de tudo sozinha', 'Esconder que está cansada', 'Esperar que adivinhem'],
            'Não há necessidade de dar conta de tudo. Peça ajuda e divida as atividades da rotina.',
          ),
          v(
            'Sobre ter baby blues, o que é verdade?',
            ['Não há culpa, qualquer pessoa no puerpério pode passar por isso', 'É sinal de fracasso', 'Só acontece com quem não ama o bebê', 'É preciso esconder'],
            'Não existe culpa em ter baby blues, e qualquer pessoa que passe pelo puerpério pode manifestá-lo.',
          ),
          v(
            'Quando buscar a rede de apoio?',
            ['Sempre que sentir necessidade, sem vergonha', 'Só em emergências graves', 'Nunca, para não incomodar', 'Só depois de seis meses'],
            'Não se envergonhe em buscar a rede de apoio sempre que sentir necessidade.',
          ),
          v(
            'Qual atitude combina com “não espere ser perfeita”?',
            ['Aceitar que ninguém é perfeita e que você não está só', 'Exigir de si mesma o máximo o tempo todo', 'Comparar-se com outras mães', 'Evitar errar a qualquer custo'],
            'Ninguém é perfeito, e você não está só.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Rafaela está com o bebê há 10 dias. Faz tudo sozinha e está exausta, mas tem vergonha de pedir ajuda para o companheiro e para a mãe. O que pode ajudar?',
        escolhas: [
          {
            texto: 'Pedir ajuda e combinar com eles quem faz o quê na rotina',
            retorno: 'Ótimo! Não é preciso dar conta de tudo. Dividir as tarefas protege a sua saúde mental.',
          },
          {
            texto: 'Continuar sozinha, para não parecer fraca',
            retorno: 'Pedir ajuda não é fraqueza. A rede de apoio existe para isso e funciona como proteção.',
          },
          {
            texto: 'Procurar apenas pessoas que a julguem',
            retorno: 'A rede de apoio é feita de pessoas de confiança, que acolhem e encorajam.',
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- Tema 4
  {
    numero: 7,
    tema: 4,
    titulo: 'Montanha-russa emocional',
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Cada gravidez é única',
        texto:
          'Cada gravidez é única, e cada pessoa reage de um jeito às mudanças que o corpo vive. Alguns fatores influenciam a intensidade do baby blues: os fatores psicológicos, a baixa autoestima materna e o alto nível de estresse com os cuidados do bebê.',
        topicos: [
          { icone: 'fingerprint', titulo: 'Cada uma reage de um jeito', texto: 'Não existe comparação justa entre gestações e puerpérios.' },
          { icone: 'brain', titulo: 'Fatores psicológicos', texto: 'Influenciam a intensidade do baby blues.' },
          { icone: 'emoticon-sad-outline', titulo: 'Baixa autoestima materna', texto: 'Quando a mãe se sente pouco capaz, o sofrimento pode ser maior.' },
          { icone: 'lightning-bolt-outline', titulo: 'Estresse com o bebê', texto: 'Níveis altos de estresse nos cuidados também pesam.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Sobre as reações à gravidez e ao pós-parto, o que é correto?',
            ['Cada gravidez é única e cada pessoa reage de forma particular', 'Todas reagem igual', 'Só quem tem problemas antes reage', 'Reação nenhuma é esperada'],
            'Cada gravidez é única, e cada mulher reage de forma particular às mudanças do corpo.',
          ),
          v(
            'Qual destes fatores influencia a intensidade do baby blues?',
            ['Baixa autoestima materna', 'A cor do enxoval', 'O horário do parto', 'O nome escolhido'],
            'Fatores psicológicos, baixa autoestima materna e altos níveis de estresse com os cuidados do bebê foram identificados como significativos.',
          ),
          v(
            'O estresse alto com os cuidados do bebê pode:',
            ['Aumentar a intensidade do baby blues', 'Evitar o baby blues', 'Não ter relação alguma', 'Curar os sintomas'],
            'Altos níveis de estresse em relação aos cuidados com o bebê foram identificados como fator significativo na intensidade do baby blues.',
          ),
          v(
            'Por que não faz sentido comparar o seu pós-parto com o de outra pessoa?',
            ['Porque cada pessoa vive essa fase de forma particular', 'Porque todos são iguais', 'Porque só o seu importa para os outros', 'Porque ninguém passa por isso'],
            'Cada experiência é única, então comparações podem prejudicar a autoestima.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Montanha-russa emocional',
        texto:
          'O baby blues parece surgir de uma reação emocional crescente a sentimentos intensos, que leva a uma labilidade afetiva: a mudança rápida de humor. Muitas mulheres descrevem como uma “montanha-russa emocional”.',
        topicos: [
          { icone: 'roller-skate', titulo: 'Humor que muda rápido', texto: 'Labilidade afetiva é a mudança de humor de um momento para o outro.' },
          { icone: 'emoticon-excited-outline', titulo: 'Altos e baixos', texto: 'Dias de alegria e de tristeza se alternam; é assim que muitas mulheres sentem.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que significa “montanha-russa emocional”?',
            ['Mudanças rápidas de humor, com altos e baixos', 'Medo de brinquedos de parque', 'Alegria constante', 'Ausência de emoções'],
            'É a forma como algumas mulheres descrevem a labilidade afetiva, isto é, as mudanças de humor do baby blues.',
          ),
          v(
            'O que é labilidade afetiva?',
            ['Mudança de humor', 'Aumento do apetite', 'Dificuldade de ler', 'Dor no corpo'],
            'Labilidade afetiva é a mudança de humor, característica do baby blues.',
          ),
          v(
            'Sentir-se alegre num momento e triste no outro, logo após o parto, é:',
            ['Algo que algumas mulheres descrevem como montanha-russa emocional', 'Sinal de que não ama o bebê', 'Prova de que é preciso esconder o que sente', 'Impossível'],
            'Esse sobe e desce emocional é descrito por algumas mulheres como uma “montanha-russa emocional”.',
          ),
          v(
            'O baby blues parece surgir de:',
            ['Uma reação emocional crescente a sentimentos intensos', 'Falta de vontade da mãe', 'Culpa dos familiares', 'Falta de estudo'],
            'Parece ocorrer devido a uma crescente reação emocional a sentimentos agudos.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Dani, com o bebê de 8 dias, passa da risada ao choro em minutos e se sente culpada: “Estou ficando maluca?”. O que ajuda a entender?',
        escolhas: [
          {
            texto: 'Perceber que mudanças rápidas de humor fazem parte do baby blues e contar com apoio',
            retorno: 'Isso! Muitas mulheres descrevem como uma montanha-russa emocional. Você não está sozinha.',
          },
          {
            texto: 'Achar que está falhando como mãe',
            retorno: 'Não é falha. Cada pessoa reage de forma particular às mudanças dessa fase.',
          },
          {
            texto: 'Forçar-se a parecer sempre feliz',
            retorno: 'Fingir só pesa mais. Acolher o que sente e falar com alguém de confiança ajuda.',
          },
        ],
      },
    ],
  },
  {
    numero: 8,
    tema: 4,
    titulo: 'Quando buscar ajuda',
    conquista: { titulo: 'Reconhecer os sinais', descricao: 'Concluiu o tema “Sinais de risco”', icone: 'magnify' },
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Hábitos que ajudam',
        texto:
          'Alguns cuidados no dia a dia, na gravidez e no pós-parto, são importantes para o bem-estar e podem ajudar os sintomas a desaparecerem.',
        topicos: [
          { icone: 'food-apple-outline', titulo: 'Alimentação saudável', texto: 'Comer bem faz parte do cuidado.' },
          { icone: 'sleep', titulo: 'Sono regular', texto: 'Padrões regulares de sono ajudam o bem-estar.' },
          { icone: 'head-heart-outline', titulo: 'Acompanhamento psicológico', texto: 'Conversar com um profissional ajuda.' },
          { icone: 'run', titulo: 'Atividade física', texto: 'Movimento seguro para a sua condição.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Qual destes hábitos contribui para o bem-estar na gravidez e no pós-parto?',
            ['Sono regular', 'Pular refeições', 'Ficar sempre isolada', 'Evitar qualquer atividade'],
            'Alimentação saudável, sono regular, acompanhamento psicológico e atividade física são importantes para o bem-estar.',
          ),
          v(
            'Quais cuidados podem ajudar os sintomas a desaparecerem?',
            ['Alimentação saudável, sono regular, acompanhamento psicológico e atividade física', 'Só ficar em silêncio', 'Evitar o pré-natal', 'Deixar de sair de casa'],
            'Esses quatro cuidados contribuem para o bem-estar e para que os sintomas desapareçam.',
          ),
          v(
            'O acompanhamento psicológico durante a gravidez e o pós-parto:',
            ['É um dos cuidados importantes para o bem-estar', 'É dispensável para todos', 'Substitui a rede de apoio', 'Só vale depois de um ano'],
            'O acompanhamento psicológico está entre os cuidados importantes para o seu bem-estar.',
          ),
          v(
            'Qual combinação de hábitos é recomendada?',
            ['Boa alimentação e sono regular', 'Comer pouco e dormir menos', 'Só trabalhar', 'Só ficar na cama'],
            'Alimentação saudável e padrões regulares de sono são recomendados.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Quando procurar o médico',
        texto:
          'Se os sintomas estiverem mais parecidos com os da depressão pós-parto, procure o médico da Unidade de Saúde do seu bairro para ser orientada sobre o tratamento e os encaminhamentos. Atividades prazerosas, psicoterapia e outras terapias ajudam, e, se necessário, o remédio deve ser adequado à amamentação.',
        topicos: [
          { icone: 'hospital-box-outline', titulo: 'Unidade de Saúde do bairro', texto: 'Procure o médico para orientação e possíveis encaminhamentos.' },
          { icone: 'palette-outline', titulo: 'Atividades que dão prazer', texto: 'Ajudam na melhora do quadro.' },
          { icone: 'forum-outline', titulo: 'Psicoterapia e terapias', texto: 'Eficazes para melhorar a depressão pós-parto.' },
          { icone: 'pill', titulo: 'Remédio, quando necessário', texto: 'Deve ser o ideal para o momento da amamentação, para não chegar ao bebê.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Se os sintomas parecerem com os da depressão pós-parto, quem procurar?',
            ['O médico da Unidade de Saúde do bairro', 'Apenas as redes sociais', 'Ninguém', 'Só a farmácia'],
            'Busque o médico da Unidade de Saúde do bairro para orientação sobre o tratamento e possíveis encaminhamentos.',
          ),
          v(
            'O que ajuda na melhora do quadro de depressão pós-parto?',
            ['Atividades prazerosas, psicoterapia e outras terapias', 'Isolamento total', 'Parar de comer', 'Ignorar os sintomas'],
            'Atividades que dão prazer, psicoterapia e terapias são eficazes para a melhora.',
          ),
          v(
            'Se for necessário usar medicamento durante a amamentação, ele deve:',
            ['Ser o ideal para esse momento, para não chegar ao bebê', 'Ser o mais forte possível', 'Ser escolhido sem orientação', 'Ser tomado em dobro'],
            'É importante que o medicamento seja adequado ao momento da amamentação, para não chegar ao bebê, e indicado por um profissional.',
          ),
          v(
            'O que o médico da Unidade de Saúde pode fazer por você?',
            ['Orientar o tratamento e fazer encaminhamentos', 'Só pesar o bebê', 'Nada além de vacinas', 'Garantir o parto particular'],
            'Ele orienta quanto ao tratamento e aos possíveis encaminhamentos.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Lúcia tem um bebê de 6 semanas. Há tempos se sente sem energia, culpada por tudo e sem vontade de comer. Ela pensa em desistir de procurar ajuda por vergonha. O que fazer?',
        escolhas: [
          {
            texto: 'Ir à Unidade de Saúde do bairro e contar ao médico o que sente',
            retorno: 'Ótima decisão! Os sintomas lembram a DPP e o médico pode orientar o tratamento e os encaminhamentos.',
          },
          {
            texto: 'Esperar sentir-se pior antes de buscar ajuda',
            retorno: 'Não precisa esperar. Quanto antes buscar ajuda, melhor.',
          },
          {
            texto: 'Desistir por vergonha',
            retorno: 'Buscar ajuda é um cuidado consigo, não motivo de vergonha. Lúcia merece esse cuidado.',
          },
        ],
      },
    ],
  },
  // ---------------------------------------------------------------- Tema 5
  {
    numero: 9,
    tema: 5,
    titulo: 'Por onde começar',
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Comece pelo postinho',
        texto:
          'O primeiro passo é ir ao postinho de saúde do seu bairro. Lá você busca orientações e encaminhamentos para os serviços de saúde mental da sua cidade.',
        topicos: [
          { icone: 'home-heart', titulo: 'Postinho do bairro', texto: 'A porta de entrada para buscar orientação.' },
          { icone: 'sign-direction', titulo: 'Encaminhamentos', texto: 'O profissional indica os serviços de saúde mental do seu município.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Por onde começar a buscar ajuda em saúde mental?',
            ['Pelo postinho de saúde do seu bairro', 'Apenas por redes sociais', 'Só por hospitais fora da cidade', 'Esperando alguém perceber'],
            'Vá ao postinho do bairro e busque orientações e encaminhamentos para os serviços de saúde mental da cidade.',
          ),
          v(
            'O que você consegue no postinho do bairro?',
            ['Orientações e encaminhamentos para serviços de saúde mental', 'Apenas receber vacinas', 'Somente exames de sangue', 'Nada em saúde mental'],
            'O postinho dá orientações e encaminha para os serviços de saúde mental do município.',
          ),
          v(
            'Quem pode indicar o serviço de saúde mental da sua cidade?',
            ['O profissional de saúde do postinho', 'Um desconhecido na internet', 'O vendedor da farmácia', 'Ninguém'],
            'O profissional de saúde, no posto, pode encaminhar para o serviço de saúde mental do seu município.',
          ),
          v(
            'Sentindo que algo não está bem, o que é um bom primeiro passo?',
            ['Ir ao postinho do bairro e pedir orientação', 'Esperar que passe sem contar a ninguém', 'Parar de sair de casa', 'Evitar o pré-natal'],
            'Pedir orientação no postinho é o caminho indicado para chegar aos serviços de saúde mental.',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Conte a um profissional de confiança',
        texto:
          'Durante o pré-natal ou o pós-parto, se aparecer algum sintoma do que você viu até aqui, é muito importante comunicar a um profissional de confiança: o enfermeiro, o agente de saúde ou o médico. Assim você pode ser cuidada.',
        topicos: [
          { icone: 'medical-bag', titulo: 'Enfermeiro(a)', texto: 'Pode ouvir e orientar você.' },
          { icone: 'home-account', titulo: 'Agente de saúde', texto: 'Conhece a sua região e pode ajudar nos próximos passos.' },
          { icone: 'doctor', titulo: 'Médico(a)', texto: 'Avalia e orienta o tratamento.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Se aparecer algum sintoma no pré-natal ou no pós-parto, o que fazer?',
            ['Comunicar a um profissional de confiança', 'Esperar passar sem contar a ninguém', 'Contar só depois do parto', 'Esconder para não preocupar'],
            'É de extrema importância comunicar a um profissional de confiança para que seja tratado.',
          ),
          v(
            'Qual destes pode ser um profissional de confiança para conversar?',
            ['Enfermeiro, agente de saúde ou médico', 'Apenas o cartório', 'Somente um vendedor', 'Ninguém serve'],
            'O enfermeiro, o agente de saúde ou o médico podem ouvir você e orientar.',
          ),
          v(
            'Por que comunicar os sintomas a um profissional?',
            ['Para que você possa ser cuidada e tratada', 'Para ser julgada', 'Para ficar sem o bebê', 'Para fazer o pré-natal ser dispensado'],
            'Comunicando, você abre caminho para o cuidado e o tratamento.',
          ),
          v(
            'Quando vale comunicar um sintoma ao profissional?',
            ['No pré-natal ou no pós-parto, assim que perceber', 'Só depois de um ano', 'Nunca', 'Apenas se alguém mandar'],
            'Durante o pré-natal ou o puerpério, caso exista algum sintoma, comunique a um profissional de confiança.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Paula está grávida de 8 meses, anda muito ansiosa e dorme mal. Ela tem consulta de pré-natal amanhã e não sabe se deve comentar isso. O que fazer?',
        escolhas: [
          {
            texto: 'Contar ao profissional do pré-natal como tem se sentido',
            retorno: 'Ótimo! O pré-natal também é lugar de cuidar da saúde mental, e o profissional pode orientar e encaminhar.',
          },
          {
            texto: 'Guardar para si, achando que não é “assunto de pré-natal”',
            retorno: 'É um assunto sim! Se há sintomas, comunicar a um profissional de confiança é muito importante.',
          },
          {
            texto: 'Esperar o bebê nascer para ver se passa',
            retorno: 'Não precisa esperar. Falar já no pré-natal ajuda a ser cuidada mais cedo.',
          },
        ],
      },
    ],
  },
  {
    numero: 10,
    tema: 5,
    titulo: 'Urgência e CAPS',
    conquista: { titulo: 'Saber onde buscar ajuda', descricao: 'Concluiu o tema “Onde posso encontrar ajuda?”', icone: 'compass-outline' },
    casas: [
      {
        tipo: 'explicacao',
        titulo: 'Em caso de urgência',
        texto: 'Se for uma situação de urgência, não espere: procure um hospital ou ligue para o SAMU.',
        topicos: [
          { icone: 'hospital-building', titulo: 'Hospital', texto: 'Vá ao hospital em casos de urgência.' },
          { icone: 'ambulance', titulo: 'SAMU: 192', texto: 'Se não puder se deslocar, ligue para o SAMU.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'Em um caso de urgência em saúde mental, o que fazer?',
            ['Buscar um hospital ou ligar para o SAMU', 'Esperar até o dia seguinte', 'Aguardar o próximo pré-natal', 'Pedir conselho apenas em redes sociais'],
            'Em casos de urgência, busque o hospital ou ligue para o SAMU (192).',
          ),
          v(
            'Qual é o número do SAMU?',
            ['192', '190', '181', '100'],
            'O SAMU atende pelo 192.',
          ),
          v(
            'Quando procurar um hospital ou ligar para o SAMU?',
            ['Em situações de urgência', 'Só para marcar consulta de rotina', 'Nunca, o postinho resolve tudo', 'Apenas depois de um mês'],
            'Hospital e SAMU são para as urgências. Para orientação no dia a dia, o primeiro passo é o postinho.',
          ),
          v(
            'Se uma urgência acontece e você não consegue sair de casa, uma opção é:',
            ['Ligar para o SAMU', 'Esperar passar', 'Aguardar o próximo mês', 'Contar só depois'],
            'Você pode ligar para o SAMU (192).',
          ),
        ],
      },
      {
        tipo: 'explicacao',
        titulo: 'Conheça o CAPS',
        texto:
          'No posto de saúde, ou depois de uma consulta de urgência, o profissional poderá te encaminhar para o serviço de saúde mental do seu município, que geralmente é o Centro de Atenção Psicossocial (CAPS).',
        topicos: [
          { icone: 'sign-direction', titulo: 'Como chegar', texto: 'Por encaminhamento do posto de saúde ou após uma consulta de urgência.' },
          { icone: 'hand-heart', titulo: 'CAPS', texto: 'Centro de Atenção Psicossocial: geralmente o serviço de saúde mental do município.' },
        ],
      },
      {
        tipo: 'quiz',
        variacoes: [
          v(
            'O que é, geralmente, o serviço de saúde mental do município?',
            ['O Centro de Atenção Psicossocial (CAPS)', 'A farmácia do bairro', 'A escola do bairro', 'O cartório'],
            'O serviço de saúde mental existente no município geralmente é o CAPS.',
          ),
          v(
            'Como chegar ao CAPS?',
            ['Por encaminhamento do posto de saúde ou depois de uma consulta de urgência', 'Só pagando consulta particular', 'Sem nenhum contato com a saúde', 'Apenas por indicação de vizinhos'],
            'No posto de saúde ou após consulta de urgência, o profissional poderá encaminhar você ao serviço de saúde mental.',
          ),
          v(
            'Qual a sigla do Centro de Atenção Psicossocial?',
            ['CAPS', 'UPA', 'CRAS', 'SUS'],
            'CAPS é o Centro de Atenção Psicossocial.',
          ),
          v(
            'Quem pode te encaminhar para o serviço de saúde mental do município?',
            ['O profissional de saúde, no posto ou depois de uma consulta de urgência', 'O vendedor da farmácia', 'Qualquer pessoa na rua', 'Ninguém'],
            'Esse encaminhamento é feito por profissionais de saúde, no posto ou após uma consulta de urgência.',
          ),
        ],
      },
      {
        tipo: 'situacao',
        cenario:
          'Teresa foi ao hospital numa urgência por muita angústia e foi atendida. O profissional diz que ela pode seguir o cuidado em outro serviço da cidade. O que isso pode significar?',
        escolhas: [
          {
            texto: 'Ser encaminhada para o serviço de saúde mental do município, em geral o CAPS',
            retorno: 'Isso! Após a consulta de urgência, o profissional pode encaminhá-la ao CAPS para acompanhamento.',
          },
          {
            texto: 'Que ela não precisa de mais nenhum cuidado',
            retorno: 'O encaminhamento é para continuar cuidando. O CAPS é o serviço de saúde mental do município.',
          },
          {
            texto: 'Que ela deve esperar sozinha em casa',
            retorno: 'Ela não precisa enfrentar sozinha: o encaminhamento ajuda a dar continuidade ao cuidado.',
          },
        ],
      },
    ],
  },
];

// "Precisa de ajuda?" — sempre acessível na trilha, independente da fase (proposta, seção 2.3)
export const AJUDA = {
  sinais: [
    'Tristeza, choro ou cansaço intensos que duram mais de duas semanas',
    'Dificuldade de sentir amor pelo bebê',
    'Afastamento de amigos e familiares',
    'Alterações fortes no apetite',
    'Culpa excessiva ou sentimento de inadequação',
    'Pensamentos de morte ou de prejudicar a si mesma ou ao bebê',
  ],
  onde: [
    { icone: 'home-heart', titulo: 'Postinho do seu bairro', texto: 'Orientações e encaminhamentos para os serviços de saúde mental da cidade.' },
    { icone: 'ambulance', titulo: 'Urgência', texto: 'Procure o hospital ou ligue para o SAMU (192).' },
    { icone: 'hand-heart', titulo: 'CAPS', texto: 'Centro de Atenção Psicossocial: o serviço de saúde mental do município, por encaminhamento.' },
  ],
  aviso: 'Conteúdo informativo da cartilha “Cuidando da saúde mental na gestação e puerpério”. Não substitui a avaliação de um profissional.',
};

// Boas-vindas: abre na primeira visita à trilha (marcada no AsyncStorage, por aparelho) e pelo botão "Como funciona"
// ponytail: a marca é do aparelho, não da conta; outra conta no mesmo celular não revê. Incluir o id_user na chave se importar.
export const CHAVE_BOAS_VINDAS = 'gravidinha_trilha_boas_vindas';
export const BOAS_VINDAS = [
  {
    icone: 'mother-heart',
    cor: '#D97D54',
    titulo: 'Bem-vinda à sua trilha!',
    texto:
      'Aqui você aprende, no seu ritmo, sobre a saúde mental na gestação e no pós-parto. Todo o conteúdo vem da cartilha “Cuidando da saúde mental na gestação e puerpério” (UFRN).',
    itens: ['5 temas da cartilha', '10 fases curtas, de uns 3 minutos cada', 'Uma fase libera a próxima'],
  },
  {
    icone: 'map-marker-path',
    cor: '#4FA3A5',
    titulo: 'Como é uma fase',
    texto: 'Cada fase tem 5 passos rápidos, sempre nesta ordem:',
    itens: [
      'Você sabia? Uma explicação curtinha',
      'Quiz: uma pergunta sobre o que você leu',
      'Situação: uma história para você escolher o que faria',
    ],
  },
  {
    icone: 'star-four-points',
    cor: '#F5B301',
    titulo: 'Pontos e conquistas',
    texto: 'Errar faz parte: você vê a resposta certa com uma explicação e segue em frente, sem perder nada.',
    itens: [
      '+10 por acerto no quiz e +10 por situação',
      '+20 ao concluir uma fase',
      'Uma conquista a cada tema concluído',
      'Refaça fases para buscar os pontos que faltaram',
      'Sem ranking: a trilha é só sua',
    ],
  },
  {
    icone: 'lifebuoy',
    cor: '#6366F1',
    titulo: 'Seu cuidado vem primeiro',
    texto:
      'A trilha informa, não avalia você nem substitui um profissional. Se algo não estiver bem, o botão “Precisa de ajuda?” fica sempre no topo da trilha, em qualquer fase.',
    itens: ['Postinho do seu bairro: orientação e encaminhamento', 'Urgência: hospital ou SAMU (192)'],
  },
];
