import express from 'express';
import { getAchievements, getAchievement, createAchievement, updateAchievement, deleteAchievement, verifyAchievement } from '../controllers/achievementController.jsx';
import { protect, authorize } from '../middleware/auth.jsx';
import { uploadAchievementEvidence } from '../middleware/upload.jsx';

const router = express.Router();

router.get('/', protect, getAchievements);
router.post('/', protect, uploadAchievementEvidence.single('evidence'), createAchievement);
router.put('/:id/verify', protect, authorize('admin'), verifyAchievement);
router.get('/:id', protect, getAchievement);
router.put('/:id', protect, uploadAchievementEvidence.single('evidence'), updateAchievement);
router.delete('/:id', protect, deleteAchievement);

export default router;
