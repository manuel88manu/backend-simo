const { check, validationResult } = require('express-validator');
const currentYear = new Date().getFullYear();
// Middleware de validación
const validarNuevaObrayDicatamen = [
    check('Presupuesto_idPresupuesto')
        .notEmpty().withMessage('El ID del presupuesto es obligatorio'),

    check('obra.nombre')
        .notEmpty().withMessage('El nombre es obligatorio')
        .isString().withMessage('El nombre debe ser un texto'),

    check('obra.bene_unidad')
        .notEmpty().withMessage('La unidad de beneficio es obligatoria')
        .isString().withMessage('La unidad de beneficio debe ser un texto'),

    check('obra.subprograma')
        .notEmpty().withMessage('El subprograma es obligatorio')
        .isString().withMessage('El subprograma debe ser un texto'),

    check('obra.programa')
        .notEmpty().withMessage('El programa es obligatorio')
        .isString().withMessage('El programa debe ser un texto'),

    check('obra.empleo_event')
        .isInt({ min: 0 }).withMessage('El empleo por evento debe ser un número entero positivo'),

    check('obra.presupuesto')
        .isFloat({ min: 0 }).withMessage('El presupuesto debe ser un número positivo'),

    check('obra.bene_cantidad')
        .isInt({ min: 1 }).withMessage('La cantidad de beneficiarios debe ser un número entero positivo mayor a 0'),

    check('obra.cap_cantidad')
        .notEmpty().withMessage('La cantidad es obligatoria') 
        .isFloat({ min: 1 })
        .withMessage('La cantidad debe ser un número flotante mayor a 0'),

    check('obra.cap_unidad')
        .notEmpty().withMessage('La unidad de capacidad es obligatoria')
        .isString().withMessage('La unidad de capacidad debe ser un texto'),

    check('obra.ejecucion')
        .notEmpty().withMessage('La ejecución es obligatoria')
        .isString().withMessage('La ejecución debe ser un texto'),

    check('obra.loca_col')
        .notEmpty().withMessage('La localidad o colonia es obligatoria')
        .isString().withMessage('La localidad o colonia debe ser un texto'),

  check('obra.num_obra')
  .trim()
  .notEmpty().withMessage('El número de obra es obligatorio')
  .isString().withMessage('El número de obra debe ser un texto')
  .matches(/^\d+\/\d+-[P|C][R|P]$/).withMessage('El número de obra debe tener el formato correcto (ej. 24/456-PR o 25/012-CP)'),
        
            // Validaciones para el objeto "dictamen"
            check('dictamen.situacion')
            .notEmpty().withMessage('La situación es obligatoria')
            .isString().withMessage('La situación debe ser un texto'),

        check('dictamen.municipio')
            .notEmpty().withMessage('El municipio es obligatorio')
            .isString().withMessage('El municipio debe ser un texto'),

        check('dictamen.subregion')
            .notEmpty().withMessage('La subregión es obligatoria')
            .isString().withMessage('La subregión debe ser un texto'),

        check('dictamen.capacidad_por')
            .notEmpty().withMessage('La capacidad porcentual es obligatoria')
            .matches(/^\d+%$/).withMessage('La capacidad debe ser un porcentaje válido, e.g., "100%"'),

        check('dictamen.arc_dictamen')
            .optional() // Este campo es opcional, no se validará si no se envía
            .isString().withMessage('El archivo de dictamen debe ser un texto si se proporciona'),

        check('dictamen.fecha_dictamen')
            .optional() // Este campo es opcional
            .isISO8601().withMessage('La fecha del dictamen debe estar en formato válido'),

check('dictamen.fec_inicio')
    .notEmpty().withMessage('La fecha de inicio es obligatoria')
    .isISO8601().withMessage('La fecha de inicio debe estar en formato válido')
    .custom(value => {
        const fechaInicio = new Date(value);
        
        // Asegurarse de que la fecha está en el año correcto (sin la influencia de la zona horaria)
        const year = fechaInicio.getUTCFullYear();
        const currentYear = new Date().getUTCFullYear();

        console.log('Fecha de inicio:', fechaInicio);
        console.log('Año de la fecha de inicio:', year);
        console.log('Año actual:', currentYear);

        if (year !== currentYear) {
            throw new Error(`La fecha de inicio debe pertenecer al año ${currentYear}`);
        }
        return true;
    }),

check('dictamen.fec_termino')
    .notEmpty().withMessage('La fecha de término es obligatoria')
    .isISO8601().withMessage('La fecha de término debe estar en formato válido')
    .custom((value, { req }) => {
        const fechaInicio = new Date(req.body.dictamen.fec_inicio);
        const fechaTermino = new Date(value);

        // Verificar que las fechas sean válidas
        if (isNaN(fechaInicio) || isNaN(fechaTermino)) {
            throw new Error('Las fechas proporcionadas no son válidas');
        }

        // Verificar que término >= inicio
        if (fechaTermino < fechaInicio) {
            throw new Error('La fecha de término no puede ser anterior a la fecha de inicio');
        }

        // Verificar que término esté en el año actual
        const year = fechaTermino.getUTCFullYear();
        const currentYear = new Date().getUTCFullYear();

        if (year !== currentYear) {
            throw new Error(`La fecha de término debe pertenecer al año ${currentYear}`);
        }

        return true;
    }),

        check('dictamen.metas_alc_fechas')
            .notEmpty().withMessage('La fecha de metas alcanzadas es obligatoria')
            .isISO8601().withMessage('La fecha de metas alcanzadas debe estar en formato válido'),

        check('dictamen.meta_porciento')
            .notEmpty().withMessage('El porcentaje de la meta es obligatorio')
            .matches(/^\d+%$/).withMessage('El porcentaje de la meta debe ser válido, e.g., "100%"'),

        check('dictamen.metas_por')
            .notEmpty().withMessage('El porcentaje de metas es obligatorio')
            .matches(/^\d+%$/).withMessage('El porcentaje de metas debe ser válido, e.g., "100%"'),
];

module.exports = { validarNuevaObrayDicatamen };