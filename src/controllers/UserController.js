import { compare } from 'bcryptjs';
import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string().required().min(3).max(32),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).max(12).required(),
      provider: Yup.boolean().required(),
    });

    // o isValid é assincrono, por isso eu uso o await
    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({
        error: 'O preenchimento dos campos do formulário não atende as regras!',
      });
    }

    const { name, email, password, provider } = req.body;

    /* verificar se já existe esse email cadastrado */
    const checkEmailExists = await User.findOne({
      where: { email },
    });
    if (checkEmailExists) {
      return res
        .status(400)
        .json({ error: 'Já existe um usuário cadastrado com esse e-mail!' });
    }

    const user = await User.create({
      name,
      email,
      password,
      provider,
    });

    return res.json(user);
  }

  async update(req, res) {
    const schemaValidation = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string(),
      confirmPassword: Yup.string(),
      avatar_id: Yup.number(),
    });

    if (!(await schemaValidation.isValid(req.body))) {
      return res.status(400).json({
        error: 'O preenchimento dos campos do formulário estão fora do padrão!',
      });
    }

    const {
      name,
      email,
      oldPassword,
      password,
      confirmPassword,
      avatar_id,
    } = req.body;

    const user = await User.findByPk(req.userId);

    /* Se ele quiser alterar o nome, eu preciso garantir que esse nome nao
    seja nulo ou vazio, mas só vou analisar se ele for diferente do atual */
    if (name && name !== user.name) {
      if (
        name.length <= 3 ||
        name === 'undefined' ||
        name === null ||
        name.length >= 32
      ) {
        return res.status(400).json({
          error:
            'O campo nome não pode ser vazio ou nulo, precisa mínimo de 3 caracteres e máximo de 32 caracteres',
        });
      }
    }

    /* se ele quiser alterar eu preciso ver se esse email já nao existe
    para um outro usuário em minha base de dados. Mas eu só vou analisar
    se caso ele tentar trocar */
    if (email && email !== user.email) {
      const checkEmailExists = await User.findOne({ where: { email } });

      if (checkEmailExists) {
        return res
          .status(400)
          .json({ error: 'O e-mail informado já está sendo utilizado!' });
      }
    }

    /* se ele quiser alterar a senha, precisa informar a antiga e além disso
    eu só vou analisar se ele preencher esse campo */
    if (oldPassword) {
      if (!(await compare(oldPassword, user.password_hash))) {
        return res
          .status(400)
          .json({ error: 'A senha digitada é diferente da sua senha atual!' });
      }

      if (!(password === confirmPassword)) {
        return res
          .status(400)
          .json({ error: 'A nova senha e sua confirmação são diferentes!' });
      }

      if (password.length < 6 || password.length > 32) {
        return res.status(400).json({
          error:
            'A nova senha precisa mínimo de 3 e suporta máximo de 32 caracteres!',
        });
      }
    }

    if (avatar_id && avatar_id !== user.avatar_id) {
      // preciso garantir que esse numero existe na tabela de files
      const checkIdFileExists = await File.findByPk(avatar_id);
      if (!checkIdFileExists) {
        return res.status(400).json({
          error: 'O ID informado para esse arquivo Avatar não existe!',
        });
      }
    }

    /* se ele chegou até aqui eu posso atualizar o usuário dele */
    await user.update(req.body);

    const { id, name: newName, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({
      id,
      name: newName,
      email,
      avatar,
    });
  }
}

export default new UserController();
