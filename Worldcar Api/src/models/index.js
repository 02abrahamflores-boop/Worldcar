import Account from './accounts.models.js';
import Role from './roles.models.js';

Account.belongsTo(Role, {
  foreignKey: { name: 'roleId', allowNull: false },
  as: 'role',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

Role.hasMany(Account, {
  foreignKey: { name: 'roleId', allowNull: false },
  as: 'accounts',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

export { Account, Role };
