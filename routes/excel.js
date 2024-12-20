
/*
    Rutas de usuarios
    host + /api/excel
*/

const {Router}=require('express')
const {check}=require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos');
const { crearCedula, crearRegistro } = require('../controllers/excel');

const router=Router();

router.post('/cedula',crearCedula)

router.post('/solicitud',crearRegistro)


module.exports=router;