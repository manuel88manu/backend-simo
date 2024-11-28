/*
    Rutas de usuarios
    host + /api/obra
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt');
const { agregarObra, agregarConcepto, agregarPartida } = require('../controllers/obra');



router.post(
    '/newobra',agregarObra

)

router.post(
    '/newconcepto',agregarConcepto
)

router.post(
    '/newpartida',agregarPartida

)


module.exports=router;