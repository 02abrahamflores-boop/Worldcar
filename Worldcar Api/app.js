import 'dotenv/config';
import express from 'express';
import sequelize from './src/config/database.js';
import './src/models/index.js';
import accountsRoutes from './src/routes/accounts.routes.js';
import roleRoutes from './src/routes/role.route.js';

const app = express();
const port = Number(process.env.APP_PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('APP_PORT debe ser un puerto válido entre 1 y 65535.');
}

app.use(express.json());
app.use('/api/accounts', accountsRoutes);
app.use('/api/roles', roleRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'worldcar-api' });
});

const start = async () => {
  await sequelize.authenticate();
  console.log('Conexión a PostgreSQL establecida');

  app.listen(port, () => {
    console.log(`Worldcar API escuchando en el puerto ${port}`);
  });
};

start().catch((error) => {
  console.error('No se pudo iniciar la API:', error);
  process.exitCode = 1;
});

