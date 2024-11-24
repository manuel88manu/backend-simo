/*
    Rutas de periodos
    host + /api/periody
*/

const {Router}=require('express')
const {check, body}=require('express-validator');
const { buscarPeriodo, crearPeriodo, obtenerPeriodos } = require('../controllers/periodo');
const { validarCampos } = require('../middlewares/validar-campos');
const router=Router();

router.get('/periodo',buscarPeriodo)
router.post('/newper',[
    // Validar que presupuestos sea un array
    check('presupuestos')
        .isArray()
        .withMessage('El campo presupuestos debe ser un array.'),
    // Validar que haya exactamente 5 objetos
    check('presupuestos')
        .custom((value) => value.length === 5)
        .withMessage('Debe enviar exactamente 5 presupuestos.'),
    // Validar cada objeto dentro del array
    body('presupuestos.*.monto_inici')
        .isFloat()
        .withMessage('Cada monto_inici debe ser un número flotante.'),
        validarCampos
],crearPeriodo)

router.get('/presupuestos',obtenerPeriodos)

module.exports=router;