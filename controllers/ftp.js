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

const descargarEnlace = async (req, res = express.response) => { 
  const fileUrl = req.query.url;

  if (!fileUrl) {
    return res.status(400).json({ error: "La URL del archivo es requerida" });
  }

  // Extraer la ruta relativa del archivo
  const ftpPath = fileUrl.replace(`ftp://${ftpConfig.host}`, "");

  const downloadsPath = path.join(__dirname, "downloads");
  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath);
  }

  const localDownloadPath = path.join(
    downloadsPath,
    path.basename(ftpPath)
  );

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // Conexión al servidor FTP
    await client.access(ftpConfig);

    // Descargar el archivo desde el servidor FTP
    console.log("Ruta remota:", ftpPath);
    console.log("Guardando en:", localDownloadPath);
    await client.downloadTo(localDownloadPath, ftpPath);

    // Enviar el archivo descargado al cliente
    res.download(localDownloadPath, (err) => {
      if (err) {
        console.error("Error al enviar el archivo al cliente:", err);
        return res.status(500).json({ error: "Error al enviar el archivo" });
      }
      // Borrar el archivo local después de enviarlo
      fs.unlinkSync(localDownloadPath);
    });
  } catch (error) {
    console.error("Error al procesar la descarga:", error);
    return res.status(500).json({
      ok: false,
      msg: "Algo salió mal.",
      error: error.message,
    });
  } finally {
    // Cerrar la conexión FTP
    client.close();
  }
};

module.exports = {
    subirArchivo,
    guardarEnlace,
    descargarEnlace
}