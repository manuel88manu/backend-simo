const express = require('express');
const { ejecutarConsulta } = require('../database/config');


const agregarExpedi=async(req,res=express.response)=>{
 try {

    const {expediente,obra_idobra}= req.body

    const obraexist= await ejecutarConsulta(`select * from obra where idobra=?`,[obra_idobra])

    if(obraexist.length===0){
        return res.status(401).json({
            ok: false,
            msg:`La obra no existe en la base de datos`
        });
    }

    expediente.obra_idobra=obra_idobra

    const columnasExpe=Object.keys(expediente);
    const valoresExpe=Object.values(expediente);

    const columnasExpeString = columnasExpe.join(', ');
    const placeholdersExpe = columnasExpe.map(() => '?').join(', ');

    const insertarExpeQuery = `INSERT INTO expediente (${columnasExpeString}) VALUES (${placeholdersExpe})`;

    const resultadoExpedi = await ejecutarConsulta(insertarExpeQuery, valoresExpe);

    const expeId=resultadoExpedi.insertId;

    const expeResult= await ejecutarConsulta(`select * from expediente where idexpediente=?`,[expeId])

    const expedienteEnc=expeResult[0]


    return res.status(200).json({
        ok: true,
        msg:'Todo Bien',
        expediente:expedienteEnc
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
    agregarExpedi
}