import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import tokenConfig from '../config/token';

export default async (req, res, next) => {
  // recebo a informação do meu header
  const authHeader = req.headers.authorization;

  // se essa informação nao veio ou veio vazio eu já vou dar erro
  if (!authHeader || authHeader === 'Bearer') {
    return res.status(401).json({
      error:
        'O token enviado é nulo ou vazio! Faça login no sistema para gerar um novo token!',
    });
  }

  /* o token vem assim: 'Bearer f4d5sf4sd5f45sd4f5sd4f' / precisa quebrar
  eu uso uma virgula como tatica, pois nao vou usar o beraer */
  const [, token] = authHeader.split(' ');

  try {
    /* dentro do decod estarao as informacoes que nós geramos quando
    fizemos a geracao do token. O payload estará aqui dentro */
    const decoded = await promisify(jwt.verify)(token, tokenConfig.secret);

    /* eu nao preciso consultar o ID novamente, eu já tenho essa informacao
    quando ele faz o login, entao eu posso armazenar ela dentro do req */
    req.userId = decoded.id;

    return next(); // se chegou até aqui ele pode executar a funcao e seguir
  } catch (error) {
    return res
      .status(401)
      .json({ error: 'O token enviado é inválido para acesso ao sistema!' });
  }
};
