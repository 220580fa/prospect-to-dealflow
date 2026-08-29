# Sales Navigator Pro

Segue abaixo prompt para criação de CRM e anexo a identidade visual para o desgni do CRM

PROMPT MESTRE — CRIAÇÃO DE CRM DE VENDAS NO LOVABLE

Crie uma aplicação web completa de CRM para gestão de prospecção, vendas e relacionamento com leads, com foco em equipes comerciais B2B.

O sistema deve ser moderno, rápido, intuitivo e visual, permitindo que vendedores e gestores acompanhem todo o ciclo comercial, desde a entrada de um lead até o fechamento da venda.

Não crie somente um protótipo visual. Estruture a aplicação para funcionar como um produto SaaS real, incluindo:

autenticação;

banco de dados;

relacionamentos entre tabelas;

CRUD completo;

regras de negócio;

permissões;

filtros;

dashboards;

Kanban com drag-and-drop;

histórico de alterações;

atividades;

automações;

integrações preparadas para e-mail e WhatsApp.

Utilize Supabase para autenticação, banco de dados e persistência das informações.

1. ESTRUTURA PRINCIPAL DO CRM

Criar no menu lateral as seguintes áreas:

Dashboard

CRM / Funis

Leads

Empresas

Contatos

Tarefas

Agenda

Atividades

Conversas

Relatórios

Metas

Usuários

Configurações

Integrações

O menu lateral deve ser recolhível.

2. FUNIS DE VENDAS

O CRM deve permitir:

criar vários funis;

editar funis;

duplicar funis;

arquivar funis;

criar etapas;

excluir etapas;

reorganizar etapas;

definir cores;

definir probabilidades de fechamento por etapa.

A visualização principal dos funis deve ser em formato Kanban.

Os cards precisam ser movimentados entre etapas utilizando drag-and-drop.

Ao movimentar um card, salvar automaticamente:

etapa anterior;

nova etapa;

usuário responsável pela movimentação;

data;

horário;

tempo que permaneceu na etapa anterior.

3. FUNIL 1 — PROSPECÇÃO

Criar automaticamente um funil chamado:

Prospecção

Com exatamente estas etapas nesta ordem:

Smart Lead

Ativado

Triagem

Hot Lead

MQL

SQL

O sistema deve mostrar no topo de cada coluna:

nome da etapa;

quantidade de leads;

quantidade de atividades pendentes;

tempo médio dos leads naquela etapa.

4. FUNIL 2 — CONVERSÃO

Criar automaticamente outro funil chamado:

Conversão

Com as etapas:

Proposta

Oportunidade

Negociação

Fechamento

Ganho

A etapa Ganho deve representar negócios vendidos.

Também deve existir a possibilidade de marcar qualquer negócio como:

PERDIDO.

Ao marcar como perdido, solicitar obrigatoriamente o motivo da perda.

Criar motivos configuráveis como:

preço;

concorrência;

sem orçamento;

sem prioridade;

não respondeu;

timing;

solução não aderente;

desistência;

outro.

5. CARD DO LEAD / NEGÓCIO

Cada card no Kanban deve mostrar de forma resumida:

Nome do contato

Empresa

Valor potencial

Responsável

Próxima atividade

Data da próxima atividade

Tempo na etapa

Temperatura do lead

Tags

Os cards devem possuir alertas visuais quando:

não existir próxima tarefa;

uma tarefa estiver atrasada;

o lead estiver há muitos dias sem interação;

houver reunião agendada;

houver proposta enviada.

6. CADASTRO DO LEAD

Ao criar ou editar um lead, permitir os seguintes campos:

Dados pessoais

Nome

Sobrenome

Telefone

WhatsApp

E-mail

Cargo

LinkedIn

Empresa

Nome da empresa

CNPJ

Site

Segmento

Número de funcionários

Cidade

Estado

Informações comerciais

Funil

Etapa

Responsável

Origem do lead

Campanha

Temperatura

Lead Score

Valor potencial

Produto ou serviço de interesse

Data estimada de fechamento

Probabilidade de fechamento

Concorrente

Observações

Classificação

Temperatura:

Frio

Morno

Quente

Tags personalizadas

Exemplos:

Inbound

Outbound

Indicação

Evento

Google

LinkedIn

Instagram

Parceiro

7. PERFIL COMPLETO DO LEAD

Ao clicar em um lead, abrir uma página ou drawer com visão 360°.

Na parte superior mostrar:

Nome

Empresa

Telefone

WhatsApp

E-mail

Cargo

Responsável

Etapa atual

Valor potencial

Probabilidade

Lead Score

Origem

Tags

Próxima atividade

Criar ações rápidas:

Ligar

WhatsApp

Enviar e-mail

Criar tarefa

Agendar reunião

Adicionar nota

Mover etapa

Criar proposta

Marcar como ganho

Marcar como perdido

8. TIMELINE / HISTÓRICO DO LEAD

Criar uma timeline cronológica centralizada contendo todo o histórico do relacionamento.

Registrar automaticamente:

criação do lead;

alteração de responsável;

alteração de campos;

movimentações entre etapas;

ligações;

mensagens WhatsApp;

e-mails enviados;

e-mails recebidos;

reuniões;

tarefas;

notas;

propostas;

follow-ups;

mudança de valor;

ganho;

perda.

Cada registro deve mostrar:

Data

Horário

Tipo da atividade

Descrição

Usuário responsável

9. FOLLOW-UP

Criar funcionalidade específica de follow-up.

O vendedor deve conseguir registrar:

Data

Canal utilizado

Resultado

Observação

Próxima ação

Data da próxima ação

Canais:

Ligação

WhatsApp

E-mail

Reunião

LinkedIn

Outro

Resultados possíveis:

Contato realizado

Sem resposta

Interessado

Solicitou retorno

Reunião marcada

Proposta solicitada

Não interessado

10. GESTÃO DE TAREFAS

Criar sistema completo de tarefas.

Tipos:

Ligação

WhatsApp

E-mail

Follow-up

Reunião

Enviar proposta

Retornar contato

Tarefa personalizada

Cada tarefa deve conter:

Título

Lead

Empresa

Responsável

Tipo

Descrição

Data

Horário

Prioridade

Status

Lembrete

Prioridade:

Baixa

Média

Alta

Urgente

Status:

Pendente

Em andamento

Concluída

Atrasada

Cancelada

Quando uma tarefa for concluída, permitir imediatamente:

Criar próxima tarefa.

11. CENTRAL DE TAREFAS

Criar uma tela chamada:

Minhas Tarefas

Separar por:

Hoje

Atrasadas

Próximas

Concluídas

Permitir filtros por:

Usuário

Período

Tipo

Funil

Etapa

Empresa

Prioridade

12. E-MAIL

Criar infraestrutura para integração de e-mail.

Dentro do perfil do lead permitir:

Enviar e-mail.

Abrir composer contendo:

Para

CC

Assunto

Mensagem

Anexo

Templates

Criar templates de e-mail reutilizáveis.

Registrar automaticamente os e-mails enviados na timeline.

Preparar arquitetura para futuramente permitir sincronização da caixa de entrada.

13. WHATSAPP

Criar infraestrutura preparada para integração com API oficial do WhatsApp Business ou outro provedor.

Dentro do lead disponibilizar:

Enviar WhatsApp.

Permitir:

Mensagem manual

Templates

Mensagens salvas

Variáveis personalizadas

Exemplo:

Olá {{nome}}, tudo bem?

Registrar mensagens enviadas no histórico do lead.

14. AGENDAMENTO DE COMUNICAÇÕES

Permitir criar tarefas programadas como:

Enviar WhatsApp amanhã às 10h.

Enviar e-mail daqui a dois dias.

Fazer follow-up em cinco dias.

Essas atividades devem aparecer na agenda e central de tarefas.

A arquitetura deve ficar preparada para execução automática através de integrações futuras.

15. AGENDA

Criar calendário comercial com visualizações:

Dia

Semana

Mês

Mostrar:

Reuniões

Follow-ups

Tarefas

Ligações

WhatsApps agendados

E-mails agendados

Permitir criar atividades diretamente pelo calendário.

16. REUNIÕES

Registrar:

Reunião agendada

Reunião realizada

No-show

Reagendada

Cancelada

Campos:

Lead

Empresa

Data

Horário

Responsável

Participantes

Link da videoconferência

Observações

Resultado da reunião

Próximos passos

17. DASHBOARD COMERCIAL

Criar dashboard executivo moderno com filtros globais por:

Hoje

Ontem

Últimos 7 dias

Últimos 30 dias

Este mês

Mês anterior

Trimestre

Ano

Período personalizado

Vendedor

Equipe

Funil

Origem

Produto

Mostrar indicadores:

Total de leads

Novos leads

Leads trabalhados

Leads sem atividade

Smart Leads

Ativados

Leads em Triagem

Hot Leads

MQLs

SQLs

Oportunidades

Propostas enviadas

Negociações

Vendas ganhas

Vendas perdidas

Valor total do pipeline

Receita ganha

Ticket médio

Taxa de conversão geral

Número de reuniões agendadas

Número de reuniões realizadas

No-show

Taxa de comparecimento em reuniões

Ciclo médio de vendas

Tempo médio por etapa

Forecast

18. TAXA DE CONVERSÃO POR ETAPA

Criar gráfico mostrando conversão:

Smart Lead → Ativado

Ativado → Triagem

Triagem → Hot Lead

Hot Lead → MQL

MQL → SQL

SQL → Proposta

Proposta → Oportunidade

Oportunidade → Negociação

Negociação → Fechamento

Fechamento → Ganho

Mostrar:

Quantidade que entrou

Quantidade que avançou

Percentual de conversão

Tempo médio na etapa

19. FUNIL VISUAL DE CONVERSÃO

Criar gráfico em formato de funil mostrando o volume de leads em cada etapa.

Permitir comparar períodos.

Exemplo:

Este mês versus mês anterior.

20. FORECAST DE VENDAS

Criar módulo de forecast.

Cada oportunidade deve possuir:

Valor

Probabilidade

Data prevista de fechamento

Calcular:

Forecast bruto = soma dos negócios abertos.

Forecast ponderado = valor do negócio × probabilidade de fechamento.

Exibir forecast:

Mensal

Trimestral

Por vendedor

Por equipe

Por produto

21. PROBABILIDADE POR ETAPA

Permitir configurar uma probabilidade padrão para cada etapa.

Exemplo inicial:

Smart Lead: 5%

Ativado: 10%

Triagem: 15%

Hot Lead: 25%

MQL: 35%

SQL: 50%

Proposta: 60%

Oportunidade: 70%

Negociação: 80%

Fechamento: 90%

Ganho: 100%

Esses percentuais devem ser editáveis.

22. LEAD SCORE

Criar sistema de Lead Score.

Permitir pontuação manual e futura automação.

Exibir:

0–30 = Frio

31–60 = Morno

61–80 = Quente

81–100 = Muito quente

Permitir ordenar leads pelo score.

23. AGING DO LEAD

O CRM deve calcular automaticamente:

Tempo total desde criação do lead.

Tempo sem contato.

Tempo na etapa atual.

Criar indicador visual para leads parados.

Exemplo:

Verde = recente

Amarelo = atenção

Vermelho = lead parado

Os limites devem ser configuráveis.

24. PRÓXIMA AÇÃO

Todo lead deve possuir o conceito de:

Próxima ação

Exemplos:

Ligar amanhã

Enviar proposta

Cobrar retorno

Agendar reunião

Enviar WhatsApp

Criar filtro:

Leads sem próxima ação.

Esse filtro deve ser facilmente acessível por vendedores e gestores.

25. CADASTRO DE EMPRESAS

Criar módulo Empresas.

Cada empresa pode possuir vários contatos e vários negócios.

Campos:

Razão social

Nome fantasia

CNPJ

Segmento

Site

Telefone

Número de funcionários

Cidade

Estado

Responsável comercial

Observações

Mostrar dentro da empresa:

Contatos

Negócios

Atividades

Histórico

Valor total do pipeline

Receita gerada

26. CONTATOS

Uma empresa pode possuir múltiplos contatos.

Campos:

Nome

Cargo

Telefone

WhatsApp

E-mail

LinkedIn

Empresa relacionada

Decisor?

Influenciador?

Usuário?

Permitir marcar o papel do contato na decisão de compra.

27. PRODUTOS E SERVIÇOS

Criar cadastro de produtos/serviços.

Campos:

Nome

Descrição

Preço padrão

Categoria

Ativo / inativo

Uma oportunidade poderá possuir um ou vários produtos.

Calcular automaticamente o valor total da oportunidade.

28. ORIGEM DOS LEADS

Criar relatório de aquisição por origem.

Origens iniciais:

Outbound

Inbound

Google Ads

Meta Ads

Instagram

LinkedIn

Indicação

Evento

Parceiro

Site

Importação

Outro

Mostrar:

Quantidade de leads

MQL

SQL

Oportunidades

Vendas

Taxa de conversão

Receita

Ticket médio

29. USUÁRIOS

Criar cadastro de usuários.

Campos:

Nome

E-mail

Telefone

Cargo

Equipe

Status

Perfil de acesso

Perfis:

Administrador

Gestor Comercial

Vendedor

30. PERMISSÕES

Administrador

Acesso completo.

Gestor Comercial

Visualiza equipe, pipeline, relatórios, metas e performance.

Vendedor

Visualiza prioritariamente seus próprios leads, tarefas, negócios e atividades.

Criar estrutura Row Level Security no Supabase para respeitar essas permissões.

31. EQUIPES

Permitir criar equipes comerciais.

Exemplo:

SDR

Closer

Inside Sales

Cada usuário pode pertencer a uma equipe.

Permitir relatórios por equipe.

32. METAS

Criar módulo de metas.

Tipos:

Receita

Vendas

Reuniões

SQL

MQL

Oportunidades

Atividades

Permitir metas:

Mensais

Trimestrais

Individuais

Por equipe

Mostrar:

Meta

Realizado

Percentual atingido

Projeção

33. PERFORMANCE DOS VENDEDORES

Criar ranking comercial mostrando:

Vendedor

Leads trabalhados

Atividades realizadas

Reuniões

Propostas

Oportunidades

Vendas

Receita

Ticket médio

Conversão

Ciclo médio de vendas

Permitir ordenar pelas métricas.

34. DUPLICIDADE DE LEADS

Ao cadastrar um novo lead, verificar:

Telefone

WhatsApp

E-mail

CNPJ da empresa

Caso já exista registro semelhante, mostrar aviso:

"Possível lead duplicado."

Permitir:

Visualizar registro existente

Cancelar criação

Criar mesmo assim

Mesclar registros

35. BUSCA GLOBAL

Criar busca no topo do CRM.

Permitir pesquisar rapidamente:

Nome

Telefone

E-mail

Empresa

CNPJ

Negócio

36. FILTROS AVANÇADOS

Criar filtros combináveis por:

Vendedor

Equipe

Funil

Etapa

Origem

Temperatura

Score

Tag

Empresa

Segmento

Produto

Período de criação

Última interação

Próxima atividade

Valor

Previsão de fechamento

Leads sem tarefa

Leads parados

37. IMPORTAÇÃO

Criar funcionalidade para importar leads via CSV/XLSX.

Permitir mapeamento das colunas.

Exemplo:

Nome → nome

Telefone → telefone

Empresa → empresa

E-mail → email

Origem → origem

Após importação mostrar:

Registros importados

Duplicados

Erros

38. EXPORTAÇÃO

Permitir exportar dados filtrados para:

CSV

XLSX

39. NOTIFICAÇÕES

Criar central de notificações.

Notificar:

Tarefa vencendo

Tarefa atrasada

Nova reunião

Lead atribuído

Lead sem contato

Negócio parado

Mudança de responsável

Oportunidade próxima do fechamento

40. AUTOMAÇÕES

Criar módulo visual chamado:

Automações

Estrutura:

QUANDO [evento]

SE [condição]

ENTÃO [ação]

Exemplo:

QUANDO lead entrar em SQL

ENTÃO criar tarefa:

"Ligar para lead"

Prazo:

1 dia.

Outros gatilhos:

Lead criado

Lead mudou de etapa

Lead ficou X dias parado

Reunião realizada

Proposta enviada

Negócio ganho

Negócio perdido

Ações:

Criar tarefa

Alterar responsável

Alterar etapa

Adicionar tag

Criar notificação

Preparar WhatsApp

Preparar e-mail

41. PAINEL DE LEADS PARADOS

Criar uma visualização específica:

Leads que precisam de atenção

Mostrar leads:

Sem interação há X dias

Sem tarefa futura

Com tarefa atrasada

Parados na mesma etapa

Com proposta enviada sem retorno

SQL sem follow-up

Ordenar pelo nível de prioridade.

42. BANCO DE DADOS

Criar arquitetura relacional no Supabase.

Estruturas principais:

users

teams

funnels

stages

leads

companies

contacts

deals

activities

tasks

meetings

emails

whatsapp_messages

notes

products

deal_products

tags

lead_tags

loss_reasons

goals

automation_rules

notifications

Cada tabela deve possuir:

id

created_at

updated_at

created_by

Quando aplicável.

Criar corretamente relacionamentos e foreign keys.

43. HISTÓRICO E AUDITORIA

Não apagar silenciosamente informações importantes.

Registrar histórico das principais alterações:

Responsável

Etapa

Valor

Probabilidade

Status

Data prevista de fechamento

Ganho/perda

Permitir ao gestor consultar a timeline.

44. EXPERIÊNCIA KANBAN

O Kanban é uma das telas mais importantes do produto.

Criar design semelhante à experiência de CRMs modernos.

Cada coluna deve possuir scroll independente quando necessário.

Cards compactos.

Drag-and-drop suave.

Filtros no topo.

Seletor de funil no topo.

Botão:

Novo Lead

Mostrar valor total da coluna.

Exemplo:

OPORTUNIDADE

8 negócios

R$ 142.000

45. DASHBOARD — VISUAL

Utilizar:

Cards de KPI

Gráficos de linha

Gráficos de barras

Funil de conversão

Ranking

Forecast

Indicadores percentuais

Não poluir a interface.

Priorizar informações que ajudem o gestor comercial a responder:

Quanto temos em pipeline?

Quanto podemos vender?

Onde estamos perdendo leads?

Qual vendedor performa melhor?

Qual canal gera mais vendas?

Quantas reuniões estamos realizando?

Quantos leads estão parados?

Qual nossa conversão por etapa?

46. DESIGN

Criar interface SaaS B2B moderna, profissional e minimalista.

Evitar aparência genérica de template.

Utilizar bastante espaço em branco.

Cards com bordas discretas.

Tipografia clara.

Ícones minimalistas.

Layout desktop-first, mas responsivo.

Menu lateral fixo/recolhível.

Topbar limpa.

Utilizar componentes consistentes em toda aplicação.

Priorizar velocidade operacional: ações comerciais importantes devem exigir o menor número possível de cliques.

47. DADOS DEMONSTRATIVOS

Criar dados fictícios suficientes para demonstrar todas as telas.

Criar:

20 leads

10 empresas

10 oportunidades

5 usuários

tarefas

reuniões

histórico de atividades

negócios ganhos

negócios perdidos

Distribuir os leads entre os dois funis para tornar Kanban, dashboard e relatórios imediatamente visualizáveis.

48. REGRAS IMPORTANTES

Não utilizar dados estáticos apenas para simular funcionalidades.

Sempre que possível conectar telas ao banco de dados real.

Todas as operações CRUD devem persistir no Supabase.

Mover um lead no Kanban deve atualizar o banco.

Criar tarefa deve atualizar a agenda.

Concluir tarefa deve atualizar a timeline.

Enviar comunicação deve gerar registro no histórico.

Marcar negócio como ganho deve refletir nos dashboards.

Marcar negócio como perdido deve refletir nos relatórios de perda.

Todas as métricas devem ser calculadas com os dados reais armazenados no sistema.

49. PRIORIDADE DE DESENVOLVIMENTO

Caso seja necessário implementar progressivamente, seguir esta ordem:

FASE 1

Autenticação

Usuários

Empresas

Contatos

Leads

Funis

Etapas

Kanban

Perfil completo do lead

Timeline

Tarefas

Agenda

Dashboard básico

FASE 2

Reuniões

Produtos

Metas

Forecast

Relatórios

Performance por vendedor

Lead Score

Aging

Filtros avançados

FASE 3

E-mail

WhatsApp

Templates

Automações

Notificações

Importação/exportação

Integrações externas

50. OBJETIVO FINAL

O resultado deve ser um CRM em que um vendedor consiga entrar pela manhã e imediatamente saber:

Quem preciso contatar hoje?

Quem está atrasado?

Quem precisa de follow-up?

Quais são meus Hot Leads?

Quais MQLs e SQLs precisam avançar?

Quais propostas estão abertas?

Quais negociações têm maior chance de fechar?

Quanto tenho em pipeline?

Quanto posso fechar este mês?

E o gestor deve conseguir visualizar facilmente:

Volume de prospecção

Qualidade do pipeline

Conversão por etapa

Performance dos vendedores

Número de reuniões

Forecast

Receita

Leads parados

Motivos de perda

Origem das vendas

Metas versus realizado

O CRM deve transformar toda a operação comercial em um processo organizado, mensurável, previsível e orientado a próxima ação.

ATUALIZAÇÃO DO CRM — TRANSIÇÃO SQL → FUNIL DE VENDA

Atualize o projeto atual do CRM com as regras abaixo.

Não remova as funcionalidades já desenvolvidas. Faça as alterações preservando banco de dados, relacionamentos, histórico, usuários, leads, tarefas e demais funcionalidades existentes.

1. RENOMEAR FUNIL DE CONVERSÃO

Em TODO o sistema, substituir o conceito:

"Funil de Conversão"

por:

"Funil de Venda"

Essa alteração deve ser feita em:

banco de dados;

interface;

menus;

dashboards;

filtros;

relatórios;

automações;

gráficos;

configurações;

dados demonstrativos;

regras de negócio;

textos;

labels;

títulos;

métricas.

O sistema passa a possuir dois funis comerciais principais:

Funil de Prospecção

Smart Lead

Ativado

Triagem

Hot Lead

MQL

SQL

Funil de Venda

Proposta

Oportunidade

Negociação

Fechamento

Ganho

Também continuar permitindo marcar negócios como:

PERDIDO

2. LÓGICA ENTRE OS DOIS FUNIS

Os dois funis representam momentos diferentes da operação comercial.

Funil de Prospecção

Representa aquisição, abordagem, qualificação e preparação do lead para uma reunião comercial.

Funil de Venda

Representa as oportunidades comerciais que já passaram pela qualificação/reunião e estão em processo de fechamento.

O histórico entre os dois funis nunca pode ser perdido.

O lead deve permanecer sendo o mesmo registro principal no CRM.

Quando avançar para Venda, criar ou vincular um registro de oportunidade/deal relacionado ao lead, evitando duplicação desnecessária dos dados.

3. REGRA PRINCIPAL — SQL

A etapa SQL deve funcionar como um ponto de transição entre Prospecção e Venda.

Quando um lead entrar na etapa:

SQL

ele NÃO deve ser transferido imediatamente para o Funil de Venda.

Ao entrar em SQL, considerar que o lead está qualificado para uma reunião comercial.

O sistema deve permitir:

agendar reunião;

registrar reunião realizada;

registrar no-show;

reagendar reunião;

cancelar reunião.

A transferência para o Funil de Venda acontece somente após uma reunião ser marcada como:

REUNIÃO REALIZADA

e o questionário de qualificação pós-reunião ser preenchido.

4. QUESTIONÁRIO PÓS-REUNIÃO

Quando o vendedor clicar em:

"Marcar reunião como realizada"

abrir automaticamente um modal ou drawer chamado:

Qualificação da Reunião

Esse questionário deve ser simples, rápido e comercial.

Dividir em blocos.

5. BLOCO — CONTEXTO DO CLIENTE

Perguntar:

1. Qual é o principal problema ou desafio identificado?

Campo de texto longo.

Obrigatório.

2. Como esse problema é tratado atualmente?

Campo de texto longo.

Exemplos:

Processo manual

Planilhas

Sistema próprio

Fornecedor atual

Não possui processo estruturado

Outro

3. Qual impacto esse problema gera para a empresa?

Campo de múltipla seleção:

aumento de custos;

perda de produtividade;

retrabalho;

falta de controle;

falta de previsibilidade;

perda de receita;

riscos operacionais;

dificuldade de gestão;

outro.

Permitir comentário complementar.

6. BLOCO — NECESSIDADE

4. O cliente demonstrou necessidade real da solução?

Opções:

Sim

Parcialmente

Não

Campo adicional:

Observações.

5. Qual solução/produto despertou maior interesse?

Selecionar produtos ou serviços cadastrados no CRM.

Permitir múltipla seleção.

7. BLOCO — DECISÃO

6. A pessoa presente na reunião é decisora?

Opções:

Sim

Não

Participa da decisão

Não identificado

7. Existem outros decisores envolvidos?

Opções:

Sim

Não

Não identificado

Se SIM, permitir registrar:

Nome

Cargo

Contato

Papel na decisão

8. BLOCO — ORÇAMENTO

8. Existe orçamento disponível?

Opções:

Sim

Não

Ainda não definido

Não informado

9. Qual o valor potencial da oportunidade?

Campo monetário.

R$ __________

Esse valor deve alimentar automaticamente:

oportunidade;

pipeline;

forecast;

dashboards.

9. BLOCO — TIMING

10. Existe previsão para contratação?

Opções:

Imediatamente

Até 30 dias

31 a 60 dias

61 a 90 dias

Mais de 90 dias

Sem previsão

11. Qual a data estimada de fechamento?

Campo de data.

Essa informação deve alimentar o forecast.

10. BLOCO — CONCORRÊNCIA

12. O cliente está avaliando concorrentes?

Opções:

Sim

Não

Não informado

Se SIM:

Perguntar:

Quais concorrentes?

Campo de texto.

11. BLOCO — PERCEPÇÃO DO VENDEDOR

13. Qual o nível de interesse percebido?

Opções:

Baixo

Médio

Alto

Muito alto

14. Qual a probabilidade estimada de fechamento?

Campo:

0% a 100%

Permitir seleção rápida:

10%

25%

50%

75%

90%

Ou entrada manual.

15. Quais foram os principais pontos discutidos na reunião?

Campo de texto longo.

16. Quais foram as principais objeções?

Campo de texto longo.

Opcional.

17. Quais foram os próximos passos acordados?

Campo de texto longo.

Obrigatório.

12. PRÓXIMA AÇÃO

Antes de concluir o questionário, perguntar:

Qual é a próxima ação?

Opções:

Enviar proposta

Enviar apresentação

Enviar orçamento

Enviar informações adicionais

Agendar nova reunião

Fazer follow-up

Aguardar retorno do cliente

Outra

Solicitar:

Responsável

Data

Horário

O CRM deve criar automaticamente uma tarefa relacionada ao lead/oportunidade.

13. BOTÃO FINAL

No final do formulário disponibilizar o botão:

"Concluir reunião e criar oportunidade"

Ao clicar nesse botão, executar automaticamente todas as ações descritas abaixo.

14. AUTOMAÇÃO APÓS REUNIÃO REALIZADA

Quando o questionário for concluído:

Ação 1

Alterar status da reunião para:

REALIZADA

Ação 2

Registrar na timeline:

"Reunião realizada"

com:

Data

Horário

Vendedor

Participantes

Resumo da reunião

Respostas do questionário

Próximos passos

Ação 3

Manter registrado no histórico que o lead chegou até:

SQL

no Funil de Prospecção.

NÃO apagar nem alterar retroativamente essa informação.

Ação 4

Criar automaticamente uma oportunidade/deal.

Relacionar essa oportunidade ao mesmo:

Lead

Contato

Empresa

Vendedor

Ação 5

Inserir automaticamente a oportunidade no:

Funil de Venda

Etapa inicial:

Proposta

Ação 6

Transferir para a oportunidade os dados levantados na reunião:

Valor potencial

Produto/serviço

Probabilidade

Data prevista de fechamento

Necessidade

Problema

Timing

Orçamento

Decisores

Concorrentes

Objeções

Próximos passos

Ação 7

Criar automaticamente a próxima tarefa definida pelo vendedor.

Ação 8

Registrar na timeline:

"Lead qualificado como SQL e convertido em oportunidade de venda."

15. NÃO DUPLICAR O LEAD

Essa regra é extremamente importante.

Quando o lead passar do Funil de Prospecção para o Funil de Venda:

NÃO criar outro lead.

Manter:

lead_id

company_id

contact_id

Criar apenas:

deal_id / opportunity_id

relacionado ao lead original.

Estrutura conceitual:

Empresa
↓
Contato
↓
Lead
↓
Prospecção
↓
SQL
↓
Reunião realizada
↓
Oportunidade
↓
Funil de Venda
↓
Proposta
↓
Oportunidade
↓
Negociação
↓
Fechamento
↓
Ganho

16. HISTÓRICO COMPLETO ENTRE FUNIS

A timeline deve permitir visualizar toda a jornada comercial.

Exemplo:

10/08
Lead criado

11/08
Smart Lead

12/08
Ativado

14/08
Triagem

16/08
Hot Lead

18/08
MQL

20/08
SQL

21/08
Reunião agendada

23/08
Reunião realizada

23/08
Qualificação concluída

23/08
Oportunidade criada

23/08
Entrada no Funil de Venda

23/08
Proposta

25/08
Proposta enviada

28/08
Oportunidade

01/09
Negociação

05/09
Fechamento

08/09
Ganho

Esse histórico não pode ser perdido.

17. REGRA PARA NO-SHOW

Caso o vendedor marque:

NO-SHOW

não criar oportunidade.

O lead continua em SQL.

Registrar na timeline:

"No-show na reunião"

e solicitar automaticamente:

Nova data para reunião

ou

Criar follow-up

18. REUNIÃO REAGENDADA

Se a reunião for reagendada:

Manter lead em SQL.

Registrar no histórico:

Data anterior

Nova data

Motivo do reagendamento

Criar nova atividade automaticamente.

19. REUNIÃO CANCELADA

Se a reunião for cancelada:

Manter o lead em SQL inicialmente.

Perguntar:

Qual o motivo?

Opções:

Cliente cancelou

Sem interesse

Sem prioridade

Sem orçamento

Perdeu contato

Reagendar futuramente

Outro

Permitir ao vendedor decidir:

Manter em SQL

Mover para etapa anterior

Marcar como perdido/desqualificado

20. BOTÕES NA ETAPA SQL

Nos cards que estiverem em SQL, destacar ações:

Agendar reunião

Reunião realizada

No-show

Reagendar

Follow-up

WhatsApp

E-mail

Telefone

Abrir lead

21. INDICADORES DE REUNIÃO

Adicionar ao dashboard:

Reuniões agendadas

Reuniões realizadas

No-shows

Reuniões reagendadas

Reuniões canceladas

Taxa de comparecimento

Taxa de reunião → oportunidade

Taxa de SQL → reunião realizada

Taxa de SQL → oportunidade

Tempo médio entre SQL e reunião

Tempo médio entre reunião e proposta

22. NOVA MÉTRICA — REUNIÃO PARA OPORTUNIDADE

Calcular:

Taxa reunião → oportunidade =

Quantidade de reuniões que geraram oportunidade
÷
Quantidade de reuniões realizadas

× 100

Exibir no dashboard.

23. NOVA MÉTRICA — SQL PARA OPORTUNIDADE

Calcular:

SQL → Oportunidade =

Quantidade de SQLs que entraram no Funil de Venda
÷
Quantidade total de SQLs

× 100

24. DASHBOARD SEPARADO POR OPERAÇÃO

Permitir analisar separadamente:

PROSPECÇÃO

Smart Leads

Ativados

Triagem

Hot Leads

MQL

SQL

Reuniões agendadas

Reuniões realizadas

No-show

Taxa SQL → reunião

Taxa reunião → oportunidade

VENDAS

Oportunidades criadas

Propostas

Oportunidades

Negociações

Fechamentos

Ganhos

Perdidos

Pipeline

Forecast

Receita

Ticket médio

Ciclo de venda

25. PERFORMANCE DO SDR E CLOSER

Preparar o CRM para operações com SDR e Closer.

O sistema deve permitir identificar:

SDR responsável pela prospecção.

Closer responsável pela venda.

Quando a oportunidade for criada após a reunião, permitir:

Manter o mesmo vendedor

OU

Transferir automaticamente para um Closer.

Criar nas configurações a regra:

Responsável por novas oportunidades

Opções:

Mesmo responsável pelo lead

Selecionar Closer específico

Distribuição automática entre Closers

Distribuição round-robin

26. MÉTRICAS DE SDR

Por SDR mostrar:

Leads trabalhados

Ativações

MQLs

SQLs

Reuniões marcadas

Reuniões realizadas

No-shows

Oportunidades geradas

Taxa MQL → SQL

Taxa SQL → reunião

Taxa reunião → oportunidade

Valor de pipeline gerado

27. MÉTRICAS DE CLOSER

Por Closer mostrar:

Oportunidades recebidas

Propostas enviadas

Negociações

Fechamentos

Ganhos

Perdas

Receita

Ticket médio

Taxa de fechamento

Ciclo médio

Forecast

28. QUESTIONÁRIO CONFIGURÁVEL

Criar arquitetura para que futuramente o administrador possa editar o questionário de reunião.

Permitir:

Criar pergunta

Editar pergunta

Excluir pergunta

Alterar ordem

Definir obrigatória/não obrigatória

Tipos de campo:

Texto curto

Texto longo

Número

Moeda

Data

Seleção única

Múltipla seleção

Sim/Não

Porcentagem

29. RESUMO DA REUNIÃO

Após preencher o questionário, gerar uma seção estruturada dentro do lead/oportunidade:

Resumo Comercial

Problema identificado

Situação atual

Impacto

Necessidade

Decisor

Orçamento

Timing

Concorrência

Solução de interesse

Valor potencial

Probabilidade

Objeções

Próximos passos

Esse resumo deve ficar disponível para SDR, Closer e Gestor.

30. REGRA PRINCIPAL DE NEGÓCIO

A transição deve obrigatoriamente seguir:

Smart Lead
→
Ativado
→
Triagem
→
Hot Lead
→
MQL
→
SQL
→
Reunião
→
Questionário de qualificação
→
Reunião realizada
→
Oportunidade criada
→
Funil de Venda
→
Proposta
→
Oportunidade
→
Negociação
→
Fechamento
→
Ganho

A entrada em SQL, sozinha, NÃO deve criar oportunidade.

A oportunidade só deve ser criada após:

reunião realizada;

questionário preenchido;

vendedor clicar em "Concluir reunião e criar oportunidade".

31. ATUALIZAÇÃO DE NOMENCLATURA GLOBAL

Revise todo o projeto existente.

Qualquer ocorrência de:

Funil de Conversão

Conversão

Pipeline de Conversão

deve ser analisada.

Quando estiver se referindo ao segundo pipeline comercial, substituir por:

Funil de Venda

ou

Vendas

ATENÇÃO:

Não substituir a palavra "conversão" quando ela estiver sendo utilizada como uma MÉTRICA.

Exemplos que devem permanecer:

Taxa de conversão

Conversão por etapa

Taxa de conversão SQL → oportunidade

Conversão reunião → oportunidade

Ou seja:

"Conversão" como nome do funil = substituir por Venda.

"Conversão" como indicador/métrica = manter.

32. RESULTADO ESPERADO

O CRM deve permitir enxergar claramente dois processos conectados:

PROSPECÇÃO

Encontrar
→
Abordar
→
Qualificar
→
Gerar SQL
→
Realizar reunião

e:

VENDA

Criar oportunidade
→
Enviar proposta
→
Avançar oportunidade
→
Negociar
→
Fechar
→
Ganhar

Os dois processos devem permanecer conectados pelo mesmo Lead, Empresa e Contato, oferecendo visão completa da jornada desde o primeiro contato até a venda.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://prospect-to-dealflow.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d97d94e0-0659-4eff-951f-c03a08fc480e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
