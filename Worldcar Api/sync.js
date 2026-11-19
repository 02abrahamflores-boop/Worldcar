import sequelize from './src/config/database.js';
import './src/models/index.js';

try {
  await sequelize.sync({ alter: true });
  console.log('Modelos sincronizados con la base de datos.');
} catch (error) {
  console.error('No se pudieron sincronizar los modelos:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}