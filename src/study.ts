export const genres = ['Narrativa', 'Poesia', 'Sabedoria', 'Profecia', 'Evangelho', 'Carta', 'Apocalíptico'] as const;
export type Genre = typeof genres[number];
export type Study = {
  id: string; passage: string; genre: Genre; literary: string; historical: string; observation: string;
  questions: string; references: string; hypothesis: string; comparison: string; application: string;
};
export type Example = { study: Study; prompt: string; guide: string };

export const fields = [
  ['literary', 'Contexto literário', 'O que vem antes e depois? Quem fala com quem?'],
  ['historical', 'Contexto histórico', 'Quais dados de época, público ou lugar ajudam? Anote a fonte e o grau de certeza.'],
  ['observation', 'Observação textual', 'Registre repetições, imagens, contrastes e ações que você encontra na passagem.'],
  ['questions', 'Perguntas de interpretação', 'Quais detalhes exigem explicação? Que evidências poderiam responder?'],
  ['references', 'Referências para comparar', 'Liste passagens e indique se a relação é uma citação, um paralelo ou um tema.'],
  ['comparison', 'Resultado da comparação', 'O que as referências esclarecem? Onde o contexto delas é diferente?'],
  ['hypothesis', 'Hipótese interpretativa', 'Proponha um sentido e indique a evidência e os pontos ainda abertos.'],
  ['application', 'Aplicação', 'Que resposta concreta decorre da interpretação?'],
] as const;

export function findStudies(studies: Study[], query: string): Study[] {
  const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return studies.filter(study => {
    const text = normalize([study.passage, study.genre, ...fields.map(([key]) => study[key])].join(' '));
    return words.every(word => text.includes(word));
  }).reverse();
}

export function blankStudy(): Study {
  return { id: '', passage: '', genre: 'Narrativa', literary: '', historical: '', observation: '',
    questions: '', references: '', hypothesis: '', comparison: '', application: '' };
}

export function validate(study: Study) {
  if (!study.passage.trim() || study.passage.length > 120) return 'Informe uma passagem com até 120 caracteres.';
  if (!genres.includes(study.genre)) return 'Escolha um gênero da lista.';
  if (!study.observation.trim()) return 'Registre pelo menos uma observação textual.';
  if (fields.some(([key]) => study[key].length > 6000)) return 'Cada campo comporta até 6.000 caracteres.';
  return '';
}

function isSavedStudy(value: unknown): value is Study {
  if (!value || typeof value !== 'object') return false;
  const study = value as Record<string, unknown>;
  return typeof study.id === 'string' && study.id.length > 0
    && typeof study.passage === 'string' && typeof study.genre === 'string'
    && genres.some(genre => genre === study.genre)
    && fields.every(([field]) => typeof study[field] === 'string');
}

export function parseSavedStudies(raw: string): Study[] {
  const studies: unknown = JSON.parse(raw);
  if (!Array.isArray(studies) || !studies.every(isSavedStudy)
      || new Set(studies.map(study => study.id)).size !== studies.length) {
    throw new Error('Formato inválido das fichas salvas.');
  }
  return studies;
}

function escapeHeading(text: string) {
  return text.replace(/[\r\n]+/g, ' ').replace(/[\\`*_{}\[\]<>#+!|]/g, '\\$&');
}

export function exportStudy(study: Study) {
  return '# Estudo de ' + escapeHeading(study.passage) + '\n\nGênero: ' + study.genre + '\n\n' +
    fields.filter(([key]) => study[key].trim()).map(([key, title]) => '## ' + title + '\n\n' + study[key].trim()).join('\n\n') + '\n';
}

export const examples: Example[] = [
  {
    study: { ...blankStudy(), id: 'videira', passage: 'João 15:1–8', genre: 'Evangelho',
      literary: 'A metáfora integra os discursos de despedida de Jesus (João 13–17). João 15:9–17 desenvolve amor e obediência.',
      historical: 'A cena pertence à narrativa da última noite de Jesus com seus discípulos. A imagem da videira também aparece em textos sobre Israel.',
      observation: 'A passagem usa os elementos videira, agricultor e ramos. Permanecer e dar fruto são ideias recorrentes.',
      questions: 'Que papel Jesus, o Pai e os discípulos desempenham na imagem? Como o desenvolvimento nos versículos seguintes esclarece o fruto?',
      references: 'João 15:9–17 (contexto imediato); Isaías 5:1–7 (imagem da vinha).',
      comparison: 'Isaías usa a vinha ao tratar de Israel e de justiça. A imagem em João destaca a relação dos discípulos com Jesus; a semelhança de imagem permite comparar os usos.',
      hypothesis: 'No contexto do discurso, a permanência em Jesus sustenta uma vida de discípulo que dá fruto. A ligação entre fruto e amor pode ser investigada em João 15:9–17.',
      application: 'Escolher uma prática concreta de cuidado com alguém da comunidade e retomá-la no próximo encontro.' },
    prompt: 'Liste duas repetições e proponha uma hipótese sobre a função de cada uma.',
    guide: 'Marque as repetições em sua tradução. Em seguida, explique o que os versículos 5 e 8 associam a essas ideias e confira sua leitura nos versículos 9–17.',
  },
  {
    study: { ...blankStudy(), id: 'unidade', passage: 'Efésios 4:1–6', genre: 'Carta',
      literary: 'O chamado à unidade abre a parte exortativa da carta. Efésios 4:7–16 amplia a discussão com a diversidade de dons.',
      historical: 'Trata-se de uma carta dirigida a comunidades cristãs. A autoria paulina e a circulação do escrito fazem parte da discussão introdutória.',
      observation: 'O texto enumera disposições relacionais e repete a ideia de unidade.',
      questions: 'O que a repetição faz no argumento? Como a diversidade de dons se encaixa na unidade descrita?',
      references: 'Efésios 4:7–16 (continuação); 1 Coríntios 12:12–27 (paralelo temático).',
      comparison: 'As duas cartas usam a imagem do corpo em argumentos sobre vida comunitária. Leia o assunto de cada seção antes de juntar as aplicações.',
      hypothesis: 'A unidade apresentada tem fundamento comum e implica práticas comunitárias de humildade, paciência e paz.',
      application: 'Combinar uma forma de ouvir e acolher um participante com quem o grupo discorda.' },
    prompt: 'Separe a lista de atitudes da lista de elementos compartilhados pela comunidade.',
    guide: 'Compare os versículos 2–3 com os versículos 4–6. Formule por escrito como a segunda lista fundamenta a primeira.',
  },
  {
    study: { ...blankStudy(), id: 'salmo', passage: 'Salmos 1:1–6', genre: 'Poesia',
      literary: 'O poema abre o livro dos Salmos e descreve dois caminhos por meio de imagens e contrastes.',
      historical: 'A redação do poema e seu uso na formação do Saltério são questões diferentes. O salmo está sem título de autoria.',
      observation: 'Uma árvore plantada perto de água e a palha dispersa sustentam o contraste.',
      questions: 'Que diferença as duas imagens comunicam? Como ler uma imagem poética junto ao restante do Saltério?',
      references: 'Jeremias 17:5–8 (paralelo de imagens); Salmos 73 (pergunta sobre o sucesso dos injustos).',
      comparison: 'Jeremias também contrasta caminhos com imagens de vegetação. O Salmo 73 ajuda a perguntar como a tradição sapiencial lida com a experiência de sofrimento.',
      hypothesis: 'A imagem da árvore apresenta estabilidade e fruto vinculados à instrução do Senhor na lógica poética do salmo.',
      application: 'Reservar um momento para ler o poema em voz alta e anotar o lugar que a instrução tem nas decisões da semana.' },
    prompt: 'Descreva primeiro a árvore e a palha. Depois explique como o poema as usa.',
    guide: 'Guarde as imagens em observação textual. Na hipótese, explique o contraste com o apoio dos versos que o cercam.',
  },
];
