import { Router } from 'express';
import {
  activate,
  deleteAccount,
  getList,
  register,
  update,
} from '../controller/accounts.controller.js';

const router = Router();

router.post('/', register);
router.get('/', getList);
router.put('/:id', update);
router.patch('/:id/activate', activate);
router.delete('/:id', deleteAccount);

export default router;
