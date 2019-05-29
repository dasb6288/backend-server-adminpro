var express = require('express');
var middlewareAuth = require('../middlewares/auth');

var app = express();
// Importar modelo de hospital
var Hospital = require('../models/hospital');

// Obtener todos los hospitales
app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                })
            }

            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    total: conteo,
                    hospitales: hospitales
                })
            });
        });
});

// Actualizar hospital
app.put('/:id', middlewareAuth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con el id: ' + id,
                errors: { message: 'No existe un hospital con ese id ' }
            })
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })
        });
    });
});

// Crear hospital
app.post('/', middlewareAuth.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })
    });
});

// Borrar hospital
app.delete('/:id', middlewareAuth.verificaToken, (req, res, next) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe el hospital con el id: ' + id,
                errors: { message: 'No existe un hospital con ese id ' }
            })
        }

        res.status(200).json({
            ok: false,
            hospital: hospitalBorrado
        })
    });
});


module.exports = app;