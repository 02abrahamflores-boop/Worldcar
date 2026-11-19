import { Router } from 'express';
import {
  activateRole,
  createRole,
  deactivateRole,
  deleteRole,
  getList,
  updateRole,
} from '../controller/role.controller.js';

const router = Router();

router.post('/', createRole);
router.get('/', getList);
router.put('/:id', updateRole);
router.patch('/:id/activate', activateRole);
router.patch('/:id/deactivate', deactivateRole);
router.delete('/:id', deleteRole);

export default router;