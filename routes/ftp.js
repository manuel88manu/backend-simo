
/*
    Rutas de usuarios
    host + /api/ftp
*/

const {Router}=require('express')
const {check}=require('express-validator')
const multer = require("multer");
const { subirArchivo, testConnection, guardarEnlace, descagarEnlace, descargarEnlace } = require('../controllers/ftp');
const upload = require('../middlewares/multer-middle');
const router=Router();

router.post('/upload',upload.single('file'), subirArchivo);

router.post('/enlace',guardarEnlace)

router.get('/downenlace', descargarEnlace)

 
module.exports=router;
