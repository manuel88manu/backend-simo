const { response } = require('express');
const { validationResult } = require('express-validator');

const validarCampos = (req, res = response, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        // Mapear los errores a solo sus mensajes y unirlos en un solo string, separado por un salto de línea
        const errorMessages = Object.values(errors.mapped()).map(err => err.msg).join(', ');  // Usando coma para separar

        return res.status(400).json({
            ok: false,
            msg: errorMessages  // Un solo string con todos los errores
        });
    }

    next();
};

module.exports = {
    validarCampos
};
