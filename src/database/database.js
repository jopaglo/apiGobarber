require('dotenv/config');

module.exports = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true, // vou ter uma coluna com data de criacao e edicao do registro
    underscored: true,
    underscoredAll: true,
  },
};
/* vou ter uma coluna com data de criacao e edicao do registro/
padronizacao na tratativa do banco de dados conforme padrao underscore */
