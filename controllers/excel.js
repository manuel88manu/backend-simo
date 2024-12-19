const fs = require('fs');
const path = require('path');
const XlsxPopulate = require('xlsx-populate'); // Usar la librería xlsx-populate
const express = require('express');

const crearCedula = async (req, res = express.response) => {
    try {
        const { obra, dictamen, Cedula } = req.body;

 
        const workbook = await XlsxPopulate.fromBlankAsync();

        const sheet = workbook.addSheet('Cedula de Registro');


        const styletitulo = { 
            bold: true, 
            fontSize: 14,
            fontFamily:'Century Gothic',
            horizontalAlignment:'center'	
        } 

        const styleenvabe = { 
            bold: true, 
            fontSize: 14,
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
        
        const prog=sheet.cell('A12')
        prog.value('PROGRAMA').style({bold: true, 
            fontSize: 10,
            fontFamily:'Century Gothic',})
        
            const text = `${obra.programa}`;
            const rows = Math.ceil(text.length / 50); // Aproximadamente el número de líneas necesarias si cada línea tiene 50 caracteres
            sheet.row(12).height(rows * 15); // Ajusta la altura de la fila 11 en función del número de líneas (multiplicado por un valor que determine el alto por línea)
            
            const progval = sheet.range('B12:E12');
            progval.merged(true).value(text).style({
                fontSize: 10,
                fontFamily: 'Century Gothic',
                wrapText: true // Establece el ajuste de texto
            });
        
       


        const directoryPath = path.join(__dirname, 'files');

        // Verifica si el directorio existe, si no, lo crea
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Sanitize `obra.num_obra` para que sea un nombre de archivo válido
        const sanitizedObraNum = obra.num_obra.replace(/[\/\\?%*:|"<>\.]/g, '-'); // Reemplaza caracteres no permitidos por guion

        // Ruta para guardar el archivo Excel
        const filePath = path.join(directoryPath, `CedulaRegistro-${sanitizedObraNum}.xlsx`);

        // Guardar el archivo Excel usando XlsxPopulate
        await workbook.toFileAsync(filePath);

        // Enviar el archivo al cliente para que lo descargue
        res.download(filePath, `CedulaRegistro-${sanitizedObraNum}.xlsx`, (err) => {
            if (err) {
                console.error('Error enviando el archivo:', err);
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            ok: false,
            msg: 'Error en la creación del archivo.',
        });
    }
};

module.exports = {
    crearCedula
};
