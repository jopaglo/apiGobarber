import Sequelize, { Model } from 'sequelize';
class Files extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        // vou deixar pronto para o front end acessar a imagem via URL
        /* no meu server, eu preciso usar um metodo static para ser acessado
        diretamente pelo navegador */
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default Files;
