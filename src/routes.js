import { Router } from 'express';
import multer from 'multer';
import multerAvatarConfig from './config/multerAvatar';
// import multerBannerConfig from './config/multerBanner';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const uploadAvatar = multer(multerAvatarConfig);
// const uploadBanner = multer(multerBannerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/avatars', uploadAvatar.single('avatar'), FileController.store);

routes.post('/meetups', MeetupController.store);

// routes.post('/banners', uploadBanner.single('file'), (req, res) => {
//     return res.json({ ok: true });
// });

export default routes;
