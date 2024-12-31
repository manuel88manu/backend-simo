const getCurrentDateTime = () => {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Mes empieza en 0
    const day = String(now.getDate()).padStart(2, "0");
  
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };


const keyToName = {
  acta_apoyo_inv: 'Acta de Apoyo a la Inversion',
  ced_regi_obra: 'Cedula de Registro de Obra',
  explo_insu: 'Explosion de Insumos',
  cro_micro: 'Croquis de Microlocalizacion',
  res_eje_pro: 'Resumen Ejecutivo del Proyecto',
  val_dic_fac: 'Validación de Dictamen de Factibilidad',
  num_gene_obra: 'Numeros Generadores de Obras',
  dic_imp_amb: 'Dictamen sobre Impacto Ambiental',
  memo_des: 'Memoria Descriptiva',
  planeria: 'Planería',
  acta_dona_prop: 'Acta de Donación o Propiedad de Terreno',
  memo_cal: 'Memoria de Calculo',
  esp_tec: 'Especificaciones Tecnicas',
  cal_fis_finan: 'Calendarizacion Fisica Financiera',
  cro_macro: 'Croquis de Macrolocalizacion',
  acta_acep_bene: 'Acta de Aceptación de la Comunidad Beneficiada',
  soli_obra_bene: 'Solicitud de obra de los Beneficiarios',
  gas_indir: 'Gastos Indirectos',
  fotografias_est: 'Fotografías del Estado Actual',
  presu_obra: 'Presupuesto de Obra',
  tar_pre_uni: 'Tarjetas de Precios Unitarios',
};

const validarExpediente = (obj) => {
  let mensaje = 'EXPEDIENTE TECNICO INCOMPLETO FALTA:';

  // Iterar sobre cada entrada del objeto
  Object.entries(obj).forEach(([key, value]) => {
    // Excluir los campos 'idexpediente' y 'obra_idobra'
    if (key !== 'idexpediente' && key !== 'obra_idobra') {
      // Si el valor es vacío, añadir a la lista de faltantes
      if (value === '') {
        mensaje += `\n- ${keyToName[key]}`;
      }
    }
  });

  // Si no hay faltantes, devolver vacío
  return mensaje === 'EXPEDIENTE TECNICO INCOMPLETO FALTA:' ? '' : mensaje;
};

    const normalizarFecha = (fecha) => {
        return {
            year: fecha.getFullYear(), // Usa getFullYear() para la fecha local
            month: fecha.getMonth(), // Usa getMonth() para la fecha local
            day: fecha.getDate() // Usa getDate() para la fecha local
        };
    };


const normalizaHoy = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};


  module.exports={
    getCurrentDateTime,validarExpediente,normalizarFecha,normalizaHoy
  }