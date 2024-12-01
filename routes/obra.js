/*
    Rutas de usuarios
    host + /api/obra
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt');
const { agregarObra, agregarConcepto, agregarPartida, actualizarPresupuesto } = require('../controllers/obra');



router.post(
    '/newobra',agregarObra

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


module.exports=router;