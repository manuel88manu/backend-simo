const express = require('express');
const { ejecutarConsulta } = require('../database/config');


// Establecemos la fecha de inicio directamente en UTC para evitar conflictos con la zona horaria
//const fechaInicio = new Date('2024-01-01T00:00:00Z'); 

const buscarPeriodo = async (req, res = express.response) => {
    try {
        const fechaHoy = new Date();  // Usamos la fecha fija para la prueba
        const añoActual = fechaHoy.getUTCFullYear(); // Año actual (2024) usando getUTCFullYear()

        // Definir el rango de fechas para los dos posibles periodos en UTC
        const fechaInicioPeriodoActual = new Date(Date.UTC(añoActual, 0, 1)); // 1 de enero del año actual en UTC
        const fechaFinalPeriodoActual = new Date(Date.UTC(añoActual, 11, 31)); // 31 de diciembre del año actual en UTC

        // Establecemos las horas correctamente a las 00:00:00 y 23:59:59 (evitar cualquier confusión con la hora)
        fechaInicioPeriodoActual.setUTCHours(0, 0, 0, 0);
        fechaFinalPeriodoActual.setUTCHours(23, 59, 59, 999);


        // Consulta para buscar el periodo vigente según la fecha de hoy
        const consulta = `
            SELECT * 
            FROM periodo 
            WHERE 
            (fecha_inicial BETWEEN ? AND ?)
            AND fecha_final >= ?
        `;
        
        // Usamos la fecha de hoy en formato YYYY-MM-DD para la consulta
        const resultado = await ejecutarConsulta(
            consulta, 
            [
                fechaInicioPeriodoActual.toISOString().split('T')[0],  // 1 de enero del año actual
                fechaFinalPeriodoActual.toISOString().split('T')[0],   // 31 de diciembre del año actual
                fechaHoy.toISOString().split('T')[0]  // Fecha de hoy en formato YYYY-MM-DD
            ]
        );

        // Verificamos si encontramos un periodo
        if (resultado.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró un periodo vigente.',
            });
        }

        // Si encontramos un periodo, lo verificamos
        const periodo = resultado[0];  // Tomamos el primer resultado de la consulta
        const fechaFinalPeriodo = new Date(periodo.fecha_final); // Fecha de finalización del periodo

        // Comprobamos si el periodo está vencido o si está vigente
        if (fechaFinalPeriodo < fechaHoy) {
            return res.status(200).json({
                ok: true,
                msg: 'El periodo actual ha vencido.',
                periodoVencido: periodo,  // Devolvemos el periodo vencido
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'El periodo está vigente.',
            periodo: periodo, // Devolvemos el periodo vigente
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

const crearPeriodo = async (req, res = express.response) => {
    try {
        const { presupuestos } = req.body; // Obtenemos la fecha de inicio del cuerpo de la petición
        const fechaInicio = new Date(); // Obtener la fecha actual
        fechaInicio.setHours(0, 0, 0, 0); // Ajustar a las 00:00:00 de hoy

        // Verificar si la fecha de inicio es válida
        if (isNaN(fechaInicio)) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de inicio proporcionada no es válida.',
            });
        }

        // Validación de los presupuestos
        if (!Array.isArray(presupuestos) || presupuestos.length !== 5) {
            return res.status(400).json({
                ok: false,
                msg: 'Debe enviar exactamente 5 presupuestos.',
            });
        }

        const añoRegistro = fechaInicio.getFullYear(); // Año de la fecha actual

        // Fecha final: 31 de diciembre del mismo año
        const fechaFinalActual = new Date(Date.UTC(añoRegistro, 11, 31));  // 31 de diciembre del año actual
        fechaFinalActual.setUTCHours(23, 59, 59, 999); // Ajustar la fecha a las 23:59:59.999

        // Verificar si ya existe un periodo con la fecha final
        const consultaExistencia = `
            SELECT * FROM periodo 
            WHERE fecha_final = ?
        `;
        const resultadoExistente = await ejecutarConsulta(consultaExistencia, [
            fechaFinalActual.toISOString().split('T')[0], // Solo obtener la parte de la fecha (YYYY-MM-DD)
        ]);

        // Si ya existe un periodo con la fecha final relevante
        if (resultadoExistente.length > 0) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un periodo con la misma fecha final.',
            });
        }

        // Si no existe, proceder con la inserción del nuevo periodo
        const consultaInsert = 'INSERT INTO periodo (año, fecha_inicial, fecha_final) VALUES (?, ?, ?)';
        const resultadoPeriodo = await ejecutarConsulta(consultaInsert, [
            añoRegistro,
            fechaInicio.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
            fechaFinalActual.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
        ]);

        // Obtener el id del periodo recién creado
        const periodoId = resultadoPeriodo.insertId;

        // Insertar presupuestos asociados al periodo
        const consultaInsertPresupuesto = `
            INSERT INTO presupuesto (tipo, prodim, indirectos, monto_inici, monto_rest, periodo_idperiodo) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const presupuesto of presupuestos) {
            const { tipo, prodim, indirectos, monto_inici } = presupuesto;
            const monto_rest = monto_inici; // Suponiendo que monto_rest es igual a monto_inici
            await ejecutarConsulta(consultaInsertPresupuesto, [
                tipo,
                prodim,
                indirectos,
                monto_inici,
                monto_rest,
                periodoId, // Asociar con el periodo recién creado
            ]);
        }

        // Consultar el periodo recién creado para devolverlo en la respuesta
        const consultaPeriodoCreado = `
            SELECT * FROM periodo 
            WHERE idperiodo = ?
        `;
        const periodoCreado = await ejecutarConsulta(consultaPeriodoCreado, [periodoId]);

        return res.status(200).json({
            ok: true,
            msg: 'Periodo y presupuestos creados exitosamente.',
            periodo: periodoCreado[0], // Devolver el periodo recién creado
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


const obtenerPeriodos = async (req, res = express.response) => { 
    try {
        const { idperiodo } = req.query;
        const consultaPresupuestos = `
            SELECT * FROM presupuesto where periodo_idperiodo = ?
        `;
        const presupuestosCreados = await ejecutarConsulta(consultaPresupuestos, [idperiodo]);

        return res.status(200).json({
            ok: true,
            msg: 'Presupuestos encontrados',
            presupuestos: presupuestosCreados // Devolver la lista de presupuestos
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

module.exports = {
    buscarPeriodo,
    crearPeriodo,
    obtenerPeriodos
};