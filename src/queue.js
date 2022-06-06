import 'dotenv/config';

import Queue from './config/queue';

Queue.processQueue();

/*
criamos esse arquivo separadamente pq nós nao vamos executar no servidor principal,
nós vamos rodar em outra instancia, em um outro servidor, assim a fila nunca vai
impactar na performance da nossa aplicacao.
---eu tenho um terminal rodando a aplicacao principal: node. src/server.js
---eu crio outro terminal para rodar as tarefas: src/queue.js
*/
