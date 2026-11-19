import { ForeignKeyConstraintError, UniqueConstraintError, ValidationError } from 'sequelize';
import { Account, Role } from '../models/index.js';
import { sendEmail } from '../general/SendMail.js';

const publicAccount = (account) => {
  const data = account.toJSON();
  delete data.password;
  return data;
};

const isValidEmail = (email) =>
  typeof email === 'string' &&
  email.length <= 180 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidPerson = (person) =>
  person !== null && typeof person === 'object' && !Array.isArray(person);

const getPositiveInteger = (value) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
};

const handleError = (res, error) => {
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
  }

  if (error instanceof ForeignKeyConstraintError) {
    return res.status(400).json({ message: 'El rol indicado no existe.' });
  }

  if (error instanceof ValidationError) {
    return res.status(400).json({ message: error.message });
  }

  console.error('Error al procesar la cuenta:', error);
  return res.status(500).json({ message: 'Error interno al procesar la cuenta.' });
};

export const register = async (req, res) => {
  const { email, password, username, person } = req.body ?? {};
  const roleId = getPositiveInteger(req.body?.roleId);

  if (
    !isValidEmail(email) ||
    typeof password !== 'string' ||
    !password.trim() ||
    typeof username !== 'string' ||
    !username.trim() ||
    username.trim().length > 15 ||
    !isValidPerson(person) ||
    roleId === null
  ) {
    return res.status(400).json({
      message: 'Se requieren email válido, password, username (máximo 15 caracteres), person y roleId válido.',
    });
  }

  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'El rol indicado no existe.' });
    }

    const account = await Account.create({
      email: email.trim(),
      password,
      username: username.trim(),
      person,
      roleId,
    });

    try {
      await sendEmail({
        to: account.email,
        subject: 'Registro exitoso',
        text: 'Tu registro se ha realizado con éxito.',
      });
    } catch (error) {
      console.error('La cuenta se registró, pero no se pudo enviar el correo:', error);
      return res.status(201).json({
        message: 'Registro exitoso, pero no se pudo enviar el correo de confirmación.',
        emailSent: false,
        account: publicAccount(account),
      });
    }

    return res.status(201).json({
      message: 'Registro exitoso. Se envió un correo de confirmación.',
      emailSent: true,
      account: publicAccount(account),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const getList = async (_req, res) => {
  try {
    const accounts = await Account.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']],
    });
    return res.status(200).json(accounts);
  } catch (error) {
    return handleError(res, error);
  }
};

export const update = async (req, res) => {
  const accountId = getPositiveInteger(req.params?.id);
  if (accountId === null) {
    return res.status(400).json({ message: 'El id de la cuenta no es válido.' });
  }

  const body = req.body ?? {};
  const updates = {};

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    if (!isValidEmail(body.email)) {
      return res.status(400).json({ message: 'El correo no es válido.' });
    }
    updates.email = body.email.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'username')) {
    if (
      typeof body.username !== 'string' ||
      !body.username.trim() ||
      body.username.trim().length > 15
    ) {
      return res.status(400).json({ message: 'El username es obligatorio y debe tener máximo 15 caracteres.' });
    }
    updates.username = body.username.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'password')) {
    if (typeof body.password !== 'string' || !body.password.trim()) {
      return res.status(400).json({ message: 'El password no es válido.' });
    }
    updates.password = body.password;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'person')) {
    if (!isValidPerson(body.person)) {
      return res.status(400).json({ message: 'El campo person debe ser un objeto.' });
    }
    updates.person = body.person;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'roleId')) {
    const roleId = getPositiveInteger(body.roleId);
    if (roleId === null) {
      return res.status(400).json({ message: 'El roleId no es válido.' });
    }
    updates.roleId = roleId;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Indica al menos un campo válido para actualizar.' });
  }

  try {
    if (updates.roleId && !(await Role.findByPk(updates.roleId))) {
      return res.status(400).json({ message: 'El rol indicado no existe.' });
    }

    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'No se encontró la cuenta.' });
    }

    await account.update(updates);
    return res.status(200).json({
      message: 'Cuenta actualizada correctamente.',
      account: publicAccount(account),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const activate = async (req, res) => {
  const accountId = getPositiveInteger(req.params?.id);
  if (accountId === null) {
    return res.status(400).json({ message: 'El id de la cuenta no es válido.' });
  }

  try {
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'No se encontró la cuenta.' });
    }

    await account.update({ isActived: true });
    return res.status(200).json({
      message: 'Cuenta activada correctamente.',
      account: publicAccount(account),
    });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteAccount = async (req, res) => {
  const accountId = getPositiveInteger(req.params?.id);
  if (accountId === null) {
    return res.status(400).json({ message: 'El id de la cuenta no es válido.' });
  }

  try {
    const account = await Account.findByPk(accountId);
    if (!account) {
      return res.status(404).json({ message: 'No se encontró la cuenta.' });
    }

    await account.destroy();
    return res.status(200).json({ message: 'Cuenta eliminada correctamente.' });
  } catch (error) {
    return handleError(res, error);
  }
};