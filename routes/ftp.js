
/*
    Rutas de usuarios
    host + /api/ftp
*/

const {Router}=require('express')
const {check}=require('express-validator')
const multer = require("multer");
const { subirArchivo, testConnection, guardarEnlace } = require('../controllers/ftp');
const upload = require('../middlewares/multer-middle');
const router=Router();

router.post('/upload',upload.single('file'), subirArchivo);

router.post('/enlace',guardarEnlace)

 
module.exports=router;
