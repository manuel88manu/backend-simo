const express = require('express');
// controllers/ftp.js
const fs = require('fs');
const path = require('path');
const ftp = require('basic-ftp');  // Asegúrate de instalar el paquete `basic-ftp`
const { ftpConfig } = require('../ftpserver/config');


const subirArchivo = async (req, res = express.response) => {
if (!req.file) {
return res.status(400).json({ 
msg: 'No se ha subido ningún archivo' });
}

const localFilePath = req.file.path;  // Ruta del archivo temporal
const remoteFileName = path.basename(req.file.originalname);  // Nombre del archivo remoto
const client = new ftp.Client()
client.ftp.verbose = true;

try {
// Conectar al servidor FTP
await client.access(ftpConfig);

// Subir el archivo al servidor FTP

await client.uploadFrom(localFilePath, `/${remoteFileName}`);

// Eliminar el archivo local después de la carga
fs.unlinkSync(localFilePath);

// Enviar la URL del archivo subido
res.json({ url: `ftp://${ftpConfig.host}/${remoteFileName}` });

} catch (error) {
    console.error("Erroor al subir el archivo:", error);
    res.status(500).json({ error: 'OO'}); 
}
finally {
    client.close();  
  }
}

async function testConnection() {
    const client = new ftp.Client();

    try {
        console.log('Error en el access')
        await client.access({
            host: "192.168.1.108",
            user: "user1",
            password: "manuel88",
            secure: true, // Habilita FTPS
            secureOptions: {
                rejectUnauthorized: false // Solo para certificados autofirmados
            }
        });

        console.log("Conexión establecida exitosamente");
    } catch (err) {
        console.error("Error al conectar:", err);
    } finally {
        client.close();
    }
}

module.exports = {
    subirArchivo,
    testConnection
}