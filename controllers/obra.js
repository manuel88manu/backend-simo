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
        const validacionObra = `SELECT * FROM obra WHERE nombre = ? AND bene_unidad = ? AND subprograma = ? AND programa = ? AND Presupuesto_idPresupuesto = ?`;
        const valoresValidacion = [
            obra.nombre,
            obra.bene_unidad,
            obra.subprograma,
            obra.programa,
            Presupuesto_idPresupuesto
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

        dictamen.obra_idobra=obraId;

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


        const obraCreada= await ejecutarConsulta(`select *from obra where idobra=?`,[obraId])
        const obraResult=obraCreada[0]

        const dictamenCreado= await ejecutarConsulta(`select *from dictamen where iddictamen=?`,[dictamenId])
        const dictamenResult=dictamenCreado[0]

        return res.status(200).json({
            ok: true,
            msg: 'Obra y dictamen creados exitosamente',
            obra:obraResult,
            dictamen:dictamenResult

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

        const partidaExiste=`select * from partida where nombre_par = ? AND obra_idobra = ?`
        const resuPartidaExiste= await ejecutarConsulta(partidaExiste,[nombre_par,obra_idobra])

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

        const conceptoExiste=`select * from concepto where nombre_conc= ? AND partida_idpartida = ?`
        const resultConcepto= await ejecutarConsulta(conceptoExiste,[concepto.nombre_conc,partida_idpartida])

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
            msg: 'Concepto agregado',
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
const actualizarPresupuesto = async (req, res = express.response) => {
    try {
        const { idobra } = req.params;

        // Consulta para obtener el tipo de presupuesto y la obra
        const selectTipoObra = `
            SELECT 
                o.idobra,
                p.tipo,
                p.idpresupuesto
            FROM 
                obra o
            JOIN 
                presupuesto p 
            ON 
                o.presupuesto_idPresupuesto = p.idpresupuesto
            WHERE 
                o.idobra = ?;
        `;
        
        const resultTipo = await ejecutarConsulta(selectTipoObra, [idobra]);

        if (resultTipo.length === 0) {
            return res.status(401).json({
                ok: false,
                msg: 'El id de la Obra no existe en la base de datos',
            });
        }

        const tipo = resultTipo[0].tipo; // Tipo de presupuesto
        const idpresupuesto = resultTipo[0].idpresupuesto;

        // Consulta para obtener el presupuesto final
        const selectPresupuestoObra = `
            SELECT 
                obra_idobra,
                SUM(monto_tot) AS suma_monto_tot,
                SUM(monto_tot) * 0.16 AS iva,
                SUM(monto_tot) + (SUM(monto_tot) * 0.16) AS presupuesto_total
            FROM 
                partida
            WHERE 
                obra_idobra = ?
            GROUP BY 
                obra_idobra;
        `;

        const resulPresupuestoFinal = await ejecutarConsulta(selectPresupuestoObra, [idobra]);

        if (resulPresupuestoFinal.length === 0) {
            return res.status(404).json({
                ok: false,
                msg: 'No se encontraron partidas para esta obra.',
            });
        }

        const partidasNullas= await ejecutarConsulta(`SELECT * 
                                                        FROM partida 
                                                        WHERE obra_idobra = ? AND monto_tot IS NULL;`,[idobra])
        if(partidasNullas.length>0){
            return res.status(404).json({
                ok: false,
                msg: 'Existen partidas que no se han agregado conceptos, favor de agregarlos',
            });
        }

        const presupuesto = resulPresupuestoFinal[0].presupuesto_total;
        const iva = resulPresupuestoFinal[0].iva;

        // Lógica condicional basada en el tipo de presupuesto
        let resultadoAdicional = {};

        switch (tipo) {
            case 'estatal':
            case 'odirectas':
            case 'federal':
                try {
                
                    const selectMontoRes= `select monto_rest from presupuesto where idpresupuesto=?`
                    const resultMontoRes= await ejecutarConsulta(selectMontoRes,[idpresupuesto])
                    const montoRes= resultMontoRes[0].monto_rest

                    const RecuperarMonto= await ejecutarConsulta(`select presupuesto from obra where idobra=?`,[idobra])
                    const montoObra=RecuperarMonto[0].presupuesto

                    const montoRestaurado=montoObra+montoRes;

               if(presupuesto>montoRestaurado){
                return res.status(401).json({
                    ok: false,
                    montoObra,
                    montoRes,
                    presupuesto,
                    montoRestaurado,
                    msg: `El presupuesto de esta obra excede el monto disponible para las obras ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}.`,
                });
               }

               const presuEstatal=` UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ? `;

               await ejecutarConsulta(presuEstatal,[presupuesto,idobra])

               const actualizarMontoRes=`
                                         UPDATE presupuesto p
                                         SET monto_rest = monto_inici - (
                                         SELECT COALESCE(SUM(o.presupuesto), 0) 
                                           FROM obra o
                                           WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                         )
                                       WHERE p.idpresupuesto = ?;
                                      `;
                                      
                await ejecutarConsulta(actualizarMontoRes,[idpresupuesto])    

                resultadoAdicional = {
                    presupuesto:presupuesto
                };
            }
                catch (error) {
                    console.error(error);
                    return res.status(500).json({
                    ok: false,
                    msg: 'Algo salió mal.',
                    error: error.message,
                    });
                }
                break;

                case 'faismun':
                    try {
                        const verifiIndirecProdrim = `select prodim, indirectos from presupuesto where idPresupuesto=?`;
                        const resulIndiPro = await ejecutarConsulta(verifiIndirecProdrim, [idpresupuesto]);
                
                        const prodim = resulIndiPro[0].prodim;
                        const indirectos = resulIndiPro[0].indirectos;

                        const selectMontoRes= `select monto_rest from presupuesto where idpresupuesto=?`
                        const resultMontoRes= await ejecutarConsulta(selectMontoRes,[idpresupuesto])
                        const montoRes= resultMontoRes[0].monto_rest

                        const RecuperarMonto= await ejecutarConsulta(`select presupuesto from obra where idobra=?`,[idobra])
                        const montoObra=RecuperarMonto[0].presupuesto

                        const montoRestaurado=montoObra+montoRes;

                        if(presupuesto>montoRestaurado){
                         return res.status(401).json({
                           ok: false,
                           montoRestante:montoRes,
                           montoObra:montoObra,
                           montoRestaurado:montoRestaurado,
                          msg: `El presupuesto de esta obra $${presupuesto} excede el monto disponible de $${montoRestaurado} para las obras ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}.`,
                          });
                              }
                
                        // Lógica condicional para manejar los casos y asignar resultadoAdicional
                        if (prodim === 1 && indirectos === 1) {
                            
                            const validarRubros=`select rubros from obra where idobra=?`

                            const resultadorubros= await ejecutarConsulta(validarRubros,[idobra])
                            const rubros=resultadorubros[0].rubros;

                            if(rubros==='indirectos'){
                                const obtnerPorcIndirecto=`SELECT monto_inici, 
                                                          (monto_inici * 0.03) AS porcentaje_3
                                                          FROM presupuesto
                                                          WHERE idPresupuesto = ?;`

                                const resultPorIndirecto= await ejecutarConsulta(obtnerPorcIndirecto,[idpresupuesto])
                                const porIndirectos= resultPorIndirecto[0].porcentaje_3;

                                const obtenerSumaIndirectos=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'indirectos'
                                                             AND idobra != ?
                                                             `

                                const sumaIndirectosResult= await ejecutarConsulta(obtenerSumaIndirectos,[idpresupuesto,idobra])
                                const sumaIndirectos=sumaIndirectosResult[0].suma_presupuesto;

                                if ((sumaIndirectos + presupuesto) > porIndirectos) {
                                    return res.status(401).json({
                                        presupuesto:presupuesto,
                                        sumaIndirectos:sumaIndirectos,
                                        porIndectos:porIndirectos,
                                        ok: false,
                                        msg: `El presupuesto destinado para indirectos de Faismun no debe ser máximo del 3%, es decir, de $${porIndirectos} y el presupuesto estimado para la obra es de $${presupuesto}  sumado a los $${sumaIndirectos} excede el maximo`,
                                    });
                                }

                                const presuEstatal=` UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ? `;

                                await ejecutarConsulta(presuEstatal,[presupuesto,idobra])

                                const actualizarMontoRes=`
                                UPDATE presupuesto p
                                SET monto_rest = monto_inici - (
                                SELECT COALESCE(SUM(o.presupuesto), 0) 
                                  FROM obra o
                                  WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                )
                              WHERE p.idpresupuesto = ?;
                             `;
                             
                                await ejecutarConsulta(actualizarMontoRes,[idpresupuesto])
                                
                                
                                resultadoAdicional = {
                                    mensaje: "Ambos valores son 1",
                                    presupuesto:presupuesto,
                                    rubros:rubros,
                                    porIndectos:porIndirectos,
                                    sumaIndirectos:sumaIndirectos,
                                };

                            }
                            else if(rubros==='prodim'){
                                const obtnerPorcProdim=`SELECT monto_inici, 
                                                          (monto_inici * 0.02) AS porcentaje_2
                                                          FROM presupuesto
                                                          WHERE idPresupuesto = ?;`

                                const resultPorProdim= await ejecutarConsulta(obtnerPorcProdim,[idpresupuesto])
                                const porProdim= resultPorProdim[0].porcentaje_2;

                                const obtenerSumaProdim=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'prodim'
                                                             AND idobra != ?
                                                             `

                                const sumaProdimResult= await ejecutarConsulta(obtenerSumaProdim,[idpresupuesto,idobra])
                                const sumaProdim=sumaProdimResult[0].suma_presupuesto;

                                if ((sumaProdim + presupuesto) > porProdim) {
                                    return res.status(401).json({
                                        presupuesto:presupuesto,
                                        sumaProdim:sumaProdim,
                                        porProdim:porProdim,
                                        ok: false,
                                        msg: `El presupuesto destinado para prodim de Faismun no debe ser máximo del 2%, es decir, de $${porProdim} y el presupuesto estimado para la obra es de $${presupuesto} sumado a los $${sumaProdim} ya existentes excede el maximo `,
                                    });
                                }

                                const presuEstatal=` UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ? `;

                                await ejecutarConsulta(presuEstatal,[presupuesto,idobra])

                                const actualizarMontoRes=`
                                UPDATE presupuesto p
                                SET monto_rest = monto_inici - (
                                SELECT COALESCE(SUM(o.presupuesto), 0) 
                                  FROM obra o
                                  WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                )
                              WHERE p.idpresupuesto = ?;
                             `;
                             
                                await ejecutarConsulta(actualizarMontoRes,[idpresupuesto])
                                
                                
                                resultadoAdicional = {
                                    mensaje: "Ambos valores son 1",
                                    presupuesto:presupuesto,
                                    rubros:rubros,
                                    porIndectos:porProdim,
                                    sumaIndirectos:sumaProdim,
                                };

                            }else {
                                // Obtener monto inicial del presupuesto
                                const obtenerMontoInicial = `
                                    SELECT monto_inici
                                    FROM presupuesto
                                    WHERE idPresupuesto = ?;`;
                            
                                const resultMontoInicial = await ejecutarConsulta(obtenerMontoInicial, [idpresupuesto]);
                                const montoInicial = resultMontoInicial[0].monto_inici;
                            
                                // Calcular el monto total destinado para indirectos y prodim (5%)
                                const montoTotalIndirectosProdim = montoInicial * 0.05;  // 3% indirectos + 2% prodim
                            
                                // Obtener la suma actual de los presupuestos para indirectos y prodim
                                const obtenerSumaIndirectosProdim = `
                                    SELECT 
                                        COALESCE(SUM(CASE WHEN rubros = 'indirectos' THEN presupuesto ELSE 0 END), 0) AS suma_indirectos,
                                        COALESCE(SUM(CASE WHEN rubros = 'prodim' THEN presupuesto ELSE 0 END), 0) AS suma_prodim
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?;`;
                            
                                const sumaTotalResult = await ejecutarConsulta(obtenerSumaIndirectosProdim, [idpresupuesto, idobra]);
                                const sumaIndirectos = sumaTotalResult[0].suma_indirectos;
                                const sumaProdim = sumaTotalResult[0].suma_prodim;
                            
                                // Calcular cuánto falta para completar el 5% total (indirectos + prodim)
                                const montoFaltanteIndirectosProdim = montoTotalIndirectosProdim - (sumaIndirectos + sumaProdim);

                                // Si falta algún monto para completar el 5%, validamos que no se afecte
                                if (montoFaltanteIndirectosProdim > 0) {
                                    // Si la obra no es de indirectos ni prodim
                                    if (rubros !== 'indirectos' && rubros !== 'prodim') {
                                        // Validamos que el monto restante sea suficiente para asignar el presupuesto a esta obra
                                        if (presupuesto <= montoRestaurado) {
                                            // Verificamos que el monto restante no afecte el monto faltante para indirectos y prodim
                                            if (presupuesto > montoRestaurado - montoFaltanteIndirectosProdim) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteIndirectosProdim,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para indirectos y prodim. Queda pendiente un monto de $${montoFaltanteIndirectosProdim}.`,
                                                });
                                            }
                                        } else {
                                            return res.status(401).json({
                                                presupuesto: presupuesto,
                                                montoFaltante: montoFaltanteIndirectosProdim,
                                                ok: false,
                                                msg: `No se puede asignar el presupuesto solicitado, ya que el monto_rest es insuficiente. Queda pendiente un monto de $${montoFaltanteIndirectosProdim}.`,
                                            });
                                        }
                                    }
                                }

                                //===========================================================================

                                // Calcular el 40% del monto inicial
                                const montoZonaDirectaMinimo = montoInicial * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?`;

                                    const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idpresupuesto, idobra]);
                                    const sumaZonaDirecta = resultadoSumaZonaDirecta[0].suma_zona_directa;

                                    // Calcular cuánto falta para completar el 40% mínimo
                                    const montoFaltanteZonaDirecta = montoZonaDirectaMinimo - sumaZonaDirecta;

                                    if (montoFaltanteZonaDirecta > 0) {
                                        // Si la obra no es de indirectos ni prodim
                                        if (rubros !== 'zona_atencion_prioritaria' && rubros !== 'incidencia_directa') {
                                            if (presupuesto > montoRestaurado - montoFaltanteZonaDirecta) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteZonaDirecta,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para ZAP a Incidencia directa. Queda pendiente un monto de $${montoFaltanteZonaDirecta}.`,
                                                });
                                            }
                                        }
                                    }
                          
                                                            
                                // Si no hay problema con el monto faltante, se procede con la actualización
                                const presuEstatal = `
                                    UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ?`;
                            
                                await ejecutarConsulta(presuEstatal, [presupuesto, idobra]);
                            
                                // Actualizar el monto_rest del presupuesto
                                const actualizarMontoRes = `
                                    UPDATE presupuesto p
                                    SET monto_rest = monto_inici - (
                                        SELECT COALESCE(SUM(o.presupuesto), 0) 
                                        FROM obra o
                                        WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                    )
                                    WHERE p.idpresupuesto = ?;`;
                            
                                await ejecutarConsulta(actualizarMontoRes, [idpresupuesto]);
                            
                                resultadoAdicional = {
                                    mensaje: "Presupuesto actualizado correctamente",
                                    presupuesto: presupuesto,
                                    rubros: rubros,
                                    montoFaltanteDeProdimIndirectos: montoFaltanteIndirectosProdim,
                                    montoFaltantedeZapIncidencia:montoFaltanteZonaDirecta 
                                };
                            }
                        } else if (prodim === 1 && indirectos === 0) {
                           
                            const validarRubros=`select rubros from obra where idobra=?`
                            const resultadorubros= await ejecutarConsulta(validarRubros,[idobra])
                            const rubros=resultadorubros[0].rubros;

                            if(rubros==='prodim'){
                                const obtnerPorcProdim=`SELECT monto_inici, 
                                                          (monto_inici * 0.02) AS porcentaje_2
                                                          FROM presupuesto
                                                          WHERE idPresupuesto = ?;`
                              const resultPorProdim= await ejecutarConsulta(obtnerPorcProdim,[idpresupuesto])
                              const porProdim= resultPorProdim[0].porcentaje_2;

                              const obtenerSumaProdim=`SELECT COALESCE(SUM(presupuesto), 0) 
                                                             AS suma_presupuesto
                                                             FROM obra
                                                             WHERE presupuesto_idPresupuesto = ?
                                                             AND rubros = 'prodim'
                                                             AND idobra != ?
                                                             `
                              const sumaProdimResult= await ejecutarConsulta(obtenerSumaProdim,[idpresupuesto,idobra])
                              const sumaProdim=sumaProdimResult[0].suma_presupuesto;
                              
                              if ((sumaProdim + presupuesto) > porProdim) {
                                return res.status(401).json({
                                    presupuesto:presupuesto,
                                    sumaProdim:sumaProdim,
                                    porProdim:porProdim,
                                    ok: false,
                                    msg: `El presupuesto destinado para prodim de Faismun no debe ser máximo del 2%, es decir, de $${porProdim} y el presupuesto estimado para la obra es de $${presupuesto} sumado a los $${sumaProdim} ya existentes excede el maximo `,
                                });
                            }

                            const presuEstatal=` UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ? `;
                                    
                            await ejecutarConsulta(presuEstatal,[presupuesto,idobra])  
                            
                            const actualizarMontoRes=`
                                UPDATE presupuesto p
                                SET monto_rest = monto_inici - (
                                SELECT COALESCE(SUM(o.presupuesto), 0) 
                                  FROM obra o
                                  WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                )
                              WHERE p.idpresupuesto = ?;
                             `;
                             
                                await ejecutarConsulta(actualizarMontoRes,[idpresupuesto])

                                resultadoAdicional = {
                                    presupuesto:presupuesto,
                                    rubros:rubros,
                                    porIndectos:porProdim,
                                    sumaIndirectos:sumaProdim,
                                };

                            } else{
                                // Obtener monto inicial del presupuesto
                                const obtenerMontoInicial = `
                                    SELECT monto_inici
                                    FROM presupuesto
                                    WHERE idPresupuesto = ?;`;

                                const resultMontoInicial = await ejecutarConsulta(obtenerMontoInicial, [idpresupuesto]);
                                const montoInicial = resultMontoInicial[0].monto_inici;

                                 // Calcular el monto total destinado para  prodim (5%)
                                 const montoTotalIndirectosProdim = montoInicial * 0.02;  //  2% prodim

                                 // Obtener la suma actual de los presupuestos para prodim
                                const obtenerSumaIndirectosProdim = `
                                SELECT 
                                    COALESCE(SUM(CASE WHEN rubros = 'prodim' THEN presupuesto ELSE 0 END), 0) AS suma_prodim
                                FROM obra
                                WHERE presupuesto_idPresupuesto = ?
                                AND idobra != ?;`;

                                const sumaTotalResult = await ejecutarConsulta(obtenerSumaIndirectosProdim, [idpresupuesto, idobra]);
                                const sumaProdim = sumaTotalResult[0].suma_prodim;
                                 // Calcular cuánto falta para completar el 5% total (indirectos + prodim)
                                 const montoFaltanteIndirectosProdim = montoTotalIndirectosProdim - sumaProdim;

                                 // Si falta algún monto para completar el 2%, validamos que no se afecte
                                if (montoFaltanteIndirectosProdim > 0) {

                                    if (rubros !== 'prodim') {
                                        // Verificamos que el monto restante no afecte el monto faltante para indirectos y prodim
                                        if (presupuesto > montoRestaurado - montoFaltanteIndirectosProdim) {
                                            return res.status(401).json({
                                                presupuesto: presupuesto,
                                                montoFaltante: montoFaltanteIndirectosProdim,
                                                ok: false,
                                                msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para prodim. Queda pendiente un monto de $${montoFaltanteIndirectosProdim}.`,
                                            });
                                        }
                                    }
                                }
                                 //===========================================================================
                                 
                                 // Calcular el 40% del monto inicial
                                const montoZonaDirectaMinimo = montoInicial * 0.4;

                                const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?`;

                                    const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idpresupuesto, idobra]);
                                    const sumaZonaDirecta = resultadoSumaZonaDirecta[0].suma_zona_directa;

                                    // Calcular cuánto falta para completar el 40% mínimo
                                    const montoFaltanteZonaDirecta = montoZonaDirectaMinimo - sumaZonaDirecta;

                                    if (montoFaltanteZonaDirecta > 0) {
                                        // Si la obra no es de indirectos ni prodim
                                        if (rubros !== 'zona_atencion_prioritaria' && rubros !== 'incidencia_directa') {
                                            if (presupuesto > montoRestaurado - montoFaltanteZonaDirecta) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteZonaDirecta,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para ZAP a Incidencia directa. Queda pendiente un monto de $${montoFaltanteZonaDirecta}.`,
                                                });
                                            }
                                        }
                                    }

                                     // Si no hay problema con el monto faltante, se procede con la actualización
                                            const presuEstatal = `
                                            UPDATE obra
                                            SET presupuesto = ?
                                            WHERE idobra = ?`;

                                            await ejecutarConsulta(presuEstatal, [presupuesto, idobra]);

                                            // Actualizar el monto_rest del presupuesto
                                const actualizarMontoRes = `
                                UPDATE presupuesto p
                                SET monto_rest = monto_inici - (
                                    SELECT COALESCE(SUM(o.presupuesto), 0) 
                                    FROM obra o
                                    WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                )
                                WHERE p.idpresupuesto = ?;`;

                                await ejecutarConsulta(actualizarMontoRes, [idpresupuesto]);

                                resultadoAdicional = {
                                    mensaje: "Presupuesto actualizado correctamente",
                                    presupuesto: presupuesto,
                                    rubros: rubros,
                                    montoFaltanteDeProdimIndirectos: montoFaltanteIndirectosProdim,
                                    montoFaltantedeZapIncidencia:montoFaltanteZonaDirecta 
                                };



                            }
                        } else if (prodim === 0 && indirectos === 1) {
                            const validarRubros=`select rubros from obra where idobra=?`
                            const resultadorubros= await ejecutarConsulta(validarRubros,[idobra])

                            const rubros=resultadorubros[0].rubros;

                            if(rubros==='indirectos'){
                                const obtnerPorcIndirecto=`SELECT monto_inici, 
                                                          (monto_inici * 0.03) AS porcentaje_3
                                                          FROM presupuesto
                                                          WHERE idPresupuesto = ?;`

                                const resultPorIndirecto= await ejecutarConsulta(obtnerPorcIndirecto,[idpresupuesto])
                                const porIndirectos= resultPorIndirecto[0].porcentaje_3;

                                const obtenerSumaIndirectos=`SELECT COALESCE(SUM(presupuesto), 0) 
                                AS suma_presupuesto
                                FROM obra
                                WHERE presupuesto_idPresupuesto = ?
                                AND rubros = 'indirectos'
                                AND idobra != ?
                                `
                                const sumaIndirectosResult= await ejecutarConsulta(obtenerSumaIndirectos,[idpresupuesto,idobra])
                                const sumaIndirectos=sumaIndirectosResult[0].suma_presupuesto;

                                if ((sumaIndirectos + presupuesto) > porIndirectos) {
                                    return res.status(401).json({
                                        presupuesto:presupuesto,
                                        sumaIndirectos:sumaIndirectos,
                                        porIndectos:porIndirectos,
                                        ok: false,
                                        msg: `El presupuesto destinado para indirectos de Faismun no debe ser máximo del 3%, es decir, de $${porIndirectos} y el presupuesto estimado para la obra es de $${presupuesto}  sumado a los $${sumaIndirectos} excede el maximo`,
                                    });
                                }

                                const presuEstatal=` UPDATE obra
                                    SET presupuesto = ?
                                    WHERE idobra = ? `;
                                
                                    await ejecutarConsulta(presuEstatal,[presupuesto,idobra])

                            const actualizarMontoRes=`
                                UPDATE presupuesto p
                                SET monto_rest = monto_inici - (
                                SELECT COALESCE(SUM(o.presupuesto), 0) 
                                  FROM obra o
                                  WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                )
                              WHERE p.idpresupuesto = ?;
                             `;
                             await ejecutarConsulta(actualizarMontoRes,[idpresupuesto])

                             resultadoAdicional = {
                                mensaje: "Ambos valores son 1",
                                presupuesto:presupuesto,
                                rubros:rubros,
                                porIndectos:porIndirectos,
                                sumaIndirectos:sumaIndirectos,
                            };
                            }else{
                                // Obtener monto inicial del presupuesto
                                const obtenerMontoInicial = `
                                    SELECT monto_inici
                                    FROM presupuesto
                                    WHERE idPresupuesto = ?;`;
                                
                                const resultMontoInicial = await ejecutarConsulta(obtenerMontoInicial, [idpresupuesto]);
                                const montoInicial = resultMontoInicial[0].monto_inici;

                                // Calcular el monto total destinado para indirectos  (3%)
                                const montoTotalIndirectosProdim = montoInicial * 0.03;  // 3% indirectos
                                
                                // Obtener la suma actual de los presupuestos para indirectos y prodim
                                const obtenerSumaIndirectosProdim = `
                                    SELECT 
                                        COALESCE(SUM(CASE WHEN rubros = 'indirectos' THEN presupuesto ELSE 0 END), 0) AS suma_indirectos
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?;`;
                                
                                    const sumaTotalResult = await ejecutarConsulta(obtenerSumaIndirectosProdim, [idpresupuesto, idobra]);
                                    const sumaIndirectos = sumaTotalResult[0].suma_indirectos;

                                     // Calcular cuánto falta para completar el 5% total (indirectos + prodim)
                                    const montoFaltanteIndirectosProdim = montoTotalIndirectosProdim - sumaIndirectos;

                                    // Si falta algún monto para completar el 5%, validamos que no se afecte
                                    if (montoFaltanteIndirectosProdim > 0) {
                                        if (rubros !=='indirectos') {
                                            // Verificamos que el monto restante no afecte el monto faltante para indirectos y prodim
                                            if (presupuesto > montoRestaurado - montoFaltanteIndirectosProdim) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteIndirectosProdim,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para indirectos y prodim. Queda pendiente un monto de $${montoFaltanteIndirectosProdim}.`,
                                                });
                                            }
                                        }

                                    }

                                    //===========================================================================

                                    // Calcular el 40% del monto inicial
                                    const montoZonaDirectaMinimo = montoInicial * 0.4;

                                    const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?`;

                                    const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idpresupuesto, idobra]);
                                    const sumaZonaDirecta = resultadoSumaZonaDirecta[0].suma_zona_directa;

                                    // Calcular cuánto falta para completar el 40% mínimo
                                    const montoFaltanteZonaDirecta = montoZonaDirectaMinimo - sumaZonaDirecta;

                                    if (montoFaltanteZonaDirecta > 0) {
                                        // Si la obra no es de indirectos ni prodim
                                        if (rubros !== 'zona_atencion_prioritaria' && rubros !== 'incidencia_directa') {
                                            if (presupuesto > montoRestaurado - montoFaltanteZonaDirecta) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteZonaDirecta,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para ZAP a Incidencia directa. Queda pendiente un monto de $${montoFaltanteZonaDirecta}.`,
                                                });
                                            }

                                        }
                                    }

                                    // Si no hay problema con el monto faltante, se procede con la actualización
                                const presuEstatal = `
                                UPDATE obra
                                SET presupuesto = ?
                                WHERE idobra = ?`;

                                await ejecutarConsulta(presuEstatal, [presupuesto, idobra]);

                                // Actualizar el monto_rest del presupuesto
                                const actualizarMontoRes = `
                                    UPDATE presupuesto p
                                    SET monto_rest = monto_inici - (
                                        SELECT COALESCE(SUM(o.presupuesto), 0) 
                                        FROM obra o
                                        WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                    )
                                    WHERE p.idpresupuesto = ?;`;

                                    await ejecutarConsulta(actualizarMontoRes, [idpresupuesto]);

                                    resultadoAdicional = {
                                        mensaje: "Presupuesto actualizado correctamente",
                                        presupuesto: presupuesto,
                                        rubros: rubros,
                                        montoFaltanteDeProdimIndirectos: montoFaltanteIndirectosProdim,
                                        montoFaltantedeZapIncidencia:montoFaltanteZonaDirecta 
                                    };

                            }
                        } else if (prodim === 0 && indirectos === 0) {
                            
                            const validarRubros=`select rubros from obra where idobra=?`

                            const resultadorubros= await ejecutarConsulta(validarRubros,[idobra])
                            const rubros=resultadorubros[0].rubros;

                            // Obtener monto inicial del presupuesto
                            const obtenerMontoInicial = `
                            SELECT monto_inici
                            FROM presupuesto
                            WHERE idPresupuesto = ?;`;
                    
                            const resultMontoInicial = await ejecutarConsulta(obtenerMontoInicial, [idpresupuesto]);
                            const montoInicial = resultMontoInicial[0].monto_inici;

                             // Calcular el 40% del monto inicial
                             const montoZonaDirectaMinimo = montoInicial * 0.4;

                             const obtenerSumaZonaDirecta = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('zona_atencion_prioritaria', 'incidencia_directa') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_zona_directa
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?`;

                                    const resultadoSumaZonaDirecta = await ejecutarConsulta(obtenerSumaZonaDirecta, [idpresupuesto, idobra]);
                                    const sumaZonaDirecta = resultadoSumaZonaDirecta[0].suma_zona_directa;

                                    // Calcular cuánto falta para completar el 40% mínimo
                                    const montoFaltanteZonaDirecta = montoZonaDirectaMinimo - sumaZonaDirecta;

                                    if (montoFaltanteZonaDirecta > 0) {
                                        // Si la obra no es de indirectos ni prodim
                                        if (rubros !== 'zona_atencion_prioritaria' && rubros !== 'incidencia_directa') {
                                            if (presupuesto > montoRestaurado - montoFaltanteZonaDirecta) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteZonaDirecta,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para ZAP a Incidencia directa. Queda pendiente un monto de $${montoFaltanteZonaDirecta}.`,
                                                });
                                            }
                                        }

                                    }

                                    // Si no hay problema con el monto faltante, se procede con la actualización
                                const presuEstatal = `
                                UPDATE obra
                                SET presupuesto = ?
                                WHERE idobra = ?`;

                                await ejecutarConsulta(presuEstatal, [presupuesto, idobra]);

                                // Actualizar el monto_rest del presupuesto
                                const actualizarMontoRes = `
                                    UPDATE presupuesto p
                                    SET monto_rest = monto_inici - (
                                        SELECT COALESCE(SUM(o.presupuesto), 0) 
                                        FROM obra o
                                        WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                    )
                                    WHERE p.idpresupuesto = ?;`;

                                    await ejecutarConsulta(actualizarMontoRes, [idpresupuesto]);

                                    resultadoAdicional = {
                                        mensaje: "Presupuesto actualizado correctamente",
                                        presupuesto: presupuesto,
                                        rubros: rubros,
                                        montoFaltantedeZapIncidencia:montoFaltanteZonaDirecta 
                                    };
                                    
                        } else {
                            // Caso: Ninguna de las condiciones se cumple
                            console.log("Condiciones no esperadas");
                            resultadoAdicional = {
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
                                       
                        const selectMontoRes= `select monto_rest from presupuesto where idpresupuesto=?`
                        const resultMontoRes= await ejecutarConsulta(selectMontoRes,[idpresupuesto])
                        const montoRes= resultMontoRes[0].monto_rest

                        const RecuperarMonto= await ejecutarConsulta(`select presupuesto from obra where idobra=?`,[idobra])
                        const montoObra=RecuperarMonto[0].presupuesto

                        const montoRestaurado=montoObra+montoRes;

                        if(presupuesto>montoRestaurado){
                         return res.status(401).json({
                           ok: false,
                           montoRestante:montoRes,
                           montoObra:montoObra,
                           montoRestaurado:montoRestaurado,
                          msg: `El presupuesto de esta obra $${presupuesto} excede el monto disponible de $${montoRestaurado} para las obras ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}.`,
                          });
                        }

                        const validarRubros=`select rubros from obra where idobra=?`
                        const resultadorubros= await ejecutarConsulta(validarRubros,[idobra])
                        const rubros=resultadorubros[0].rubros;

                        // Obtener monto inicial del presupuesto
                        const obtenerMontoInicial = `
                        SELECT monto_inici
                        FROM presupuesto
                        WHERE idPresupuesto = ?;`;

                        const resultMontoInicial = await ejecutarConsulta(obtenerMontoInicial, [idpresupuesto]);
                        const montoInicial = resultMontoInicial[0].monto_inici;

                         // Calcular el 40% del monto inicial
                         const montoSeguridaadPublica = montoInicial * 0.2;

                         const obtenerSumaSeguriPubli = `
                                    SELECT 
                                        COALESCE(SUM(CASE 
                                            WHEN rubros IN ('seguridad_publica') 
                                            THEN presupuesto 
                                            ELSE 0 
                                        END), 0) AS suma_seguri_publi
                                    FROM obra
                                    WHERE presupuesto_idPresupuesto = ?
                                    AND idobra != ?`;

                                    const resultadoSumaSeguriPubli = await ejecutarConsulta(obtenerSumaSeguriPubli, [idpresupuesto, idobra]);
                                    const sumaZonaDirecta = resultadoSumaSeguriPubli[0].suma_seguri_publi;

                                    // Calcular cuánto falta para completar el 40% mínimo
                                    const montoFaltanteSeguriPubli = montoSeguridaadPublica - sumaZonaDirecta;

                                    if (montoFaltanteSeguriPubli > 0) {
                                        if (rubros !== 'seguridad_publica') {
                                            if (presupuesto > montoRestaurado - montoFaltanteSeguriPubli) {
                                                return res.status(401).json({
                                                    presupuesto: presupuesto,
                                                    montoFaltante: montoFaltanteSeguriPubli,
                                                    ok: false,
                                                    msg: `No se puede asignar el presupuesto solicitado, ya que afectaría el monto destinado para Seguridad Publica Queda pendiente un monto de $${montoFaltanteSeguriPubli}.`,
                                                });
                                            }
                                        }

                                    }

                                     // Si no hay problema con el monto faltante, se procede con la actualización
                                const presuEstatal = `
                                UPDATE obra
                                SET presupuesto = ?
                                WHERE idobra = ?`;

                                await ejecutarConsulta(presuEstatal, [presupuesto, idobra]);

                                 // Actualizar el monto_rest del presupuesto
                                 const actualizarMontoRes = `
                                 UPDATE presupuesto p
                                 SET monto_rest = monto_inici - (
                                     SELECT COALESCE(SUM(o.presupuesto), 0) 
                                     FROM obra o
                                     WHERE o.presupuesto_idPresupuesto = p.idpresupuesto
                                 )
                                 WHERE p.idpresupuesto = ?;`;

                                 await ejecutarConsulta(actualizarMontoRes, [idpresupuesto]);

                                 resultadoAdicional = {
                                    mensaje: "Presupuesto actualizado correctamente",
                                    presupuesto: presupuesto,
                                    rubros: rubros,
                                    montoFaltanteSeguriPubli:montoFaltanteSeguriPubli 
                                };

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
                // Lógica para tipos desconocidos
                resultadoAdicional = {
                    detalle: 'Tipo de presupuesto no reconocido.',
                };
                break;
        }

        // Respuesta final
        return res.status(200).json({
            ok: true,
            msg: 'Presupuesto de Obra Actualizado',
            tipo,
            idpresupuesto,
            resultadoAdicional,
            iva,
            // Información adicional basada en el tipo
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

const obtenerPartidasAgregadas = async (req, res = express.response) => {
    try {
        const { idobra } = req.query;
        
        const obraexist= await ejecutarConsulta(`select * from obra where idobra=?`,[idobra])
   
        if(obraexist.length===0){
            return res.status(401).json({
                ok: false,
                msg:'La obra donde se quiere agregar la partida no existe'
            });
        }

        const partidas= await ejecutarConsulta(`select idpartida,nombre_par,monto_tot,obra_idobra from partida where obra_idobra = ?`,[idobra])
        
        if(partidas.length===0){
            return res.status(200).json({
                ok: true,
                partidas:[],
                msg: 'Todo Bien',
            });

        }

        return res.status(200).json({
            ok: true,
            partidas:partidas,
            msg: 'Todo Bien',
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

const obtenerConceptos=async (req, res = express.response) => {
    try {

        const { idpartida } = req.query;

        const conceptos= await ejecutarConsulta('select idconcepto, nombre_conc, monto, partida_idpartida, unidad, p_unitario, cantidad from concepto where partida_idpartida=?',[idpartida])

        if(conceptos.length===0){
            return res.status(200).json({
                ok: true,
                conceptos:[],
                msg: 'Todo Bien',
            });
        }

        return res.status(200).json({
            ok: true,
            msg: 'Todo Bien',
            conceptos:conceptos
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

const actualizarConcepto=async (req, res = express.response) => {
try {
    
    const { concepto} = req.body;

    const idConcepto= await ejecutarConsulta(`select * from
                                              concepto where idconcepto=?
                                              `,[concepto.idconcepto])
    if(idConcepto.length===0){
        return res.status(401).json({
            ok: false,
            msg: `El concepto que se quiere actualizar no existe`,
        });
    }


    const conceptoExiste= await ejecutarConsulta(`select *
                                                  from concepto 
                                                  where nombre_conc=? and idconcepto != ? and partida_idpartida=?` ,
                                                  [concepto.nombre_conc,concepto.idconcepto,concepto.partida_idpartida]
                                                )
    if(conceptoExiste.length>0){
        return res.status(401).json({
            ok: false,
            msg: `El concepto llamado ${concepto.nombre_conc} ya existe en un registro diferente`,
        });
    }

    await ejecutarConsulta(`UPDATE concepto
        SET
             unidad = ?,
             p_unitario = ?,
             cantidad = ?,
             nombre_conc = ?
             WHERE idconcepto = ?`,[
                concepto.unidad,concepto.p_unitario,concepto.cantidad,
                concepto.nombre_conc,concepto.idconcepto
            ])
    
            const obtenerMonto=`UPDATE concepto
            SET monto = cantidad * p_unitario
            WHERE idconcepto = ?;`

            await ejecutarConsulta(obtenerMonto,[concepto.idconcepto])

            const obtenerMontoPartida= `UPDATE partida p
            SET monto_tot = (
                 SELECT SUM(c.monto)
                 FROM concepto c
                 WHERE c.partida_idpartida = p.idpartida
                )
            WHERE p.idpartida = ?`

            await ejecutarConsulta (obtenerMontoPartida,[concepto.partida_idpartida])

    return res.status(200).json({
        ok: true,
        msg: 'Todo Bien',
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

const actualizarPartida=async (req, res = express.response) => {
    try {
        const {partida}= req.body

        const partidaId= await  ejecutarConsulta(
            `select * from partida where idpartida=?`,[partida.idpartida]
        )

        if(partidaId.length===0){
            return res.status(401).json({
                ok: false,
                msg:'La partida que se quiere actualizar no existe'
            });
        }

        const partidaExiste= await ejecutarConsulta(
            `select * from partida where nombre_par=? and idpartida !=? and obra_idobra=?
             `
            ,[partida.nombre_par,partida.idpartida,partida.obra_idobra])
        
        if(partidaExiste.length>0){
            return res.status(401).json({
                ok: false,
                msg:`Ya existe una partida diferente con el nombre ${partida.nombre_par} no es posible actualizar`
            });
        }

        await ejecutarConsulta(
           `UPDATE partida SET nombre_par = ? 
            WHERE idpartida=?`,[partida.nombre_par,partida.idpartida]
        )
        
        return res.status(200).json({
            ok: true,
            msg: 'Todo Bien',
            
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

const eliminarConcepto=async(req, res = express.response) => {
try {
    const {idconcepto}=req.params
    const conceptoId= await ejecutarConsulta(`select * from concepto where idconcepto=?`,
                                            [idconcepto]
    )

    if(conceptoId.length===0){
        return res.status(401).json({
            ok: false,
            msg:`El concepto que quiere eliminar no existe en la base de datos`
        });
    }

    const idpartidaresul= await ejecutarConsulta(`select partida_idpartida from concepto where idconcepto=?`
                                             ,[idconcepto]              
    )

    const idpartida=idpartidaresul[0].partida_idpartida

    await ejecutarConsulta(`delete from concepto where idconcepto=?`
                                            , [idconcepto]
    )

    const obtenerMontoPartida= `UPDATE partida p
    SET monto_tot = (
         SELECT SUM(c.monto)
         FROM concepto c
         WHERE c.partida_idpartida = p.idpartida
        )
    WHERE p.idpartida = ?`

    await ejecutarConsulta (obtenerMontoPartida,[idpartida])

    return res.status(200).json({
        ok: true,
        msg: 'Todo Bien',
        
    });
} catch (error) {
    console.error(error);
    return res.status(500).json({
        ok: false,
        msg: 'Algo salió malaaaa.',
        error: error.message,
    });
}
}

const eliminarPartida=async(req, res = express.response) => {
try {
    const {idpartida}=req.params

    const partidaExist= await ejecutarConsulta(`select *from partida where idpartida=?`
                                                ,  [idpartida]
    )

    if(partidaExist.length===0){
        return res.status(401).json({
            ok: false,
            msg:`La partida que se quiere eliminar no existe`
        });
    }

    await ejecutarConsulta(`delete from partida where idpartida=?`,
                                        [idpartida]
    )

    return res.status(200).json({
        ok: true,
        msg: 'Todo Bien',
        
    });
} catch (error) {
    console.error(error);
    return res.status(500).json({
        ok: false,
        msg: 'Algo salió malaaaa.',
        error: error.message,
    });
}
}

module.exports = {
    agregarObra,
    agregarPartida,
    agregarConcepto,
    actualizarPresupuesto,
    obtenerPartidasAgregadas,
    obtenerConceptos,
    actualizarConcepto,
    actualizarPartida,
    eliminarConcepto,
    eliminarPartida
};
