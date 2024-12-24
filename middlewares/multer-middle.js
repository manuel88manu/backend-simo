const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Ruta de la carpeta de subida
const uploadDirectory = path.join(__dirname, 'uploads');

// Verifica si la carpeta 'uploads' existe, si no, la crea
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true }); // Crea la carpeta si no existe
}

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Usa el directorio 'uploads'
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nombre único para el archivo
  }
});

const upload = multer({ storage: storage });

// Exportar el middleware
module.exports = upload;
