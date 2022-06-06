import User from '../models/User';
import Notification from '../schemas/Notification';
class NotificationController {
  async index(req, res) {
    const checkIsProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsProvider) {
      return res.status(401).json({
        error: 'O usuário não é um prestador par visualizar as notificacoes',
      });
    }

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(15);

    return res.json(notifications);
  }

  // vou marcar se a notificacao foi lida ou nao.
  async update(req, res) {
    // primeiramente eu preciso recuperar essa notificacao
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
      /* assim que eu atualizar ele vai retornar a nova notificacao
      para que eu posso listar ela para o usuario */
    );

    return res.json(notification);
  }
}

export default new NotificationController();
