var express = require('express');
var middlewareAuth = require('../middlewares/auth');

var app = express();
// Importar modelo de medico
var Medico = require('../models/medico');

// Obtener todos los medicos
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                })
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos: medicos
                })
            });

        });
});

// Actualizar medico
app.put('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            })
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con el id: ' + id,
                errors: { message: 'No existe un medico con ese id ' }
            })
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })
        });
    });
});

// Crear medico
app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        })
    });
});

// Borrar medico
app.delete('/:id', middlewareAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            })
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el medico con el id: ' + id,
                errors: { message: 'No existe un medico con ese id ' }
            })
        }

        res.status(200).json({
            ok: false,
            medico: medicoBorrado
        })
    });
});


module.exports = app;