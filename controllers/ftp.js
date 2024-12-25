const express = require('express');
// controllers/ftp.js
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');  // Asegúrate de instalar el paquete `basic-ftp`
const { ftpConfig } = require('../ftpserver/config');
const { body } = require('express-validator');
const { ejecutarConsulta } = require('../database/config');


const subirArchivo = async (req, res = express.response) => {
if (!req.file) {
return res.status(400).json({ 
msg: 'No se ha subido ningún archivo' });
}

let numObra=req.body.num_obra

numObra = numObra.replace(/[\/\\:*?"<>|]/g, '_'); // Sustituye por guion bajo

const localFilePath = req.file.path;  // Ruta del archivo temporal
const remoteFileName = path.basename(req.file.originalname);  // Nombre del archivo remoto
const client = new ftp.Client()
client.ftp.verbose = true;

try {
// Conectar al servidor FTP
await client.access(ftpConfig);

// Crear la carpeta en el servidor FTP si no existe
const remoteFolderPath = `/${numObra}`;
await client.ensureDir(remoteFolderPath); // Crea la carpeta si no existe
await client.cd(remoteFolderPath); // Cambia a la carpeta creada

// Subir el archivo al servidor FTP dentro de la carpeta específica
await client.uploadFrom(localFilePath, `${remoteFolderPath}/${remoteFileName}`);

// Eliminar el archivo local después de la carga
fs.unlinkSync(localFilePath);

// Enviar la URL del archivo subido
res.json({ url: `ftp://${ftpConfig.host}${remoteFolderPath}/${remoteFileName}` });

} catch (error) {
    console.error("Erroor al subir el archivo:", error);
    res.status(500).json({ error: 'Error al subir archivo'}); 
}
finally {
    client.close();  
  }
}

const guardarEnlace = async (req, res = express.response) => {
try {
     
      const {obra,prop,url}=req.body
      
      const query=`UPDATE expediente set ${prop}=? where obra_idobra=?`

      await ejecutarConsulta(query,[url,obra.idobra])

      // Consultar el registro actualizado
      const selectQuery = `SELECT * FROM expediente WHERE obra_idobra = ?`;
      const [registroActualizado] = await ejecutarConsulta(selectQuery, [obra.idobra]);

     
      return res.status(200).json({
        ok: true,
        msg: 'Todo Bien',
        expediente:registroActualizado
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
    subirArchivo,
    guardarEnlace
}