const fs = require('fs');
const path = require('path');
const XlsxPopulate = require('xlsx-populate'); // Usar la librería xlsx-populate
const express = require('express');
const ExcelJS = require("exceljs");

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

const prog=sheet.cell('A11')
prog.value('PROGRAMA').style({bold: true, 
fontSize: 10,
fontFamily:'Century Gothic',})

const text = `${obra.programa}`;
const rows = Math.ceil(text.length / 50); // Aproximadamente el número de líneas necesarias si cada línea tiene 50 caracteres
sheet.row(11).height(rows * 15); // Ajusta la altura de la fila 11 en función del número de líneas (multiplicado por un valor que determine el alto por línea)

const progval = sheet.range('B11:E11');
progval.merged(true).value(text).style({
fontSize: 10,
fontFamily: 'Century Gothic',
wrapText: true // Establece el ajuste de texto
});

progval.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

//------------Subprograma------------------

const subprog=sheet.cell('A12')
subprog.value('SUBPROGRAMA').style({bold: true, 
fontSize: 10,
fontFamily:'Century Gothic',})

const textsub = `${obra.subprograma}`;
const rowsub = Math.ceil(textsub.length / 50); // Aproximadamente el número de líneas necesarias si cada línea tiene 50 caracteres
sheet.row(12).height(rowsub * 15); // Ajusta la altura de la fila 11 en función del número de líneas (multiplicado por un valor que determine el alto por línea)

const subprogval = sheet.range('B12:E12');
subprogval.merged(true).value(textsub).style({
fontSize: 10,
fontFamily: 'Century Gothic',
wrapText: true // Establece el ajuste de texto
});

subprogval.style({border: {
bottom: { style: "thin", color: "000000" },

}
}) 

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
localidadTXT.merged(true).value(`${Cedula.localidad}`).style({
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
nombre.value(`${obra.nombre}`)

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
area.value(`${comunidad.area.toUpperCase()}`)


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
module.exports = {
crearCedula,
crearRegistro,
crearComuniActa,
crearFactibilidad,
crearInversion
};
