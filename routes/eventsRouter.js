import { Router } from 'express';
import eventsController from '../controllers/eventsController.js';

const eventsRouter = Router();

// Render events page
eventsRouter.get('/', eventsController.getEvents);

// Render create event page
eventsRouter.get('/create', eventsController.getCreateEvent);

// Handle create event form submission
eventsRouter.post('/create', eventsController.postCreateEvent);

// Handle event search
eventsRouter.post('/search', eventsController.searchEvents);

// Render featured event
eventsRouter.get('/:id', eventsController.getEvent);

export default eventsRouter;