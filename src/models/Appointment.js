import Sequelize, { Model } from 'sequelize';
import { isBefore, subHours } from 'date-fns';
import User from './User';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        /* vou passar informacoes adicionais para o meu frontend de forma visual */
        // caso a data já passou eu retorno para o front dessa forma, já pronta
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          },
        },
        /* aqui eu vou informar se está dentro do prazo de cancelamento,
        também ja vou enviar isso pronto para o frontend */
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static relationships() {
    Appointment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Appointment.belongsTo(User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
