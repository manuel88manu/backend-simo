/*
    Rutas de usuarios
    host + /api/obra
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt');
const { agregarObra, agregarConcepto, agregarPartida, actualizarPresupuesto, obtenerPartidasAgregadas } = require('../controllers/obra');
const { validarNuevaObra } = require('../middlewares/validar-nuevaobra-js');
const { validarNuevaObrayDicatamen } = require('../middlewares/validar-nuevaobra-js');



router.post(
    '/newobra',[
        validarNuevaObrayDicatamen,
        validarCampos
    ],agregarObra

)

router.post(
    '/newpartida',agregarPartida

)

router.post(
    '/newconcepto',agregarConcepto
)

router.put(
    '/updatapresu/:idobra',actualizarPresupuesto
)

router.get(
    '/addpartidas',obtenerPartidasAgregadas
)

module.exports=router;