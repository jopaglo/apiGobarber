import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import databaseConfig from './database';
import 'dotenv/config';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';

const models = [User, File, Appointment];
class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map((model) => model.init(this.connection))
      .map(
        (model) =>
          model.relationships && model.relationships(this.connection.models)
      );
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
