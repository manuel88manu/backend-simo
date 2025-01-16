const express = require('express');
const { ejecutarConsulta } = require('../database/config');


// Establecemos la fecha de inicio directamente en UTC para evitar conflictos con la zona horaria
//const fechaInicio = new Date('2024-01-01T00:00:00Z'); 

const buscarPeriodo = async (req, res = express.response) => {
    try {
        
        let fechaHoy = new Date();

        // Ajustar la hora a la zona horaria de México (UTC -6)
        fechaHoy = new Date(fechaHoy.getTime() - (6 * 60 * 60 * 1000)); // Restar 6 horas a UTC // Usamos la fecha fija para la prueba
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
          console.log('Entro')
            return res.status(404).json({
                ok: false,
                msg: 'No se encontró un periodo vigente.',
            });
        }

        // Si encontramos un periodo, lo verificamos
        const periodo = resultado[0];  // Tomamos el primer resultado de la consulta
        const fechaFinalPeriodo = new Date(periodo.fecha_final); // Fecha de finalización del periodo

        // Comprobamos si el periodo está vencido o si está vigente
        if (fechaFinalPeriodo.toISOString().split('T')[0] < fechaHoy.toISOString().split('T')[0]) {
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
        
        let fechaInicio = new Date();

        // Ajustar la hora a la zona horaria de México (UTC -6)
        fechaInicio = new Date(fechaInicio.getTime() - (6 * 60 * 60 * 1000)); // Restar 6 horas a UTC// Obtener la fecha actual
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

        const añoRegistro = fechaInicio.getUTCFullYear(); // Año de la fecha actual

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

const obtenerFaltante=async (req, res = express.response) => { 
    try {
        const{idPresupuesto}=req.query
        
        const presuExiste= await ejecutarConsulta(`select 
                                        tipo,prodim,indirectos,monto_inici,monto_rest 
                                        from presupuesto where idPresupuesto=?`,
                                        [idPresupuesto]
        )

        if(presuExiste.length===0){
            return res.status(400).json({
                ok: false,
                msg: 'No existe el presupuesto que se busca',
            });
        }

        const tipo=presuExiste[0].tipo
        const prodim=presuExiste[0].prodim
        const indirectos=presuExiste[0].indirectos
        const monto_inici=presuExiste[0].monto_inici
        const monto_rest=presuExiste[0].monto_rest

        let montosFalt={}
       
        switch (tipo) {
            case 'faismun':
                try {
                if(prodim===1 && indirectos==1){

                    //-------------indirectos montos------------------------------
                    const obtnerPorcIndirecto=`SELECT monto_inici, 
                    (monto_inici * 0.03) AS porcentaje_3
                    FROM presupuesto
                    WHERE idPresupuesto = ?;`
                    const resultPorIndirecto= await ejecutarConsulta(obtnerPorcIndirecto,[idPresupuesto])
                    const porindirecto=resultPorIndirecto[0].porcentaje_3

                    const obtenerSumaIndirectos=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'indirectos'
                                                             `

                    const sumaIndirectosResult= await ejecutarConsulta(obtenerSumaIndirectos,[idPresupuesto])
                    const restIndirectos=porindirecto-(sumaIndirectosResult[0].suma_presupuesto);

                    //------------prodim montos-----------------------------------------------
                    const obtnerPorcProdim=`SELECT monto_inici, 
                    (monto_inici * 0.02) AS porcentaje_2
                    FROM presupuesto
                    WHERE idPresupuesto = ?;`

                    const resultPorProdim= await ejecutarConsulta(obtnerPorcProdim,[idPresupuesto])
                    const porProdim= resultPorProdim[0].porcentaje_2;

                    const obtenerSumaProdim=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'prodim'
                                                             `

                    const sumaProdimResult= await ejecutarConsulta(obtenerSumaProdim,[idPresupuesto])
                    const resProdim=porProdim-(sumaProdimResult[0].suma_presupuesto);

                    const montoZonaDirectaMinimo = monto_inici * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?`;
                 const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idPresupuesto]);
                 const resZonaDirecta =montoZonaDirectaMinimo-(resultadoSumaZonaDirecta[0].suma_zona_directa);

                    montosFalt={
                        monto_indirectos:porindirecto,
                        monto_indirectos_falt:restIndirectos,

                        monto_prodim:porProdim,
                        monto_prodim_falt:resProdim,

                        monto_zap_indirecto:montoZonaDirectaMinimo,
                        monto_zap_indirecto_falt:resZonaDirecta,

                        monto_restante:monto_rest,

                    }

                }else if(prodim===1 && indirectos==0){

                    //------------prodim montos-----------------------------------------------
                    const obtnerPorcProdim=`SELECT monto_inici, 
                    (monto_inici * 0.02) AS porcentaje_2
                    FROM presupuesto
                    WHERE idPresupuesto = ?;`

                    const resultPorProdim= await ejecutarConsulta(obtnerPorcProdim,[idPresupuesto])
                    const porProdim= resultPorProdim[0].porcentaje_2;

                    const obtenerSumaProdim=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'prodim'
                                                             `

                    const sumaProdimResult= await ejecutarConsulta(obtenerSumaProdim,[idPresupuesto])
                    const resProdim=porProdim-(sumaProdimResult[0].suma_presupuesto);

                    const montoZonaDirectaMinimo = monto_inici * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?`;
                 const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idPresupuesto]);
                 const resZonaDirecta =montoZonaDirectaMinimo-(resultadoSumaZonaDirecta[0].suma_zona_directa);

                    montosFalt={
                        monto_prodim:porProdim,
                        monto_prodim_falt:resProdim,

                        monto_zap_indirecto:montoZonaDirectaMinimo,
                        monto_zap_indirecto_falt:resZonaDirecta,

                        monto_restante:monto_rest,

                    }

                }else if(prodim===0 && indirectos==1){

                    //-------------indirectos montos------------------------------
                    const obtnerPorcIndirecto=`SELECT monto_inici, 
                    (monto_inici * 0.03) AS porcentaje_3
                    FROM presupuesto
                    WHERE idPresupuesto = ?;`
                    const resultPorIndirecto= await ejecutarConsulta(obtnerPorcIndirecto,[idPresupuesto])
                    const porindirecto=resultPorIndirecto[0].porcentaje_3

                    const obtenerSumaIndirectos=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'indirectos'
                                                             `

                    const sumaIndirectosResult= await ejecutarConsulta(obtenerSumaIndirectos,[idPresupuesto])
                    const restIndirectos=porindirecto-(sumaIndirectosResult[0].suma_presupuesto);

                    const montoZonaDirectaMinimo = monto_inici * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?`;
                 const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idPresupuesto]);
                 const resZonaDirecta =montoZonaDirectaMinimo-(resultadoSumaZonaDirecta[0].suma_zona_directa);

                    montosFalt={
                        monto_indirectos:porindirecto,
                        monto_indirectos_falt:restIndirectos,

                        monto_zap_indirecto:montoZonaDirectaMinimo,
                        monto_zap_indirecto_falt:resZonaDirecta,

                        monto_restante:monto_rest,

                    }

                }else if(prodim===0 && indirectos===0){

                    const montoZonaDirectaMinimo = monto_inici * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?`;
                 const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idPresupuesto]);
                 const resZonaDirecta =montoZonaDirectaMinimo-(resultadoSumaZonaDirecta[0].suma_zona_directa);

                    montosFalt={
                        monto_zap_indirecto:montoZonaDirectaMinimo,
                        monto_zap_indirecto_falt:resZonaDirecta,

                        monto_restante:monto_rest,

                    }
                }else{
                    montosFalt = {
                        mensaje: "Condiciones no esperadas",
                        prodim: prodim,
                        indirectos: indirectos,
                    };

                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    ok: false,
                    msg: 'Algo salió mal.',
                    error: error.message,
                });    
            }
                break;

            case 'fortamun':
                try {
                    
                    const montoSeguridaadPublica = monto_inici * 0.2;
                    
                    const obtenerSumaSeguriPubli = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('seguridad_publica') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_seguri_publi
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?`;

                    const resultadoSumaSeguriPubli = await ejecutarConsulta(obtenerSumaSeguriPubli, [idPresupuesto]);
                    const seguridadPublirest=montoSeguridaadPublica-(resultadoSumaSeguriPubli[0].suma_seguri_publi);
                    
                    montosFalt={
                        monto_seguridad:montoSeguridaadPublica,
                        monto_seguridad_falt:seguridadPublirest,
                        monto_restante:monto_rest,

                    }            
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        ok: false,
                        msg: 'Algo salió mal.',
                        error: error.message,
                    });    
                }
            break;

            case 'estatal':
            case 'odirectas':
            case 'federal':
                try {
                    montosFalt={
                        monto_restante:monto_rest,
                    }             
                } catch (error) {
                    console.error(error);
                    return res.status(500).json({
                        ok: false,
                        msg: 'Algo salió mal.',
                        error: error.message,
                    });   
                }

            break;

            default:
                break;
        }

        return res.status(200).json({
            ok: true,
            msg: 'todo bien',
            faltante:montosFalt
        });
    } catch (error) {
        return res.status(500).json({
            ok: false,
            msg: 'Algo salió mal.',
            error: error.message,
        });
    }
}


const actualizarPresu=async (req, res = express.response) => { 
try {

      const {presupuestos}=req.body

       if (!presupuestos || !Array.isArray(presupuestos)) {
            return res.status(400).json({
                ok: false,
                msg: 'El cuerpo de la solicitud debe contener un array llamado "presupuesto".',
            });
        }


               const queryVal = `
            SELECT COALESCE(SUM(o.presupuesto), 0) AS suma_obras
            FROM obra o
            WHERE o.Presupuesto_idPresupuesto = ?
        `;

        // Validar cada presupuesto
        for (const item of presupuestos) {
            const monto_inici = Object.values(item)[1]; // El monto enviado en el body
            const idPresupuesto = item.idPresupuesto;

            // Consultar la suma de los presupuestos de las obras relacionadas con el idPresupuesto
            const result = await ejecutarConsulta(queryVal, [idPresupuesto]);

            if (result.length > 0) {
                const sumaObras = result[0].suma_obras;

                // Verificar si el monto_inici es menor que la suma de los presupuestos de las obras
                if (monto_inici < sumaObras) {
                    return res.status(400).json({
                        ok: false,
                        msg: `El monto inicial es menor que la suma de los presupuestos de las obras, valida que sea mayor o modifica el prespuesto de las obras`,
                    });
                }
            }
        }


        const query1 = `
            UPDATE presupuesto p
            JOIN (
                SELECT ? AS idPresupuesto, ? AS monto_inici
            ) AS temp
            ON p.idPresupuesto = temp.idPresupuesto
            SET p.monto_inici = temp.monto_inici;
        `;
       
         for (const item of presupuestos) {
            await ejecutarConsulta(query1, [item.idPresupuesto, Object.values(item)[1]]);
        }

     const ids = presupuestos.map((item) => item.idPresupuesto);
        const query2 = `
            UPDATE presupuesto p
            SET p.monto_rest = p.monto_inici - (
                SELECT COALESCE(SUM(o.presupuesto), 0)
                FROM obra o
                WHERE o.Presupuesto_idPresupuesto = p.idPresupuesto
            )
            WHERE p.idPresupuesto IN (?);
        `;
         await ejecutarConsulta(query2, [ids]);

      

      return res.status(200).json({
            ok: true,
            msg: 'todo bien',
        });
} catch (error) {
     return res.status(500).json({
            ok: false,
            msg: 'Algo salió mal.',
            error: error.message,
        });
}
}

module.exports = {
    buscarPeriodo,
    crearPeriodo,
    obtenerPeriodos,
    obtenerFaltante,
    actualizarPresu
};
