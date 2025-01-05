const fs = require('fs');
const path = require('path');
const XlsxPopulate = require('xlsx-populate'); // Usar la librería xlsx-populate
const express = require('express');
const { validarExpediente } = require('../helpers/funciones');

const crearCedula = async (req, res = express.response) => {
try {
const { obra, dictamen, Cedula } = req.body;

const rutaDoc = path.join(__dirname, 'files', 'CedulaRegistro-Plantilla.xlsx');

const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
const sheet= workbook.sheet(0)


//const workbook = await XlsxPopulate.fromBlankAsync();
//const sheet = workbook.addSheet('Cedula de Registro');

const styletitulo = { 
bold: true, 
fontSize: 14,
fontFamily:'Century Gothic',
horizontalAlignment:'center'	
} 

const styleenvabe = { 
bold: true, 
fontSize: 12,
fontFamily:'Times New Roman',
horizontalAlignment:'center'	
} 


// Fusionar celdas de A3:K3
sheet.range('A3:I3').merged(true).value('REGISTRO DE OBRAS O ACCIONES').style(styletitulo);

sheet.range('A5:I5').merged(true).value('CÉDULA DE REGISTRO').style(styletitulo);

sheet.range('A7:I7').merged(true).value('DATOS GENERALES').style(styleenvabe);

const rangoAzul= sheet.range('A7:I7');
rangoAzul.style("fill",{ type: "solid", color: "ADD8E6" })

const depenEje= sheet.range('A10:B10').value('DEPENDENCIA EJECUTORA').style({bold: true, 
fontSize: 10,
fontFamily:'Century Gothic',})

depenEje.merged(true)

const textLength = "DEPENDENCIA EJECUTORA".length;
sheet.column("A").width(textLength * 1.2); // Ajusta el factor según el tamaño del texto    
sheet.column("B").width(60 / 7);

const ayunta= sheet.range('C10:E10')
ayunta.merged(true).value('XLIII AYUNTAMIENTO DE XALISCO').style({
        fontSize: 10,
        fontFamily:'Century Gothic',})
ayunta.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

const prog = sheet.cell('A11');
prog.value('PROGRAMA').style({
  bold: true,
  fontSize: 10,
  fontFamily: 'Century Gothic',
});

const text = `${obra.programa}`;

// Dimensiones del rango combinado
const totalColumns = 4; // Número de columnas combinadas (B11:E11 = 4 columnas)
const columnanch = 10; // Ancho promedio de cada columna en caracteres
const combinedWidth = totalColumns * columnanch; // Ancho total del rango combinado

// Estimación de líneas necesarias
const lines = Math.ceil(text.length / combinedWidth);

// Altura necesaria para la fila
const estimatedLineHeight = 15; // Altura estimada por línea
const requiredHeight = lines * estimatedLineHeight; // Altura total necesaria
sheet.row(11).height(requiredHeight); // Ajustar la altura de la fila

// Configuración del rango combinado y estilos
const progval = sheet.range('B11:E11');
progval.merged(true).value(text).style({
  fontSize: 10,
  fontFamily: 'Century Gothic',
  wrapText: true, // Asegura que el texto se ajuste dentro de las celdas combinadas
});

// Bordes
progval.style({
  border: {
    bottom: { style: "thin", color: "000000" },
  },
});

//------------Subprograma------------------

const subprog = sheet.cell('A12');
subprog.value('SUBPROGRAMA').style({
  bold: true,
  fontSize: 10,
  fontFamily: 'Century Gothic',
});

const textsub = `${obra.subprograma}`;

// Dimensiones del rango combinado
const totalColumnsSub = 4; // Número de columnas combinadas (B12:E12 = 4 columnas)
const columnWidthSub = 10; // Ancho promedio de cada columna en caracteres
const combinedWidthSub = totalColumnsSub * columnWidthSub; // Ancho total del rango combinado

// Estimación de líneas necesarias
const linesSub = Math.ceil(textsub.length / combinedWidthSub);

// Altura necesaria para la fila
const estimatedLineHeightSub = 15; // Altura estimada por línea
const requiredHeightSub = linesSub * estimatedLineHeightSub; // Altura total necesaria
sheet.row(12).height(requiredHeightSub); // Ajustar la altura de la fila

// Configuración del rango combinado y estilos
const subprogval = sheet.range('B12:E12');
subprogval.merged(true).value(textsub).style({
  fontSize: 10,
  fontFamily: 'Century Gothic',
  wrapText: true, // Asegura que el texto se ajuste dentro de las celdas combinadas
});

// Bordes
subprogval.style({
  border: {
    bottom: { style: "thin", color: "000000" },
  },
});

//---------------Claves Estadisticas----------------
const estitu= sheet.range('G12:I12')
estitu.merged(true).value('CLAVES GEOESTADISTICAS (INEGI)').style({
bold: true,
fontSize: 10,
fontFamily:'Century Gothic',})

const estado= sheet.cell('G13')
estado.value('ESTADO').style({
bold: true,
fontSize: 10,
fontFamily:'Century Gothic',})

const estadoTXT= sheet.range('H13:I13')
estadoTXT.merged(true).value('18 NAYARIT').style({
fontSize: 10,
fontFamily:'Century Gothic',})
estadoTXT.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 


const municipio= sheet.cell('G14')
municipio.value('MUNICIPIO').style({
bold: true,
fontSize: 10,
fontFamily:'Century Gothic',})

const municipiotxt= sheet.range('H14:I14')
municipiotxt.merged(true).value('008 XALISCO').style({
fontSize: 10,
fontFamily:'Century Gothic',})
municipiotxt.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

const localidad= sheet.cell('G15')
localidad.value('LOCALIDAD').style({
bold: true,
fontSize: 10,
fontFamily:'Century Gothic',})
const localidadTXT= sheet.range('H15:I15')
localidadTXT.merged(true).value(`${Cedula.localidad.toUpperCase()}`).style({
fontSize: 10,
fontFamily:'Century Gothic',})
localidadTXT.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

//---------------COORDENADAS----------------
const coorde=sheet.range('A14:E14')
coorde.merged(true).value("COORDENADAS GEOGRAFICAS (Grados °, Minutos ', Segundos'')").style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',})

const latitud=sheet.cell('A15')
latitud.value("LATITUD").style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',})

const latitudTEXT=sheet.range('B15:E15')
latitudTEXT.merged(true).value(`${Cedula.latitud}`).style({
fontSize: 10,
fontFamily:'Century Gothic',})
latitudTEXT.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

const longitud=sheet.cell('A16')
longitud.value("LONGITUD").style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',})

const longitudTEXT=sheet.range('B16:E16')
longitudTEXT.merged(true).value(`${Cedula.longitud}`).style({
fontSize: 10,
fontFamily:'Century Gothic',})
longitudTEXT.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

//------------------Nombre de obra ---------------
const nombreobra=sheet.range('A18:B18')
nombreobra.merged(true).value("NOMBRE DE OBRA").style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',})


const nombreString=`${obra.nombre}`
const rownom = Math.ceil(nombreString.length / 50); // Aproximadamente el número de líneas necesarias si cada línea tiene 50 caracteres
sheet.row(18).height(rownom * 15); 

const nombreobratxt=sheet.range('C17:I18')
nombreobratxt.merged(true).value(`${obra.nombre}`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
wrapText: true })
nombreobratxt.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

//------------------Costo total de la obra ---------------
const costoobra=sheet.range('A19:B19')
costoobra.merged(true).value("COSTO TOTAL DE LA OBRA").style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',})

const costoobratxt=sheet.range('D19:E19')
costoobratxt.merged(true).value(obra.presupuesto).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
numberFormat: '$#,##0.00'})

costoobratxt.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 


//--------------------INVERSION---------------------------
const fecha= new Date()
const año= fecha.getFullYear()
const invertit=sheet.range('A23:I23')
invertit.merged(true).value(`INVERSIÓN ${año}`).style({
bold:true,
fontSize: 12,
fontFamily:'Times New Roman',
horizontalAlignment:'center'
})

invertit.style("fill",{ type: "solid", color: "ADD8E6" })

const fededire=sheet.range('C25:D25')
fededire.merged(true).value(`FEDERAL DIRECTA`).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
})

const estatal=sheet.cell('C26')
estatal.value(`ESTATAL`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const estatalmonto=sheet.range('D26:E26')
estatalmonto.merged(true).value(0).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
numberFormat: '$#,##0.00'})
estatalmonto.style({border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },

}
}) 


const textmunici = `MUNICIPAL 100%`;
const averageCharWidth = 1.2;
const columnWidth = Math.ceil(textmunici.length * averageCharWidth); 
sheet.column('C').width(columnWidth);

const munici=sheet.cell('C27')
munici.value(`MUNICIPAL 100%`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const municimonto=sheet.range('D27:E27')
municimonto.merged(true).value(obra.presupuesto).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
numberFormat: '$#,##0.00'})
municimonto.style({border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },

}
}) 

const otrosbene=sheet.cell('C28')
otrosbene.value(`BENEF  Y/O  OTROS`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const total=sheet.cell('C29')
total.value(`TOTAL:`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const totalmonto=sheet.range('D29:E29')
totalmonto.merged(true).value(obra.presupuesto).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
numberFormat: '$#,##0.00'})
totalmonto.style({border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },

}
}) 


const federal=sheet.cell('G26')
federal.value(`FEDERAL`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const federalmonto=sheet.cell('H26')
federalmonto.value(0).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
numberFormat: '$#,##0.00'})
federalmonto.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

//------------------- METAS------------------------

const metas=sheet.range('A33:I33')
metas.merged(true).value(`METAS`).style({
bold:true,
fontSize: 12,
fontFamily:'Times New Roman',
horizontalAlignment:'center'
})

metas.style("fill",{ type: "solid", color: "ADD8E6" })

const capac=sheet.range('A36:E36')
capac.merged(true).value(`CAPACIDAD`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

capac.style({border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
}
}) 


const unimed=sheet.range('A38:B38')
unimed.merged(true).value(`UNIDAD DE MEDIDA`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const unimedtext=sheet.cell('D38')
unimedtext.value(`${obra.cap_unidad}`).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

unimedtext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const canticap=sheet.range('A39:B39')
canticap.merged(true).value(`CANTIDAD TOTAL DEL PROYECTO`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const canticaptext=sheet.cell('D39')
canticaptext.value(obra.cap_cantidad).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
numberFormat: '#,##0.00'
})

canticaptext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const cantitotalcap=sheet.range('A40:B40')
cantitotalcap.merged(true).value(`CANTIDAD TOTAL DEL AÑO`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const cantitotalcaptext=sheet.cell('D40')
cantitotalcaptext.value(obra.cap_cantidad).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
numberFormat: '#,##0.00'
})

cantitotalcaptext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const fisicalca=sheet.range('A41:C41')
fisicalca.merged(true).value(`AVANCE FÍSICO ALCANZADO AL 01/XII/${año}`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const fisicalcatext=sheet.cell('E41')
fisicalcatext.value(0).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
numberFormat: '0%'
})

fisicalcatext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const fisiprogra=sheet.range('A42:C42')
fisiprogra.merged(true).value(`AVANCE FÍSICO PROGRAMADO AL 31/XII/${año}`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const fisiprogratext=sheet.cell('E42')
fisiprogratext.value(1).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
numberFormat: '0%'
})

fisiprogratext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const modaeje=sheet.range('A44:B44')
modaeje.merged(true).value(`MODALIDAD DE EJECUCIÓN`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const modaejetext=sheet.range('D44:E44')
modaejetext.merged(true).value(`${obra.ejecucion}`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
})

modaejetext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const bene=sheet.range('G36:I36')
bene.merged(true).value(`BENEFICIOS:`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

bene.style({border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
}
}) 

const tipobe=sheet.cell('G38')
tipobe.value(`TIPO`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const tipobetext=sheet.cell('I38')
tipobetext.value(`${obra.bene_unidad}`).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
})

tipobetext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const numeben=sheet.cell('G39')
numeben.value(`NÚMERO`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const numebentext=sheet.cell('I39')
numebentext.value(obra.bene_cantidad).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
})

numebentext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const linea=sheet.cell('I41')
linea.value('').style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
})

linea.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const period=sheet.range('G42:H42')
period.merged(true).value(`PERÍODO DE EJECUCIÓN:`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

const inicio=sheet.cell('G43')
inicio.value('INICIO').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const iniciotext=sheet.cell('I43')
iniciotext.value(new Date(dictamen.fec_inicio).toLocaleDateString('es-ES')).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

iniciotext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const termino=sheet.cell('G44')
termino.value('TERMINO').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const terminotext=sheet.cell('I44')
terminotext.value(new Date(dictamen.fec_termino).toLocaleDateString('es-ES')).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

terminotext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const calendar=sheet.range('G45:H45')
calendar.merged(true).value('DIAS CALENDARIO').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

//--------------------------------

const fec_inicio = dictamen.fec_inicio; // Por ejemplo: '2024-12-01'
const fec_termino = dictamen.fec_termino; // Por ejemplo: '2024-12-19'

// Crear objetos Date a partir de las fechas
const startDate = new Date(fec_inicio);
const endDate = new Date(fec_termino);

// Calcular la diferencia en milisegundos
const differenceInMilliseconds = endDate - startDate;

// Convertir los milisegundos a días (1 día = 86400000 milisegundos)
const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

// Redondear el resultado al número entero más cercano
const totalDays = Math.round(differenceInDays);


const calendartext=sheet.cell('I45')
calendartext.value(`${totalDays} DIAS`).style({
bold:false,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

calendartext.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

//------------------TIPO DE OBRA -------------------------
const tipobr=sheet.range('A48:I48')
tipobr.merged(true).value(`TIPO DE OBRA:`).style({
bold:true,
fontSize: 12,
fontFamily:'Times New Roman',
horizontalAlignment:'center'
})

tipobr.style("fill",{ type: "solid", color: "ADD8E6" })

const nueva=sheet.cell('A50')
nueva.value(`NUEVA`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const nuevatxt=sheet.cell('C50')
nuevatxt.value(Cedula.tipo==='nueva'?'X':'').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

nuevatxt.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const rea=sheet.cell('A51')
rea.value(`REHABILITACIÓN`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const reatxt=sheet.cell('C51')
reatxt.value(Cedula.tipo==='rehabilitacion'?'X':'').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

reatxt.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 

const ampli=sheet.cell('A52')
ampli.value(`AMPLIACION`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const amplitxt=sheet.cell('C52')
amplitxt.value(Cedula.tipo==='ampliacion'?'X':'').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

amplitxt.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const proceso=sheet.range('E50:F50')
proceso.merged(true).value(`EN PROCESO`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})


const procesotxt=sheet.cell('G50')
procesotxt.value('').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

procesotxt.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


const comple=sheet.range('E51:F51')
comple.merged(true).value(`COMPLEMENTARIA`).style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
})

const completxt=sheet.cell('G51')
completxt.value('').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'center'
})

completxt.style({border: {
bottom: { style: "thin", color: "000000" }
}
}) 


///------------------DESCRIPCION---------------------

const des=sheet.range('A58:I58')
des.merged(true).value(`DESCRIPCIÓN DEL PROYECTO`).style({
bold:true,
fontSize: 12,
fontFamily:'Times New Roman',
horizontalAlignment:'center'
})

des.style("fill",{ type: "solid", color: "ADD8E6" })

const descrip = sheet.range('A59:I72');
descrip.merged(true).value(`${Cedula.descrip}`).style({
bold: false,
fontSize: 10,
fontFamily: 'Century Gothic',
wrapText: true,
horizontalAlignment: 'center',  // Alineación horizontal centrada
verticalAlignment: 'center'     // Alineación vertical centrada
});

descrip.style({
border: {
bottom: { style: "thin", color: "000000" }
}
});


//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Sanitize `obra.num_obra` para que sea un nombre de archivo válido
const sanitizedObraNum = obra.num_obra.replace(/[\/\\?%*:|"<>\.]/g, '-'); // Reemplaza caracteres no permitidos por guion

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Cedula_${Date.now()}.xlsx`);


// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

//------------Agregar Logos----------------------

// Enviar el archivo al cliente para que lo descargue
res.download(filePath, `CedulaRegistro.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {
      
        } else {

        }
    });
});

} catch (error) {
console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});
}
};

const crearRegistro=async (req, res = express.response) => {
try {

const {obra,registro}=req.body
const rutaDoc = path.join(__dirname, 'files', 'Solicitud de Obra Plantilla.xlsx');
const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
const sheet= workbook.sheet(0)

//----------------------FECHA------------------------
const meses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const fechaHoy = new Date();
const dia = fechaHoy.getDate(); // Día del mes
const mes = meses[fechaHoy.getMonth()]; // Nombre del mes
const año = fechaHoy.getFullYear(); // Año actual

const fecha=sheet.range('E7:H7')
fecha.value(`XALISCO, NAYARIT A ${dia} DE ${mes.toUpperCase()} DE ${año}`)

//---------------Nombre de obra-------------------
const nombre=sheet.range('A21:H26')
nombre.value(`${obra.nombre.toUpperCase()}`)

//---------------Nombre de representante-------------------
const represe=sheet.range('C45:F45')
represe.value(`${registro.nombre.toUpperCase()}`)

//---------------area-------------------
const area=sheet.range('C46:F46')
area.value(`${registro.area.toUpperCase()}`).style({
})

//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}


// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Solicitud_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

//------------Agregar Logos----------------------

// Enviar el archivo al cliente para que lo descargue
res.download(filePath, `solicitud.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});

} catch (error) {
  console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});  
}

}
const crearComuniActa=async (req, res = express.response) => {
try {

const {obra,comunidad}=req.body
const rutaDoc = path.join(__dirname, 'files', 'Acta De Aceptacion Comunidad.xlsx');
const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
const sheet= workbook.sheet(0)

const nombre= sheet.range('G7:K7')
nombre.merged(true).value(`${comunidad.nombre.toUpperCase()}`).style({
horizontalAlignment: 'left',  // Alineación horizontal centrada
});

const zona= sheet.range('O7:U7')
zona.merged(true).value(`${comunidad.zona.toUpperCase()}`).style({
horizontalAlignment: 'left',  // Alineación horizontal centrada

});

const obranom= sheet.range('C10:V13')
obranom.value(`${obra.nombre.toUpperCase()}`)

const caracteris= sheet.range('C17:V27')
caracteris.value(`${comunidad.caracter.toUpperCase()}`)

const nomrepre= sheet.range('C44:L44')
nomrepre.value(`${comunidad.represe.toUpperCase()}`)

const area= sheet.range('C45:L46')
area.value(`${comunidad.area.toUpperCase()}`).style({wrapText: true})


//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Comunidad_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

res.download(filePath, `acta_comunidad.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});

} catch (error) {
console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});  
}
}

const crearFactibilidad=async (req, res = express.response) => {
try {

const {obra,validacion}=req.body
const rutaDoc = path.join(__dirname, 'files', 'Factibilidad Plantilla.xlsx');
const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
const sheet= workbook.sheet(0)

const obranom= sheet.range('B11:H13')
obranom.value(`${obra.nombre.toUpperCase()}`)

const nomper= sheet.range('B29:D29')
nomper.value(`${validacion.nombre.toUpperCase()}`)

const cargo= sheet.range('B30:D30')
cargo.value(`${validacion.cargo.toUpperCase()}`)

const fechadic=new Date()
const formattedDate = `${fechadic.getDate().toString().padStart(2, '0')}/${
  (fechadic.getMonth() + 1).toString().padStart(2, '0')
}/${fechadic.getFullYear()}`;

const fecha=sheet.range('F32:H32')
fecha.value(formattedDate)

const opinion=sheet.range('B37:H49')
opinion.value(validacion.opinion.toUpperCase())
 

//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Factibilidad_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

res.download(filePath, `validacion.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});

} catch (error) {
console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});      
}
}

const crearInversion=async (req, res = express.response) => {
try {
    const {obra,apoyo}=req.body    
    const rutaDoc = path.join(__dirname, 'files', 'Acta Apoyo a la Inversion Plantilla.xlsx');
    const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
    const sheet= workbook.sheet(0)

    const obranom= sheet.range('B33:G39')
    obranom.value(obra.nombre.toUpperCase())

    const nombrecom= sheet.range('A45:H45')
    nombrecom.value(apoyo.nombre.toUpperCase())

    const cargo=sheet.range('D46:F46')
    cargo.value(apoyo.cargo.toUpperCase())

    //-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Inversion_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);
res.download(filePath, `inversion.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});

 
} catch (error) {
 console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});      
}

}

const crearCalendario=async (req, res = express.response) => {
try {

   const {obra,dictamen,meses,partidas,info}=req.body
   const rutaDoc = path.join(__dirname, 'files', 'Calendario Plantilla.xlsx');
   const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
   const sheet= workbook.sheet(0)



const año= sheet.range(`B3:U3`)
año.value(`DE OBRA O ACCIÓN ${new Date().getFullYear()}`)

const nombreObra= sheet.range('C7:J8')
nombreObra.value(obra.nombre.toUpperCase())

const inicio= sheet.range('O6:S6')
inicio.value(new Date(dictamen.fec_inicio).toLocaleDateString('es-ES'))

const termino= sheet.range('O7:S7')
termino.value(new Date(dictamen.fec_termino).toLocaleDateString('es-ES'))

//--------------------------------

const fec_inicio = dictamen.fec_inicio; // Por ejemplo: '2024-12-01'
const fec_termino = dictamen.fec_termino; // Por ejemplo: '2024-12-19'

// Crear objetos Date a partir de las fechas
const startDate = new Date(fec_inicio);
const endDate = new Date(fec_termino);

// Calcular la diferencia en milisegundos
const differenceInMilliseconds = endDate - startDate;

// Convertir los milisegundos a días (1 día = 86400000 milisegundos)
const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

// Redondear el resultado al número entero más cercano
const totalDays = Math.round(differenceInDays);


const diasTotal=sheet.range('O8:S8')
diasTotal.value(`${totalDays} DIAS`)


const local= sheet.range('D10:E10')
local.value(info.localidad.toUpperCase())

//-------PARTIDAS Y MONTO CON IVA-----------------

const resultado = partidas.map(partida => [partida.nombre_par, parseFloat((partida.monto_tot * 1.16).toFixed(2))]);

let fila=17

const valores = Object.values(meses); 
const tamaño=resultado.length

for (let i = 0; i < resultado.length; i++) {

//---------------ALTURA NOMBRE PARTIDAS----------------------------------
const text = resultado[i][0];
const combinedWidth = 30; // Ancho total del rango combinado
// Estimación de líneas necesarias
const lines = Math.ceil(text.length / combinedWidth);
// Altura necesaria para la fila
const estimatedLineHeight = 15; // Altura estimada por línea
const requiredHeight = lines * estimatedLineHeight; // Altura total necesaria
sheet.row(fila).height(requiredHeight); // Ajustar la altura de la fila

sheet.range(`B${fila}:D${fila}`).merged(true).value(resultado[i][0]).style({border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined
},
wrapText: true,
}) 

sheet.cell(`E${fila}`).value(resultado[i][1]).style(
{
numberFormat: '$#,##0.00',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
}) 

sheet.cell(`F${fila}`).value((resultado[i][1])/(obra.presupuesto)).style(
{
numberFormat: '0.00%',
horizontalAlignment: 'center',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
}) 

sheet.cell(`G${fila}`).value('PG').style(
{
horizontalAlignment: 'center',  
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
}) 

sheet.cell(`H${fila}`).value(1).style(
{
horizontalAlignment: 'center',  
numberFormat: '#,##0.00',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//-------------------Enero-------------------------

sheet.cell(`I${fila}`).value(
"enero" in meses?(sheet.cell(`F${fila}`).value()*(meses.enero/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Febrero-------------------

sheet.cell(`J${fila}`).value(
"febrero" in meses?(sheet.cell(`F${fila}`).value()*(meses.febrero/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Marzo-------------------

sheet.cell(`K${fila}`).value(
"marzo" in meses?(sheet.cell(`F${fila}`).value()*(meses.marzo/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Abril------------------

sheet.cell(`L${fila}`).value(
"abril" in meses?(sheet.cell(`F${fila}`).value()*(meses.abril/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Mayo------------------

sheet.cell(`M${fila}`).value(
"mayo" in meses?(sheet.cell(`F${fila}`).value()*(meses.mayo/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Junio------------------

sheet.cell(`N${fila}`).value(
"junio" in meses?(sheet.cell(`F${fila}`).value()*(meses.junio/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Julio------------------

sheet.cell(`O${fila}`).value(
"julio" in meses?(sheet.cell(`F${fila}`).value()*(meses.julio/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Agosto------------------

sheet.cell(`P${fila}`).value(
"agosto" in meses?(sheet.cell(`F${fila}`).value()*(meses.agosto/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Septiembre------------------

sheet.cell(`Q${fila}`).value(
"septiembre" in meses?(sheet.cell(`F${fila}`).value()*(meses.septiembre/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Octubre------------------

sheet.cell(`R${fila}`).value(
"octubre" in meses?(sheet.cell(`F${fila}`).value()*(meses.octubre/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Noviembre------------------

sheet.cell(`S${fila}`).value(
"noviembre" in meses?(sheet.cell(`F${fila}`).value()*(meses.noviembre/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------Diciembre------------------

sheet.cell(`T${fila}`).value(
"diciembre" in meses?(sheet.cell(`F${fila}`).value()*(meses.diciembre/100)):''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})

//----------------TOTALES------------------

sheet.cell(`U${fila}`).value(
(sheet.cell(`F${fila}`).value())
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: i===tamaño-1 ? { style: "thin", color: "000000" } : undefined

}
})


fila=fila+1

}

//-------------Agragar Totales------------------------

const total=sheet.cell(`D${fila}`)
total.value('TOTAL').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right'
})

const presutot=sheet.cell(`E${fila}`)
presutot.value(obra.presupuesto).style({
bold:true,
fontSize: 10,
numberFormat: '$#,##0.00',
fontFamily:'Century Gothic',
horizontalAlignment:'right',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})
presutot.style("fill",{ type: "solid", color: "D8D8D8" })


const totalpor=sheet.cell(`F${fila}`)
totalpor.value(1).style({
bold:true,
fontSize: 10,
numberFormat: '0.00%',
fontFamily:'Century Gothic',
horizontalAlignment:'center',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})
totalpor.style("fill",{ type: "solid", color: "D8D8D8" })

//---------Total Pocentajes-------------------

//------PorTotal enero-----------

sheet.cell(`I${fila}`).value(
"enero" in meses?(meses.enero)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})


//------PorTotal febrero-----------

sheet.cell(`J${fila}`).value(
"febrero" in meses?(meses.febrero)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal marzo-----------

sheet.cell(`K${fila}`).value(
"marzo" in meses?(meses.marzo)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal abril-----------

sheet.cell(`L${fila}`).value(
"abril" in meses?(meses.abril)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal mayo-----------

sheet.cell(`M${fila}`).value(
"mayo" in meses?(meses.mayo)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal junio-----------

sheet.cell(`N${fila}`).value(
"junio" in meses?(meses.junio)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal julio-----------

sheet.cell(`O${fila}`).value(
"julio" in meses?(meses.julio)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal agosto-----------

sheet.cell(`P${fila}`).value(
"agosto" in meses?(meses.agosto)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal septiembre-----------

sheet.cell(`Q${fila}`).value(
"septiembre" in meses?(meses.septiembre)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal octubre-----------

sheet.cell(`R${fila}`).value(
"octubre" in meses?(meses.octubre)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal noviembre-----------

sheet.cell(`S${fila}`).value(
"noviembre" in meses?(meses.noviembre)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------PorTotal diciembre-----------

sheet.cell(`T${fila}`).value(
"diciembre" in meses?(meses.diciembre)/100:''
).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//------TOTAL FINAL-----------

sheet.cell(`U${fila}`).value(1).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})

//------Encargado-----------------
const varenc= fila+4

const nombrecargo=sheet.range(`E${varenc}:H${varenc}`)
nombrecargo.merged(true).value(info.nombre.toUpperCase()).style({
bold:true,
fontSize: 9,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
border: {
bottom: { style: "thin", color: "000000" } 
}
}
)

const puestocargo=sheet.range(`E${varenc+1}:H${varenc+1}`)
puestocargo.merged(true).value(info.cargo.toUpperCase()).style({
bold:false,
fontSize: 9,
fontFamily:'Century Gothic',
horizontalAlignment:'center',
}
)

//----------------Titulos Avance------
const avanfis=sheet.range(`B${varenc+4}:D${varenc+4}`)
avanfis.merged(true).value('AVANCE FISICO').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)

const avanfinan=sheet.range(`B${varenc+6}:D${varenc+6}`)
avanfinan.merged(true).value('AVANCE FINANCIERO').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)

const parci=sheet.cell(`G${varenc+4}`)
parci.value('PARCIAL%').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)

const acumopor=sheet.cell(`G${varenc+5}`)
acumopor.value('ACUMULADO%').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)

const parcimil=sheet.cell(`G${varenc+6}`)
parcimil.value('PARCIAL (MILES)').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)
const acumil=sheet.cell(`G${varenc+7}`)
acumil.value('ACUMULADO (MILES)').style({
bold:true,
fontSize: 10,
fontFamily:'Century Gothic',
horizontalAlignment:'right',
}
)

const margenran=sheet.range(`H${varenc+4}:H${varenc+7}`)
margenran.style(
{border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
}
}
)

//---------------ACUMULACION---------------

let acufil=varenc+4

for (let i = 0; i < 4; i++) {

if(i===0){
//Enero
sheet.cell(`I${acufil}`).value(sheet.cell(`I${fila}`).value()).style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '0.00%',
})

//febrero
sheet.cell(`J${acufil}`).value(sheet.cell(`J${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//marzo
sheet.cell(`K${acufil}`).value(sheet.cell(`K${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//abril
sheet.cell(`L${acufil}`).value(sheet.cell(`L${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//MAYO
sheet.cell(`M${acufil}`).value(sheet.cell(`M${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//JUNIO
sheet.cell(`N${acufil}`).value(sheet.cell(`N${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//JULIO
sheet.cell(`O${acufil}`).value(sheet.cell(`O${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//AGOSTO
sheet.cell(`P${acufil}`).value(sheet.cell(`P${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//SEPTIEMBRE
sheet.cell(`Q${acufil}`).value(sheet.cell(`Q${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//OCTUBRE
sheet.cell(`R${acufil}`).value(sheet.cell(`R${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//NOVIEMBRE
sheet.cell(`S${acufil}`).value(sheet.cell(`S${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//DICIEMBRE
sheet.cell(`T${acufil}`).value(sheet.cell(`T${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

//TOTALES
sheet.cell(`U${acufil}`).value(sheet.cell(`U${fila}`).value()).style(
{
horizontalAlignment: 'center',  
numberFormat: '0.00%',
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
})

}

if(i===1){
//------------------Enero-------------------------------
let iPrevValue = Number(sheet.cell(`I${acufil - 1}`).value()) || '';
let hCurrentValue = Number(sheet.cell(`H${acufil}`).value()) || '';

let newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`I${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------Febrero-------------------------------
 iPrevValue = Number(sheet.cell(`J${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`I${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`J${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------MARZO-------------------------------
 iPrevValue = Number(sheet.cell(`K${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`J${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`K${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------ABRIL-------------------------------
 iPrevValue = Number(sheet.cell(`L${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`K${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`L${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------MAYO-------------------------------
 iPrevValue = Number(sheet.cell(`M${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`L${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`M${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------JUNIO-------------------------------
 iPrevValue = Number(sheet.cell(`N${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`M${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`N${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------JULIO-------------------------------
 iPrevValue = Number(sheet.cell(`O${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`N${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`O${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------AGOSTO-------------------------------
 iPrevValue = Number(sheet.cell(`P${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`O${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`P${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------SEPTIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`Q${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`P${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`Q${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------OCTUBRE-------------------------------
 iPrevValue = Number(sheet.cell(`R${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`Q${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`R${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------NOVIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`S${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`R${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`S${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------DICIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`T${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`S${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`T${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
    });

//------------------TOTAL-------------------------------
 
sheet.cell(`U${acufil}`)
    .value(1)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '0.00%',
        bold: true, 
    });

}

if(i===2){
//Enero
sheet.cell(`I${acufil}`).value(Number(sheet.cell(`I${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//febrero
sheet.cell(`J${acufil}`).value(Number(sheet.cell(`J${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//MARZO
sheet.cell(`K${acufil}`).value(Number(sheet.cell(`K${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//ABRIL
sheet.cell(`L${acufil}`).value(Number(sheet.cell(`L${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//MAYO
sheet.cell(`M${acufil}`).value(Number(sheet.cell(`M${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//JUNIO
sheet.cell(`N${acufil}`).value(Number(sheet.cell(`N${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//JULIO
sheet.cell(`O${acufil}`).value(Number(sheet.cell(`O${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//AGOSTO
sheet.cell(`P${acufil}`).value(Number(sheet.cell(`P${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//SEPTIEMBRE
sheet.cell(`Q${acufil}`).value(Number(sheet.cell(`Q${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//OCTUBRE
sheet.cell(`R${acufil}`).value(Number(sheet.cell(`R${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//NOVIEMBRE
sheet.cell(`S${acufil}`).value(Number(sheet.cell(`S${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//DICIEMBRE
sheet.cell(`T${acufil}`).value(Number(sheet.cell(`T${acufil-2}`).value()*obra.presupuesto)||'').style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

//TOTAL PRESU
sheet.cell(`U${acufil}`).value(obra.presupuesto).style(
{
border: {
bottom: { style: "thin", color: "000000" },
top: { style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',  
numberFormat: '$#,##0.00'
})

}

if(i===3){
//------------------Enero-------------------------------
let iPrevValue = Number(sheet.cell(`I${acufil - 1}`).value()) || '';
let hCurrentValue = Number(sheet.cell(`H${acufil}`).value()) || '';
let newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`I${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------Febrero-------------------------------
 iPrevValue = Number(sheet.cell(`J${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`I${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`J${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------MARZO-------------------------------
 iPrevValue = Number(sheet.cell(`K${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`J${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`K${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------ABRIL-------------------------------
 iPrevValue = Number(sheet.cell(`L${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`K${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`L${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------MAYO-------------------------------
 iPrevValue = Number(sheet.cell(`M${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`L${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`M${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------JUNIO-------------------------------
 iPrevValue = Number(sheet.cell(`N${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`M${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`N${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------JULIO-------------------------------
 iPrevValue = Number(sheet.cell(`O${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`N${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`O${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------AGOSTO-------------------------------
 iPrevValue = Number(sheet.cell(`P${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`O${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`P${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------SEPTIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`Q${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`P${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`Q${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------OCTUBRE-------------------------------
 iPrevValue = Number(sheet.cell(`R${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`Q${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`R${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------NOVIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`S${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`R${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`S${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------DICIEMBRE-------------------------------
 iPrevValue = Number(sheet.cell(`T${acufil - 1}`).value()) || '';
 hCurrentValue = Number(sheet.cell(`S${acufil}`).value()) || '';

 newIValue = iPrevValue === ''
    ? ''
    : hCurrentValue === ''
    ? iPrevValue
    : iPrevValue + hCurrentValue;

sheet.cell(`T${acufil}`)
    .value(newIValue)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00'
    });

//------------------TOTAL-------------------------------
 
sheet.cell(`U${acufil}`)
    .value(obra.presupuesto)
    .style({
        border: {
            bottom: { style: "thin", color: "000000" },
            top: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
        },
        horizontalAlignment: 'center',
        numberFormat: '$#,##0.00',
        bold: true, 
    });


}

acufil=acufil+1

}


//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Calendario_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

res.download(filePath, `Calendario.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});


} catch (error) {
     console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});  
}

}

const crearDictamen= async (req, res=express.response)=>{
try {

   const {obra,dictamen,partidas,infoexp,expediente,tipo}=req.body
   const rutaDoc = path.join(__dirname, 'files', 'Dictamen Plantilla.xlsx'); 
   const workbook=await XlsxPopulate.fromFileAsync(rutaDoc)
   const sheet= workbook.sheet(0)

 //------------PRIMERA TABLA-------------------------
   const nombreobra= sheet.cell('F8')
   nombreobra.value(obra.nombre.toUpperCase())

   const locali= sheet.cell('S9')
   locali.value(obra.loca_col.toUpperCase())

   const progra=sheet.cell('F11')
   progra.value(obra.programa)

   const subprogra=sheet.cell('F12')
   subprogra.value(obra.subprograma)

//----------------------FECHA------------------------
const meses = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun', 
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

const fechaHoy = new Date();
let dia = fechaHoy.getDate(); // Día del mes
let mes = meses[fechaHoy.getMonth()]; // Nombre del mes
let año = fechaHoy.getFullYear(); // Año actual

const fechadic=sheet.cell('S12')
fechadic.value(`${dia}-${mes}-${año}`)

const fechametas = new Date(dictamen.metas_alc_fechas); // Forzar local time

 dia = fechametas.getDate(); // Día del mes
 mes = meses[fechametas.getMonth()]; // Nombre del mes
 año = fechametas.getFullYear(); // Año actual

const fechadicmet=sheet.cell('S15')
fechadicmet.value(`AL ${dia} DE ${mes.toUpperCase()} ${año}`)

const total= sheet.cell('C16')
total.value(obra.presupuesto)

if(tipo==='odirectas'){
  sheet.cell('K14').value('OBRAS DIRECTAS')
  sheet.cell('K16').value(obra.presupuesto)
}
else if(tipo==='faismun'){
  sheet.cell('K14').value('MUNICIPAL FAISMUN')
  sheet.cell('M16').value(obra.presupuesto)
}
else if(tipo==='fortamun'){
  sheet.cell('K14').value('MUNICIPAL FORTAMUN')
  sheet.cell('M16').value(obra.presupuesto)
}
else if(tipo==='estatal'){
  sheet.cell('J16').value(obra.presupuesto)
}
else{
  sheet.cell('G16').value(obra.presupuesto)
}

const ejecu=sheet.cell('C21')
ejecu.value(obra.ejecucion.toUpperCase())


const fechaini = new Date(dictamen.fec_inicio); // Forzar local time

 dia = fechaini.getDate(); // Día del mes
 mes = meses[fechaini.getMonth()]; // Nombre del mes
 año = fechaini.getFullYear(); // Año actual

const incioFec=sheet.cell('E20')
incioFec.value(`${mes}-${año}`)



const fechafin = new Date(dictamen.fec_termino); // Forzar local time 

 dia = fechafin.getDate(); // Día del mes
 mes = meses[fechafin.getMonth()]; // Nombre del mes
 año = fechafin.getFullYear(); // Año actual

const FinFech=sheet.cell('G20')
FinFech.value(`${mes}-${año}`)

const unicap=sheet.cell('H20')
unicap.value(obra.cap_unidad.toUpperCase())

const cantcap=sheet.cell('J20')
cantcap.value(obra.cap_cantidad)

const unibene=sheet.cell('M20')
unibene.value(obra.bene_unidad.toUpperCase())

const cantbene=sheet.cell('N20')
cantbene.value(obra.bene_cantidad)

const empleo=sheet.cell('P20')
empleo.value(obra.empleo_event)

const resulDic=sheet.cell('Q20')
resulDic.value(infoexp.resultado.toUpperCase())


//----------------------SEGUNDA TABLA---------------------------

//++++++++++++++++++PARTIDAS+++++++++++++++++++++++++++++++++++
const resulPartidas = partidas.map(partida => [partida.nombre_par,partida.monto_tot ]);

let partiVal=25

for (let i = 0; i < resulPartidas.length; i++) {

sheet.range(`C${partiVal}:I${partiVal}`).merged(true).value(resulPartidas[i][0].toUpperCase()).style({bold: true, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
}
}) 

sheet.cell(`J${partiVal}`).value('P.G.').style({bold: false, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',
}) 

sheet.range(`K${partiVal}:L${partiVal}`).merged(true).value(1).style({bold: false, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',
}) 

sheet.cell(`M${partiVal}`).value('P.G.').style({bold: false, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'center',
}) 

sheet.range(`N${partiVal}:O${partiVal}`).merged(true).value(resulPartidas[i][1]).style({bold: false, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
numberFormat: '#,##0.00',
}) 

sheet.cell(`S${partiVal}`).style({bold: false, border: {
right:{ style: "thin", color: "000000" },
}
}) 


partiVal=partiVal+1
}

//++++++++++++++++++++++OBSERVACIONES+++++++++++++++++++++
function calcularColumnasNecesarias(texto, anchoColumna) {
  if (!texto || texto.length === 0) return 1; // Mínimo 1 fila

  // Contar los saltos de línea explícitos
  const lineas = texto.split("\n");
  let totalFilas = 0;

  // Calcular filas necesarias para cada línea
  lineas.forEach(linea => {
    totalFilas += Math.ceil(linea.length / anchoColumna);
  });

  return totalFilas;
}

const anchoColumna = 41.34; 

const expeincom=validarExpediente(expediente)

const StrinObserva=infoexp.observa+'\n'+expeincom

const columnas = calcularColumnasNecesarias(StrinObserva, anchoColumna);


let observaVal=columnas+26

const areaObseva= sheet.range(`P26:S${observaVal}`).merged(true).style({bold: false, border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
},
horizontalAlignment: 'left',
verticalAlignment: 'top', 
wrapText: true
})

areaObseva.value(StrinObserva)

//---------------Firma---------------------------


let mayorValFirma = partiVal >= observaVal+1 ? partiVal : observaVal+1;

const  iniciFir=mayorValFirma;

mayorValFirma=mayorValFirma+1


const dicta= sheet.range(`Q${mayorValFirma}:R${mayorValFirma}`)
dicta.merged(true).value('DICTAMINO').style({bold: true,horizontalAlignment: 'center'})

mayorValFirma=mayorValFirma+3

const firNom= sheet.range(`P${mayorValFirma}:S${mayorValFirma}`)
firNom.merged(true).value(infoexp.nombre.toUpperCase()).style({bold: true,horizontalAlignment: 'center'})


mayorValFirma=mayorValFirma+2

const bordesFirmasiz=sheet.range(`P${iniciFir}:P${mayorValFirma}`)
bordesFirmasiz.style({border: {
left:{ style: "thin", color: "000000" },
}})

const bordesFirmasder=sheet.range(`S${iniciFir}:S${mayorValFirma}`)
bordesFirmasder.style({border: {
right:{ style: "thin", color: "000000" },
}})

const bordesFirmasbajo=sheet.range(`P${mayorValFirma}:S${mayorValFirma}`)
bordesFirmasbajo.style({border: {
top:{ style: "thin", color: "000000" },
}})


///--------------TABLA COMPLETA PARTIDAS -----------------------

const cuadParti=sheet.range(`C${partiVal}:I${mayorValFirma-1}`)
cuadParti.merged(true).style({border: {
bottom:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
}})

const cuadUni=sheet.range(`J${partiVal}:J${mayorValFirma-1}`)
cuadUni.merged(true).style({border: {
bottom:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
}})

const cuadCant=sheet.range(`K${partiVal}:L${mayorValFirma-1}`)
cuadCant.merged(true).style({border: {
bottom:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
}})

const cuadPuni=sheet.range(`M${partiVal}:M${mayorValFirma-1}`)
cuadPuni.merged(true).style({border: {
bottom:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
}})

const cuadImpo=sheet.range(`N${partiVal}:O${mayorValFirma-1}`)
cuadImpo.merged(true).style({border: {
bottom:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
right:{ style: "thin", color: "000000" },
}})

//--------------MONTO CON IVA-----------------------------
const subtotaltex=sheet.cell(`M${mayorValFirma}`)
subtotaltex.value('SUBTOTAL')

const subtotalval=sheet.range(`N${mayorValFirma}:O${mayorValFirma}`)
subtotalval.merged(true).value((obra.presupuesto)/(1.16)).style({
numberFormat: '#,##0.00',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})

const ivatex=sheet.cell(`M${mayorValFirma+1}`)
ivatex.value('I.V.A.')

const ivaval=sheet.range(`N${mayorValFirma+1}:O${mayorValFirma+1}`)
ivaval.merged(true).value((obra.presupuesto)*(0.16 / 1.16)).style({
numberFormat: '#,##0.00',
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})


const totaltex=sheet.cell(`M${mayorValFirma+2}`)
totaltex.value('TOTAL').style({
bold:true})

const totalval=sheet.range(`N${mayorValFirma+2}:O${mayorValFirma+2}`)
totalval.merged(true).value((obra.presupuesto)).style({
numberFormat: '#,##0.00',
bold:true,
border: {
right:{ style: "thin", color: "000000" },
left:{ style: "thin", color: "000000" },
bottom: { style: "thin", color: "000000" } 
}
})

//-----------------ENVIO-------------------------------

const directoryPath = path.join(__dirname, 'files');

// Verifica si el directorio existe, si no, lo crea
if (!fs.existsSync(directoryPath)) {
fs.mkdirSync(directoryPath, { recursive: true });
}

// Ruta para guardar el archivo Excel
const filePath = path.join(directoryPath, `Dictamen_${Date.now()}.xlsx`);

// Guardar el archivo Excel usando XlsxPopulate
await workbook.toFileAsync(filePath);

res.download(filePath, `Calendario.xlsx`, (err) => {
    // Callback que se ejecuta después de que el archivo es descargado o ocurre un error
    if (err) {
        console.error('Error al descargar el archivo:', err);
    }

    // Eliminar el archivo
    fs.unlink(filePath, (deleteErr) => {
        if (deleteErr) {

        } else {
 
        }
    });
});

} catch (error) {
console.log(error);
return res.status(400).json({
ok: false,
msg: 'Error en la creación del archivo.',
});      
}
}

module.exports = {
crearCedula,
crearRegistro,
crearComuniActa,
crearFactibilidad,
crearInversion,
crearCalendario,
crearDictamen
};
