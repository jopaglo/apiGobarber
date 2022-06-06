// aqui vai ficar a parte de configuracao dos meus arquivos
import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
      // ele recebe um erro ou um sucesso error / res
      crypto.randomBytes(16, (error, res) => {
        if (error) {
          return cb(error);
        }
        // se nao deu erro, ai eu retorno null e monto o nome dela
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
