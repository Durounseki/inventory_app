import { Router } from 'express';
import indexController from '../controllers/indexController.js';

const indexRouter = Router();

// Render homepage
indexRouter.get('/', indexController.getHome);

export default indexRouter;