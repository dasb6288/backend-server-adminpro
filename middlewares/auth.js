var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// MiddleWare: Verificar Token
exports.verificaToken = function (req, res, next) {
    var token = req.query.token; // por URL

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            })
        }
        req.usuario = decoded.usuario;
        next();
    });
}
