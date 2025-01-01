const express = require('express');
// controllers/ftp.js
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');  // Asegúrate de instalar el paquete `basic-ftp`
const { ftpConfig } = require('../ftpserver/config');
const { body } = require('express-validator');
const { ejecutarConsulta } = require('../database/config');
const archiver = require("archiver");


const subirArchivo = async (req, res = express.response) => {
if (!req.file) {
return res.status(400).json({ 
msg: 'No se ha subido ningún archivo' });
}

let numObra=req.body.num_obra
const uniqueId = req.body.unique_id || 'default'; 

numObra = numObra.replace(/[\/\\:*?"<>|]/g, '_'); // Sustituye por guion bajo

const localFilePath = req.file.path;  // Ruta del archivo temporal
const remoteFileName = `${uniqueId}_#${path.basename(req.file.originalname)}`; // Generar un nombre único para el archivo
const client = new ftp.Client()
client.ftp.verbose = true;

try {
// Conectar al servidor FTP
await client.access(ftpConfig);

// Crear la carpeta en el servidor FTP si no existe
const remoteFolderPath = `/${numObra}`;
await client.ensureDir(remoteFolderPath); // Crea la carpeta si no existe
await client.cd(remoteFolderPath); // Cambia a la carpeta creada

// Buscar y eliminar archivos relacionados con el identificador único
const fileList = await client.list(remoteFolderPath);
const filesToDelete = fileList.filter(file => file.name.startsWith(`${uniqueId}_`));

for (const file of filesToDelete) {
    await client.remove(`${remoteFolderPath}/${file.name}`);
    console.log(`Archivo eliminado: ${remoteFolderPath}/${file.name}`);
}


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
      
      let resul={}

      if(prop!='arc_dictamen'){
      const query=`UPDATE expediente set ${prop}=? where obra_idobra=?`

      await ejecutarConsulta(query,[url,obra.idobra])

      // Consultar el registro actualizado
      const selectQuery = `SELECT * FROM expediente WHERE obra_idobra = ?`;
      const [registroActualizado] = await ejecutarConsulta(selectQuery, [obra.idobra]);
      resul={expediente:registroActualizado}
     }else{
      const query=`UPDATE dictamen set ${prop}=? where obra_idobra=?`

      await ejecutarConsulta(query,[url,obra.idobra])

      // Consultar el registro actualizado
      const selectQuery = `SELECT * FROM dictamen WHERE obra_idobra = ?`;
      const [registroActualizado] = await ejecutarConsulta(selectQuery, [obra.idobra]);
      resul={dictamen:registroActualizado}            
     
     }
      return res.status(200).json({
        ok: true,
        msg: 'Todo Bien',
        resultado:resul
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

const descargarCarpeta = async (req, res = express.response) => {
  const folderUrl = req.query.url;

  if (!folderUrl) {
    return res.status(400).json({ error: "La URL de la carpeta es requerida" });
  }

  // Extraer la ruta relativa de la carpeta
  const ftpFolderPath = folderUrl.replace(`ftp://${ftpConfig.host}`, "").replace(/\/$/, "");
  console.log(ftpFolderPath);

  const downloadsPath = path.join(__dirname, "downloads");

  if (!fs.existsSync(downloadsPath)) {
    fs.mkdirSync(downloadsPath);
  }

  const localFolderPath = path.join(downloadsPath, path.basename(ftpFolderPath));

  // Crear la carpeta local donde se guardarán los archivos
  if (!fs.existsSync(localFolderPath)) {
    fs.mkdirSync(localFolderPath);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // Conexión al servidor FTP
    await client.access(ftpConfig);

    // Función recursiva para descargar los archivos de la carpeta
    const descargarArchivosDeCarpeta = async (ftpPath, localPath) => {
      // Listar archivos en la carpeta FTP
      const items = await client.list(ftpPath);

      for (const item of items) {
        let remoteFilePath = path.join(ftpPath.replace(/\\/g, '/'), item.name);
        remoteFilePath = remoteFilePath.replace(/^\/+/, "");

        const localFilePath = path.join(localPath, item.name);

        if (item.isDirectory) {
          // Si es un directorio, crear una carpeta local y llamar recursivamente
          if (!fs.existsSync(localFilePath)) {
            fs.mkdirSync(localFilePath);
          }
          await descargarArchivosDeCarpeta(remoteFilePath, localFilePath);
        } else {
          // Si es un archivo, descargarlo
          console.log(`Descargando archivo: ${remoteFilePath.replace(/\\/g, '/')}`);
          await client.downloadTo(localFilePath, remoteFilePath.replace(/\\/g, '/'));
        }
      }
    };

    // Llamar a la función para descargar toda la carpeta
    await descargarArchivosDeCarpeta(ftpFolderPath, localFolderPath);

    // Crear archivo ZIP usando `archiver`
    const zipFileName = `${path.basename(localFolderPath)}.zip`;
    const zipFilePath = path.join(downloadsPath, zipFileName);

    const archive = archiver("zip", { zlib: { level: 9 } }); // Mejor compresión
    const output = fs.createWriteStream(zipFilePath);

    // Conectar el flujo de salida del ZIP
    archive.pipe(output);

    // Agregar la carpeta descargada al archivo ZIP
    archive.directory(localFolderPath, false);

    // Finalizar el archivo ZIP
    await archive.finalize();

    // Esperar a que se complete la escritura del archivo ZIP
    output.on("close", () => {
      console.log(`Archivo ZIP creado: ${zipFilePath} (${archive.pointer()} bytes)`);

      // Enviar el archivo ZIP como respuesta
      res.download(zipFilePath, zipFileName, (err) => {
        if (err) {
          console.error("Error al enviar el archivo ZIP:", err);
          return res.status(500).json({
            ok: false,
            msg: "Hubo un problema al enviar el archivo ZIP.",
            error: err.message,
          });
        }

        // Eliminar el archivo ZIP temporal después de enviarlo
        fs.unlinkSync(zipFilePath);
        fs.rmSync(localFolderPath, { recursive: true, force: true });
      });
    });

  } catch (error) {
    console.error("Error al procesar la descarga de la carpeta:", error);
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
    descargarEnlace,
    descargarCarpeta
}