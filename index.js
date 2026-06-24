const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usuarioRoutes = require('./src/routes/usuarioRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/usuarios', usuarioRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'LS Play Backend funcionando correctamente 🤟' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});