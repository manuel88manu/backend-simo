const express = require('express');
const { ejecutarConsulta } = require('../database/config');

//const fechaInicio = new Date('2025-04-01');  

const buscarPeriodo = async (req, res = express.response) => {
    try {
        const fechaHoy = new Date();  // Usamos la fecha fija para la prueba
        const añoActual = fechaHoy.getFullYear(); // Año actual (2024)

        // Definir el rango de fechas para los dos posibles periodos
        const fechaInicioPeriodoAnterior = new Date(añoActual - 1, 3, 1); // 1 de abril del año anterior
        const fechaFinalPeriodoAnterior = new Date(añoActual, 2, 31); // 31 de marzo del año actual
        const fechaInicioPeriodoNuevo = new Date(añoActual, 3, 1); // 1 de abril del año actual
        const fechaFinalPeriodoNuevo = new Date(añoActual + 1, 2, 31); // 31 de marzo del próximo año

        // Consulta para buscar el periodo vigente según la fecha de hoy
        const consulta = `
            SELECT * 
            FROM periodo 
            WHERE (
                (fecha_inicial BETWEEN ? AND ?)
                OR
                (fecha_inicial BETWEEN ? AND ?)
            )
            AND fecha_final >= ?
        `;
        
        const resultado = await ejecutarConsulta(
            consulta, 
            [
                fechaInicioPeriodoAnterior.toISOString().split('T')[0],  // 1 de abril del año anterior
                fechaFinalPeriodoAnterior.toISOString().split('T')[0],   // 31 de marzo del año actual
                fechaInicioPeriodoNuevo.toISOString().split('T')[0],     // 1 de abril del año actual
                fechaFinalPeriodoNuevo.toISOString().split('T')[0],      // 31 de marzo del próximo año
                fechaHoy.toISOString().split('T')[0]                      // Fecha de hoy
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
        const { fecha_inicio } = req.body; // Obtenemos la fecha de inicio del cuerpo de la petición
        const fechaInicio = new Date(fecha_inicio); // Convertimos la fecha de inicio en un objeto de tipo Date

        if (isNaN(fechaInicio)) {
            return res.status(400).json({
                ok: false,
                msg: 'La fecha de inicio proporcionada no es válida.',
            });
        }

        const añoRegistro = fechaInicio.getFullYear();

        // Fecha final según la fecha de inicio
        const fechaFinalActual = new Date(añoRegistro, 2, 31); // 31 de marzo del año actual
        const fechaFinalProximo = new Date(añoRegistro + 1, 2, 31); // 31 de marzo del próximo año

        // Si la fecha de inicio es posterior al 31 de marzo de este año, usar la fecha final del próximo año
        const fechaFinal = fechaInicio > fechaFinalActual ? fechaFinalProximo : fechaFinalActual;

        // Verificar si ya existe un periodo con la fecha final relevante
        const consultaExistencia = `
            SELECT * FROM periodo 
            WHERE fecha_final = ?
        `;
        const resultadoExistente = await ejecutarConsulta(consultaExistencia, [fechaFinal.toISOString().split('T')[0]]); // Convertir a formato YYYY-MM-DD

        // Si ya existe un periodo con la fecha final relevante
        if (resultadoExistente.length > 0) {
            return res.status(400).json({
                ok: false,
                msg: 'Ya existe un periodo con la misma fecha final.',
            });
        }

        // Si no existe un periodo con esa fecha final, proceder con la inserción
        const consultaInsert = 'INSERT INTO periodo (año, fecha_inicial, fecha_final) VALUES (?, ?, ?)';
        await ejecutarConsulta(consultaInsert, [
            añoRegistro,
            fechaInicio.toISOString().split('T')[0],
            fechaFinal.toISOString().split('T')[0],
        ]);

        return res.status(200).json({
            ok: true,
            msg: `Periodo creado exitosamente con fecha final ${fechaFinal.getDate()} de marzo del ${fechaFinal.getFullYear()}.`,
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
    crearPeriodo
};
