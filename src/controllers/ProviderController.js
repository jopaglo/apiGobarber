import User from '../models/User';
import File from '../models/File';
class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true }, // somente prestadores
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
        },
      ],
    });
    return res.json(providers);
  }
}

export default new ProviderController();
