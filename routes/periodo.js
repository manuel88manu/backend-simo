const {Router}=require('express')
const {check}=require('express-validator');
const { buscarPeriodo, crearPeriodo } = require('../controllers/periodo');
const router=Router();

router.get('/periodo',buscarPeriodo)
router.post('/newper',crearPeriodo)

module.exports=router;