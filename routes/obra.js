/*
    Rutas de usuarios
    host + /api/obra
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt');
const { agregarObra, agregarConcepto, agregarPartida, actualizarPresupuesto, obtenerPartidasAgregadas, obtenerConceptos, actualizarConcepto, actualizarPartida, eliminarConcepto, eliminarPartida, eliminarObra, obtenerObrasTipoPresu, actualizarNumAproba, buscarObras } = require('../controllers/obra');
const { validarNuevaObra } = require('../middlewares/validar-nuevaobra.js');
const { validarNuevaObrayDicatamen } = require('../middlewares/validar-nuevaobra.js');



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

router.put(
    '/updateConcep',[
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
    ],actualizarConcepto
)

router.put(
    '/updatepartida' ,[
        check('partida.nombre_par')
        .trim() // Elimina espacios al principio y al final
        .notEmpty().withMessage('El nombre es obligatorio') // Verifica que no esté vacío después de eliminar espacios
        .isString().withMessage('El nombre debe ser un texto'),
        validarCampos
    ],actualizarPartida
)

router.delete(
    '/deleteconcep/:idconcepto',eliminarConcepto
)

router.delete(
    '/deletepartida/:idpartida',eliminarPartida
)

router.delete(
    '/deleteobra/:idobra',eliminarObra
)

router.get(
    '/getObrasPresu',obtenerObrasTipoPresu
)
router.put(
    '/updatenumaproba',[
        check('idobra')
        .trim() // Elimina espacios al principio y al final
        .notEmpty().withMessage('El idobra es obligatorio'),
        check('num_aproba.codigo')
        .trim() // Elimina espacios al principio y al final
        .notEmpty().withMessage('El numero de aprobacion es obligatorio')
        .isString().withMessage('El numero de aprobacion debe ser un texto'),
        check('num_aproba.fecha')
            .notEmpty().withMessage('La fecha de aprobacion obligatoria')
            .isISO8601().withMessage('La fecha de aprobacion debe estar en formato válido'),
        validarCampos
    ],actualizarNumAproba
)

router.get(
    '/shareobras',buscarObras
)

module.exports=router;