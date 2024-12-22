
/*
    Rutas de usuarios
    host + /api/excel
*/

const {Router}=require('express')
const {check}=require('express-validator')
const { validarCampos } = require('../middlewares/validar-campos');
const { crearCedula, crearRegistro, crearComuniActa, crearFactibilidad, crearInversion } = require('../controllers/excel');

const router=Router();

router.post('/cedula',crearCedula)

router.post('/solicitud',crearRegistro)

router.post('/comunidad',crearComuniActa)

router.post('/factibi',crearFactibilidad)

router.post('/inversion',crearInversion)


module.exports=router;