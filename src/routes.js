import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
// import multerBannerConfig from './config/multerBanner';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import ScheduleController from './app/controllers/ScheduleController';
import PlannerController from './app/controllers/PlannerController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);
// const uploadBanner = multer(multerBannerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('avatar'), FileController.store);

routes.get('/meetups', PlannerController.index);

routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

routes.get('/schedule', ScheduleController.index);

// routes.post('/banners', uploadBanner.single('file'), (req, res) => {
//     return res.json({ ok: true });
// });

export default routes;
