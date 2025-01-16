/*
    Rutas de periodos
    host + /api/periody
*/

const {Router}=require('express')
const {check, body}=require('express-validator');
const { buscarPeriodo, crearPeriodo, obtenerPeriodos, obtenerFaltante, actualizarPresu } = require('../controllers/periodo');
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

router.get('/faltante',obtenerFaltante)

router.put('/actualizapresu',[
body('presupuestos.*.monto_inici')
    .notEmpty() // Asegura que el campo no esté vacío
    .withMessage('El monto_inici no puede estar vacío.')
    .isFloat() // Verifica que sea un número flotante
    .withMessage('Cada monto_inici debe ser un número flotante.')
    .custom(value => !isNaN(value)) // Verifica que el valor no sea NaN
    .withMessage('El monto_inici debe ser un valor numérico válido.'),
     validarCampos
], actualizarPresu)

module.exports=router;