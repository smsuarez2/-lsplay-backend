const express = require('express');
const router = express.Router();
const { registro, login, getUsuarios, getUsuarioById, updateUsuario, deleteUsuario } = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middleware/auth');

// Rutas públicas (no requieren token)
router.post('/registro', registro);
router.post('/login', login);

// Rutas privadas (requieren token)
router.get('/', verificarToken, soloAdmin, getUsuarios);
router.get('/:id', verificarToken, getUsuarioById);
router.put('/:id', verificarToken, updateUsuario);
router.delete('/:id', verificarToken, soloAdmin, deleteUsuario);

module.exports = router;
