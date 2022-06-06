import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './controllers/UserController';
import SessionController from './controllers/SessionController';
import FileController from './controllers/FileController';
import ProviderController from './controllers/ProviderController';
import AppointmentController from './controllers/AppointmentController';
import ScheduleController from './controllers/ScheduleController';
import NotificationController from './controllers/NotificationController';
import AvailableController from './controllers/AvailableController';

// middleware de autenticacao
import authMiddleware from './middleware/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

/* a partir daqui tudo precisa autenticacao. Poderia colocar local tbm */
routes.use(authMiddleware);
routes.put('/users', UserController.update);

/* single porque eu vou enviar apenas 1 arquivo por vez, e o file
é o nome do campo que irá chegar */
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index); // listagem de prestadores
routes.get('/providers/:providerId/available', AvailableController.index);

routes.post('/appointments', AppointmentController.store);
routes.get('/appointments', AppointmentController.index);
routes.delete('/appointments/:id', AppointmentController.delete);
routes.get('/schedule', ScheduleController.index);
routes.get('/notifications', NotificationController.index); // listar todas as notificacoes
routes.put('/notifications/:id', NotificationController.update);

export default routes;
