const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Crear servidor express
const app = express();

// CORS
app.use(cors());

// Lectura y parseo del body
app.use(express.json());

// RUTAS
app.use('/api/auth', require('./routes/auth'));
app.use('/api/periody', require('./routes/periodo'));
app.use('/api/obra', require('./routes/obra'));
app.use('/api/expedi', require('./routes/expedi'));
app.use('/api/excel', require('./routes/excel'));
app.use('/api/ftp', require('./routes/ftp'));

const PORT = process.env.PORT || 3000;

// Escuchar peticiones
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});