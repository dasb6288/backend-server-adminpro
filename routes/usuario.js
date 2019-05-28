var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var middlewareAuth = require('../middlewares/auth');

var app = express();
// Importar modelo de usuario
var Usuario = require('../models/usuario');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {
    Usuario.find({}, 'nombre email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                usuarios: usuarios
            })
        })
});

// Actualizar usuario
app.put('/:id', middlewareAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            })
        }
        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con el id: ' + id,
                errors: { message: 'No existe un usuario con ese id ' }
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                })
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: req.usuario
            })
        });
    });
});

// Crear un usuario
app.post('/', middlewareAuth.verificaToken, (req, res, next) => {
    var body = req.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });
    usuario.save((err, usuarioGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })
    });
});

// Borrar usuario
app.delete('/:id', middlewareAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            })
        }
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el usuario con el id: ' + id,
                errors: { message: 'No existe un usuario con ese id ' }
            })
        }

        res.status(200).json({
            ok: false,
            usuario: usuarioBorrado,
            usuarioToken: req.usuario
        })
    });
});

module.exports = app;