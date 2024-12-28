const express = require('express');
const bcrypt=require('bcryptjs')
const { ejecutarConsulta } = require('../database/config');
const{generarJWT}=require('../helpers/jwt');
const { getCurrentDateTime } = require('../helpers/funciones');

const crearUsuario = async (req, res = express.response) => {
    const { nombre, correo, username, activo, celular,rol,contraseña} = req.body;
    try {
        // Realizar la inserción
        const consulta='select * from usuario where correo=?'
        let resul= await ejecutarConsulta(consulta, [correo]); 

        if(resul.length>0){
            return res.status(400).json({
                msg: 'El usuario ya existe',
    
            });
        }
        //Encriptar contraseña
        const salt=bcrypt.genSaltSync();
        const contraEncrip= bcrypt.hashSync(contraseña,salt)

        //Insertar usuario
        const query = 'INSERT INTO usuario (nombre, correo, username, activo, celular,rol, contraseña) VALUES (?, ?, ?, ?, ?, ?,?)';
        const resultados = await ejecutarConsulta(query, [nombre, correo, username, activo, celular, rol, contraEncrip]);

        //Consulta para el JWT
        const consuJWT='select * from usuario where correo=?'
        const resulJWT= await ejecutarConsulta(consuJWT, [correo]);
        const usuario = resulJWT[0];
         //Generar JWT
         const token= await generarJWT(usuario.idusuario,usuario.nombre)
        

        res.json({
            mensaje: 'Usuario creado correctamente',
            id: resultados.insertId,
            token 
    
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Error al crear el usuario'});
    }

   
};

const loginUsuario = async (req, res = express.response) => {
    const {correo,contraseña} = req.body;
    try {
         // Validar
         const consulta='select * from usuario where correo=?'
         const resul= await ejecutarConsulta(consulta, [correo]); 
 
         if(resul.length===0){
             return res.status(400).json({
                 msg: 'El usuario no existe',
     
             });
         }

         // Confirmar contraseña
        const usuario = resul[0];
        if(usuario.activo===0){
            return res.status(400).json({
                msg: 'Este Usuario esta inactivo',
    
            });
         }

        const validPassword = bcrypt.compareSync(contraseña, usuario.contraseña);

        if(!validPassword){
            return res.status(400).json({
                msg: 'Contraseña incorecta',
    
            });

        }

        //Generar JWT
        const token= await generarJWT(usuario.idusuario,usuario.nombre)

        res.json({
            ok:true,
            uid:usuario.idusuario,
            name:usuario.nombre,
            rol:usuario.rol,
            token
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ msg: 'Crendiciales Incorrectas'});
    }
};

const revalidarToken = async (req, res = express.response) => {
    const uid=req.uid;
    const name=req.name;
    
    //generar token
    const token= await generarJWT(uid,name)

    res.json({
        ok:true,
        uid:uid,
        name:name,
        token

    })

};

const getUsuarios=async(req, res = express.response)=>{

    try {
          const consulta='SELECT * FROM usuario ORDER BY idusuario desc'
          let resul= await ejecutarConsulta(consulta); 

          res.json({
            ok:true,
            usuariosArr:resul
        })

    } catch (error) {
          res.status(400).json({
           ok:false,
           msg:'Error en busqueda de usuarios'
    })
    }

}

    const actualizarUsuario=async(req,res=express.response)=>{
        const { nombre, correo, username, activo, celular, rol } = req.body;
        const {id}=req.params;
        const{uid}=req
        try {
        
            if (String(uid) === id && activo === 0) {
                return res.status(404).json({
                    ok: false,
                    msg: 'El usuario en Sesion no puede darse de baja el mismo'
                });
            }
            
        const consulta= `UPDATE usuario
        SET 
           nombre = ?,
           correo = ?,
           username = ?,
           activo = ?,
           celular = ?,
           rol = ?
        WHERE idusuario = ?`;
      
        
        const resul= await ejecutarConsulta(consulta,[nombre, correo, username, activo, celular, rol, id]); 

        if (resul.affectedRows === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'El usuario con el ID especificado no existe'
            });
        }
           
           return res.status(200).json({
            ok: true,
            msg:'Se actualizo correctamente el usuario'
           })

        }  catch (error) {
            console.log(error)
           return res.status(400).json({
             ok:false,
             msg:'Error en actualizar usuario'
      })
      }

    }

 const agregarMovimiento=async(req,res=express.response)=>{
    try {
        const {idUsuario,accion,correo}=req.body

        const existeUser= await ejecutarConsulta(`select * from usuario where idusuario=?`,[idUsuario])
        if(existeUser.length===0){
            return res.status(401).json({
                ok: false,
                msg:`El usuario no existe en la base de datos`
            });
        }
        
        const fecha=getCurrentDateTime()
        await ejecutarConsulta(`insert into movimientos (usuario_idusuario,correo,accion,fecha) 
                              values(?,?,?,?)`,[idUsuario,correo,accion,fecha])

        return res.status(200).json({
            ok: true,
            msg:'Todo Bien',
           })
    } catch (error) {
        return res.status(400).json({
            ok:false,
            msg:'Error en actualizar usuario'
     })
    }
 }

 const obtenerMovimientoUsuario=async(req,res=express.response)=>{
    try {
        const {dia,año,correo}=req.query
        const movimientos= await ejecutarConsulta(`SELECT * 
                                                    FROM movimientos 
                                                    WHERE 
                                                        (correo = ? OR ? = '') 
                                                        AND (DATE(fecha) = ? OR ? IS NULL)  -- Cambié la verificación de cadena vacía a NULL
                                                        AND (YEAR(fecha) = ? OR ? IS NULL)  -- Cambié la verificación de cadena vacía a NULL
                                                    ORDER BY fecha DESC;`,
                                                [correo,correo,dia,dia,año,año])
        return res.status(200).json({
            ok: true,
            msg:'Todo Bien',
            movimientos
           })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            ok:false,
            msg:'Error en actualizar usuario'
     })
    }

 }

module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken,
    getUsuarios,
    actualizarUsuario,
    agregarMovimiento,
    obtenerMovimientoUsuario
};