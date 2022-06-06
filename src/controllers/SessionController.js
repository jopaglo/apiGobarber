import jwt from 'jsonwebtoken';
import { compare } from 'bcryptjs'; // compara senha normal com criptografada
import User from '../models/User';
import File from '../models/File';
import tokenConfig from '../config/token';
class SessionController {
  async store(req, res) {
    /* o objetivo é avaliar se o usuário e a senha batem,
    e se for positivo ai vamos liberar e gerar um token */
    const { email, password } = req.body;

    const checkUserExists = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!checkUserExists) {
      return res
        .status(401)
        .json({ error: 'Combinação Usuário/Senha não conferem!' });
    }

    /* verifico se a senha dele está batendo */
    const checkPasswordIsCorrect = await compare(
      password,
      checkUserExists.password_hash
    );

    if (!checkPasswordIsCorrect) {
      return res
        .status(401)
        .json({ error: 'Combinação Usuário/Senha não conferem!' });
    }

    const { id, name, avatar, provider } = checkUserExists;

    return res.json({
      user: {
        id,
        name,
        provider,
        email,
        avatar,
      },
      token: jwt.sign({ id }, tokenConfig.secret, {
        expiresIn: tokenConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
