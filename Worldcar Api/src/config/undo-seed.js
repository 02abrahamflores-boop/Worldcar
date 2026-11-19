import 'dotenv/config';
import sequelize from './database.js';
import { undoRoles } from '../seeds/roles.seeds.js';

try {
  await sequelize.authenticate();
  const deletedCount = await undoRoles();
  console.log(`Seeds deshechos correctamente. Roles eliminados: ${deletedCount}.`);
} catch (error) {
  console.error('No se pudieron deshacer los seeds:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
