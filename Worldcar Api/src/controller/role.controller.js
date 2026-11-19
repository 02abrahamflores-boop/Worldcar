import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Role } from '../models/index.js';

const getPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

const isValidName = (name) =>
  typeof name === 'string' && name.trim().length > 0 && name.trim().length <= 30;

const isValidMenu = (menu) => menu !== null && typeof menu === 'object';

const handleError = (res, error) => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Ya existe un rol con ese nombre.' });
  }

  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({ message: 'No se puede eliminar un rol que está asignado a cuentas.' });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  console.error('Error al procesar el rol:', error);
  return res.status(500).json({ message: 'Error interno al procesar el rol.' });
};

export const createRole = async (req, res) => {
  const { name, description = null, menu } = req.body ?? {};

  if (
    !isValidName(name) ||
    (description !== null &&
      (typeof description !== 'string' || description.trim().length > 100)) ||
    !isValidMenu(menu)
  ) {
    return res.status(400).json({
      message: 'Se requieren name (máximo 30 caracteres), description (máximo 100) y menu como objeto o arreglo.',
    });
  }

  try {
    const role = await Role.create({
      name: name.trim(),
      description: typeof description === 'string' ? description.trim() : null,
      menu,
    });
    return res.status(201).json({ message: 'Rol creado correctamente.', role });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getList = async (_req, res) => {
  try {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json(roles);
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateRole = async (req, res) => {
  const roleId = getPositiveInteger(req.params?.id);
  if (roleId === null) {
    return res.status(400).json({ message: 'El id del rol no es válido.' });
  }

  const body = req.body ?? {};
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'name')) {
    if (!isValidName(body.name)) {
      return res.status(400).json({ message: 'El nombre es obligatorio y debe tener máximo 30 caracteres.' });
    }
    updates.name = body.name.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'description')) {
    if (
      body.description !== null &&
      (typeof body.description !== 'string' || body.description.trim().length > 100)
    ) {
      return res.status(400).json({ message: 'La descripción debe tener máximo 100 caracteres o ser null.' });
    }
    updates.description = typeof body.description === 'string' ? body.description.trim() : null;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'menu')) {
    if (!isValidMenu(body.menu)) {
      return res.status(400).json({ message: 'El menu debe ser un objeto o arreglo.' });
    }
    updates.menu = body.menu;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Indica al menos un campo válido para actualizar.' });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'No se encontró el rol.' });
    }

    await role.update(updates);
    return res.status(200).json({ message: 'Rol actualizado correctamente.', role });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteRole = async (req, res) => {
  const roleId = getPositiveInteger(req.params?.id);
  if (roleId === null) {
    return res.status(400).json({ message: 'El id del rol no es válido.' });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'No se encontró el rol.' });
    }

    await role.destroy();
    return res.status(200).json({ message: 'Rol eliminado correctamente.' });
  } catch (error) {
    return handleError(res, error);
  }
};

const setRoleActiveState = async (req, res, isActived) => {
  const roleId = getPositiveInteger(req.params?.id);
  if (roleId === null) {
    return res.status(400).json({ message: 'El id del rol no es válido.' });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'No se encontró el rol.' });
    }

    await role.update({ isActived });
    const message = isActived ? 'Rol activado correctamente.' : 'Rol desactivado correctamente.';
    return res.status(200).json({ message, role });
  } catch (error) {
    return handleError(res, error);
  }
};

export const activateRole = (req, res) => setRoleActiveState(req, res, true);

export const deactivateRole = (req, res) => setRoleActiveState(req, res, false);
