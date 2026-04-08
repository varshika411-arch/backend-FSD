import express from 'express';
import { getEvents, getEvent, createEvent, updateEvent, deleteEvent, registerForEvent, unregisterFromEvent, getEventRegistrations } from '../controllers/eventController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';

const router = express.Router();

router.get('/', getEvents);
router.post('/', protect, authorize('admin'), createEvent);
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/unregister', protect, unregisterFromEvent);
router.get('/:id/registrations', protect, authorize('admin'), getEventRegistrations);
router.get('/:id', getEvent);
router.put('/:id', protect, authorize('admin'), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router;
