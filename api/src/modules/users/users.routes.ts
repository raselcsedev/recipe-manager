import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema, changePasswordSchema } from './users.schema';
import { getProfileHandler, updateProfileHandler, uploadAvatarHandler, changePasswordHandler } from './users.controller';
import { createUploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();
const upload = createUploadMiddleware('avatars');

router.use(requireAuth);
router.get('/me', getProfileHandler);
router.patch('/me', validate(updateProfileSchema), updateProfileHandler);
router.post('/me/avatar', upload.single('avatar'), uploadAvatarHandler);
router.patch('/change-password', validate(changePasswordSchema), changePasswordHandler);

export default router;
