
/*
    Rutas de usuarios
    host + /api/auth
*/

const {Router}=require('express')
const {check}=require('express-validator')
const router=Router();
const {crearUsuario, loginUsuario, revalidarToken, getUsuarios}=require('../controllers/auth');
const { validarCampos } = require('../middlewares/validar-campos');
const {validarJWT}=require('../middlewares/validar-jwt')


router.post(
    '/new',
    [
      // Middlewares
      check('nombre', 'El nombre es obligatorio').not().isEmpty(),
      check('correo', 'El correo es obligatorio').not().isEmpty(),
      check('username', 'El username es obligatorio').not().isEmpty(),
      check('activo', 'El activo es obligatorio').not().isEmpty(),
      check('celular', 'El celular es obligatorio').not().isEmpty(),
      check('rol', 'El rol es obligatorio').not().isEmpty(),
      check('contraseña', 'La contraseña es obligatoria').not().isEmpty()
        .matches(/^(?=.*[A-Z])(?=.*\W).{8,}$/)
        .withMessage('La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un carácter especial. Los caracteres especiales permitidos son: !@#$%^&*()-_=+[]{}|;:\'",.<>?/'),
      validarCampos
    ],
    crearUsuario
  );
  
  

    router.post(
        '/',
        [//middlewares
             check('correo','El correo es obligatorio').not().isEmpty(),
             check('contraseña','La contraseña es obligatorio').not().isEmpty(),
             validarCampos
        ],
        loginUsuario)

router.get('/renew',validarJWT,revalidarToken)

router.get('/users',getUsuarios)
    


module.exports=router;