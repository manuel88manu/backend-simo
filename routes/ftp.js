
/*
    Rutas de usuarios
    host + /api/ftp
*/

const {Router}=require('express')
const {check}=require('express-validator')
const multer = require("multer");
const { subirArchivo, testConnection } = require('../controllers/ftp');
const upload = require('../middlewares/multer-middle');
const router=Router();

router.post('/upload',upload.single('file'), subirArchivo);

router.post('/conexion',upload.single('file'),testConnection)

 
module.exports=router;
