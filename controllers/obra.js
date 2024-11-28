const express = require('express');
const { ejecutarConsulta } = require('../database/config');

const agregarObra = async (req, res = express.response) => {
    try {
        const { Presupuesto_idPresupuesto, obra, dictamen } = req.body;

        // Verificar si el presupuesto existe
        const PresupuestoExiste = `SELECT * FROM presupuesto WHERE idpresupuesto = ?`;
        const resultadoPresupuesto = await ejecutarConsulta(PresupuestoExiste, [Presupuesto_idPresupuesto]);

        if (resultadoPresupuesto.length === 0) {
            return res.status(401).json({
                ok: false,
                msg: 'El presupuesto asignado no existe',
            });
        }

        // Validar si la obra ya existe con el mismo nombre y otros atributos
        const validacionObra = `SELECT * FROM obra WHERE nombre = ? AND bene_unidad = ? AND subprograma = ? AND programa = ?`;
        const valoresValidacion = [
            obra.nombre,
            obra.bene_unidad,
            obra.subprograma,
            obra.programa
        ];

        const resultadoObraExistente = await ejecutarConsulta(validacionObra, valoresValidacion);

        if (resultadoObraExistente.length > 0) {
            return res.status(400).json({
                ok: false,
                msg: 'La obra ya existe en la base de datos.',
            });
        }

        // Insertar la obra y obtener el ID generado
        const columnasObra = Object.keys(obra); // Obtener las columnas del objeto "obra"
        const valoresObra = Object.values(obra); // Obtener los valores del objeto "obra"

        // Añadir la columna y el valor del presupuesto a las listas
        columnasObra.push('Presupuesto_idPresupuesto');
        valoresObra.push(Presupuesto_idPresupuesto);

        // Crear la consulta SQL para insertar la obra
        const columnasObraString = columnasObra.join(', ');
        const placeholdersObra = columnasObra.map(() => '?').join(', ');
        const insertarObraQuery = `INSERT INTO obra (${columnasObraString}) VALUES (${placeholdersObra})`;

        // Ejecutar la consulta de inserción de la obra
        const resultadoObra = await ejecutarConsulta(insertarObraQuery, valoresObra);

        // Obtener el ID de la obra recién insertada (suponiendo que es un campo autoincremental)
        const obraId = resultadoObra.insertId;

        // Validar que dictamen no sea null ni undefined
        if (!dictamen || typeof dictamen !== 'object') {
            return res.status(400).json({
                ok: false,
                msg: 'El objeto dictamen es inválido o no se ha proporcionado.',
            });
        }

        // Insertar el dictamen en la tabla dictamen
        const columnasDictamen = Object.keys(dictamen); // Obtener las columnas del objeto "dictamen"
        const valoresDictamen = Object.values(dictamen); // Obtener los valores del objeto "dictamen"

        // Crear la consulta SQL para insertar el dictamen
        const columnasDictamenString = columnasDictamen.join(', ');
        const placeholdersDictamen = columnasDictamen.map(() => '?').join(', ');
        const insertarDictamenQuery = `INSERT INTO dictamen (${columnasDictamenString}) VALUES (${placeholdersDictamen})`;

        // Ejecutar la consulta de inserción del dictamen
        const resultadoDictamen = await ejecutarConsulta(insertarDictamenQuery, valoresDictamen);

        // Obtener el ID del dictamen recién insertado
        const dictamenId = resultadoDictamen.insertId;

        // Actualizar la obra con el ID del dictamen
        const actualizarObraQuery = `UPDATE obra SET dictamen_iddictamen = ? WHERE idobra = ?`;
        await ejecutarConsulta(actualizarObraQuery, [dictamenId, obraId]);

        return res.status(200).json({
            ok: true,
            msg: 'Obra y dictamen creados exitosamente',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Algo salió mal.',
            error: error.message,
        });
    }
};


const agregarConcepto=async (req, res = express.response) => {

    try {

        const {obra_idobra,nombre_conc}=req.body;

        const ValidarObra=`select * from obra where idobra=?`;

        const resuObraExiste= await ejecutarConsulta(ValidarObra,[obra_idobra])

        if (resuObraExiste.length===0){
            return res.status(401).json({
                ok: false,
                msg: 'La obra relacionada no existe',
            });
        }

        const conceptoExiste=`select * from concepto where nombre_conc = ?`
        const resuConceptoExiste= await ejecutarConsulta(conceptoExiste,[nombre_conc])

        if(resuConceptoExiste.length>0){
            return res.status(401).json({
                ok: false,
                msg: 'El concepto que se desea ingresar ya existe',
            });
        }

        const insertarConcepto=`insert into concepto (obra_idobra,nombre_conc) values
                                (?,?)`;
        const resulConcepto= await ejecutarConsulta(insertarConcepto,[obra_idobra,nombre_conc])

          return res.status(200).json({
            ok: true,
            msg: 'concepto agregado',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Algo salió mal.',
            error: error.message,
        });
    }
}

const agregarPartida=async (req, res = express.response) => {
    try {
        
        const {concepto_idconcepto,partida} = req.body;

        const conceptoExist=`select * from concepto where idconcepto=?`
        const resultConcepto= await ejecutarConsulta(conceptoExist,[concepto_idconcepto])

        if(resultConcepto.length===0){
            return res.status(401).json({
                ok: false,
                msg: 'El concepto que se quiere relacionar no existe',
            });

        }

        const partidaExiste=`select * from partida where nombre_par=?`
        const resultPartida= await ejecutarConsulta(partidaExiste,[partida.nombre_par])

        if(resultPartida.length>0){
            return res.status(401).json({
                ok: false,
                msg: 'La partida que se quiere agregar ya existe',
            });
        }
        
        const ingresarPartida=`insert into partida (nombre_par,unidad,cantidad,p_unitario,concepto_idconcepto)
                                values
                                (?,?,?,?,?)`
        const resultIngresar= await ejecutarConsulta(ingresarPartida,[
                            partida.nombre_par,
                            partida.unidad,
                            partida.cantidad,
                            partida.p_unitario,
                            concepto_idconcepto])
        const obtenerMonto=`UPDATE partida
                           SET monto = cantidad * p_unitario
                           WHERE idpartida = ?;`

        await ejecutarConsulta(obtenerMonto,[resultIngresar.insertId])

        const obtenerMontoConcepto= `UPDATE concepto c
                                    SET monto_tot = (
                                         SELECT SUM(p.monto)
                                         FROM partida p
                                         WHERE p.concepto_idconcepto = c.idconcepto
                                        )
                                    WHERE c.idconcepto = ?`
        
        await ejecutarConsulta (obtenerMontoConcepto,[concepto_idconcepto])

        return res.status(200).json({
            ok: true,
            msg: 'partida agregada',
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Algo salió mal.',
            error: error.message,
        });
    }

}
module.exports = {
    agregarObra,agregarConcepto,agregarPartida
};
