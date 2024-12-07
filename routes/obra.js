/*
    Rutas de usuarios
    host + /api/obra
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt');
const { agregarObra, agregarConcepto, agregarPartida, actualizarPresupuesto, obtenerPartidasAgregadas, obtenerConceptos } = require('../controllers/obra');
const { validarNuevaObra } = require('../middlewares/validar-nuevaobra-js');
const { validarNuevaObrayDicatamen } = require('../middlewares/validar-nuevaobra-js');



router.post(
    '/newobra',[
        validarNuevaObrayDicatamen,
        validarCampos
    ],agregarObra

)

router.post(
    '/newpartida',[
     check('obra_idobra').notEmpty()
     .withMessage('El ID de obra es obligatorio'),  
     check('nombre_par')
        .trim() // Elimina espacios al principio y al final
        .notEmpty().withMessage('El nombre es obligatorio') // Verifica que no esté vacío después de eliminar espacios
        .isString().withMessage('El nombre debe ser un texto'),
        validarCampos
    ],agregarPartida

)

router.post(
    '/newconcepto',[
        check('partida_idpartida').notEmpty()
        .withMessage('El ID de partida es obligatorio'),
        check('concepto.nombre_conc')
        .trim() 
        .notEmpty().withMessage('El nombre es obligatorio') 
        .isString().withMessage('El nombre debe ser un texto'),
        check('concepto.unidad')
        .trim() 
        .notEmpty().withMessage('La unidad es obligatoria') 
        .isString().withMessage('La unidad debe ser un texto'),

        check('concepto.cantidad')
        .notEmpty().withMessage('La cantidad es obligatoria') 
        .isFloat({ min: 1 })
        .withMessage('La cantidad debe ser un número flotante mayor a 0'),

        check('concepto.p_unitario')
        .notEmpty().withMessage('El p.unitario es obligatorio') 
        .isFloat({ min: 1 })
        .withMessage('El p. unitario  debe ser un número flotante mayor a 0'),
        validarCampos

    ],agregarConcepto
)

router.put(
    '/updatapresu/:idobra',actualizarPresupuesto
)

router.get(
    '/addpartidas',obtenerPartidasAgregadas
)

router.get(
    '/addconceptos',obtenerConceptos
)
module.exports=router;