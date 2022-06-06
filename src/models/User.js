import Sequelize, { Model } from 'sequelize';
import { hash } from 'bcryptjs';

import File from './File';

class User extends Model {
  static init(sequelize) {
    super.init(
      // super é a classe pai que estamos chamando
      // vamos trabalhar apenas com as colunas necessárias
      /* o primeiro parametro desse objeto é as coluns do banco
      e o segundo é a conexao do sequelize para gerir esse modelo */
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    // criando um hook de hash de senha automatico sempre salvar o user
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await hash(user.password, 8);
      }
    });
    return this;
  }

  static relationships() {
    User.belongsTo(File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}

export default User;
