import 'dotenv/config';
import sequelize from './database.js';
import seedRoles from '../seeds/roles.seeds.js';

try {
  await sequelize.authenticate();
  await seedRoles();
  console.log('Seeds ejecutados correctamente.');
} catch (error) {
  console.error('No se pudieron ejecutar los seeds:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}