const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// POST /api/usuarios/registro
async function registro(req, res) {
  const { nombre, correo, contrasena } = req.body;

  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si el correo ya existe
    const existe = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado.' });
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);

    // Insertar usuario
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
      [nombre, correo, hash, 'usuario']
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente.',
      usuario: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

// POST /api/usuarios/login
async function login(req, res) {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = result.rows[0];
    const passwordValida = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        xp: usuario.xp,
        nivel: usuario.nivel
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

// GET /api/usuarios — solo admin
async function getUsuarios(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol, xp, nivel, created_at FROM usuarios ORDER BY id'
    );
    res.json({ usuarios: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

// GET /api/usuarios/:id
async function getUsuarioById(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, correo, rol, xp, nivel, created_at FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

// PUT /api/usuarios/:id
async function updateUsuario(req, res) {
  const { id } = req.params;
  const { nombre, xp, nivel } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre = $1, xp = $2, nivel = $3 WHERE id = $4 RETURNING id, nombre, correo, rol, xp, nivel',
      [nombre, xp, nivel, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ mensaje: 'Usuario actualizado.', usuario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

// DELETE /api/usuarios/:id — solo admin
async function deleteUsuario(req, res) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error en el servidor: ' + err.message });
  }
}

module.exports = { registro, login, getUsuarios, getUsuarioById, updateUsuario, deleteUsuario };
