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

const agregarPartida=async (req, res = express.response) => {

    try {

        const {obra_idobra,nombre_par}=req.body;

        const ValidarObra=`select * from obra where idobra=?`;

        const resuObraExiste= await ejecutarConsulta(ValidarObra,[obra_idobra])

        if (resuObraExiste.length===0){
            return res.status(401).json({
                ok: false,
                msg: 'La obra relacionada no existe',
            });
        }

        const partidaExiste=`select * from partida where nombre_par = ?`
        const resuPartidaExiste= await ejecutarConsulta(partidaExiste,[nombre_par])

        if(resuPartidaExiste.length>0){
            return res.status(401).json({
                ok: false,
                msg: 'La partida que se desea ingresar ya existe',
            });
        }

        const insertarPartida=`insert into partida (obra_idobra,nombre_par) values
                                (?,?)`;
        const resulConcepto= await ejecutarConsulta(insertarPartida,[obra_idobra,nombre_par])

          return res.status(200).json({
            ok: true,
            msg: 'partida agregada con exito',
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

const agregarConcepto=async (req, res = express.response) => {
    try {
        
        const {partida_idpartida,concepto} = req.body;

        const partidaExist=`select * from partida where idpartida=?`
        const resultPartida= await ejecutarConsulta(partidaExist,[partida_idpartida])

        if(resultPartida.length===0){
            return res.status(401).json({
                ok: false,
                msg: 'La partida que se quiere relacionar no existe',
            });

        }

        const conceptoExiste=`select * from concepto where nombre_conc=?`
        const resultConcepto= await ejecutarConsulta(conceptoExiste,[concepto.nombre_conc])

        if(resultConcepto.length>0){
            return res.status(401).json({
                ok: false,
                msg: 'El concepto que se quiere agregar ya existe',
            });
        }
        
        const ingresarConcepto=`insert into concepto (nombre_conc,unidad,cantidad,p_unitario,partida_idpartida)
                                values
                                (?,?,?,?,?)`
        const resultIngresar= await ejecutarConsulta(ingresarConcepto,[
                            concepto.nombre_conc,
                            concepto.unidad,
                            concepto.cantidad,
                            concepto.p_unitario,
                            partida_idpartida])

        const obtenerMonto=`UPDATE concepto
                           SET monto = cantidad * p_unitario
                           WHERE idconcepto = ?;`

        await ejecutarConsulta(obtenerMonto,[resultIngresar.insertId])

        const obtenerMontoPartida= `UPDATE partida p
                                    SET monto_tot = (
                                         SELECT SUM(c.monto)
                                         FROM concepto c
                                         WHERE c.partida_idpartida = p.idpartida
                                        )
                                    WHERE p.idpartida = ?`
        
        await ejecutarConsulta (obtenerMontoPartida,[partida_idpartida])

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
    agregarObra,agregarPartida,agregarConcepto
};
