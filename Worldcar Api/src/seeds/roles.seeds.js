import { Op } from 'sequelize';
import { Role } from '../models/index.js';

const roles = [
  {
    name: 'Admin',
    description: 'Administrador del sistema',
    menu: [],
    isActived: true,
  },
  {
    name: 'vendedor',
    description: 'Vendedor',
    menu: [],
    isActived: true,
  },
  {
    name: 'cliente',
    description: 'Cliente',
    menu: [],
    isActived: true,
  },
];

const seedRoles = async () => {
  for (const role of roles) {
    await Role.findOrCreate({
      where: { name: role.name },
      defaults: role,
    });
  }
};

export const undoRoles = async () =>
  Role.destroy({
    where: {
      name: { [Op.in]: roles.map(({ name }) => name) },
    },
  });

export default seedRoles;
