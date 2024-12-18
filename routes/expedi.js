
/*
    Rutas de usuarios
    host + /api/expedi
*/


const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const { validarCampos } = require('../middlewares/validar-campos');
const { agregarExpedi } = require('../controllers/expedi');

router.post('/agregarexp',agregarExpedi)



module.exports=router;