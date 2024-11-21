const express = require('express');
const cors=require('cors')
const { dbConnection } = require('./database/config');
require('dotenv').config();

//Crear servidor express
const app=express();

//Base de datos

dbConnection();

//CORS
app.use(cors())

//Lectura y parseo del body
app.use(express.json())

//RUTAS
app.use('/api/auth',require('./routes/auth')) 

app.use('/api/periody',require('./routes/periodo'))

//Escuchar peticiones 
app.listen(process.env.PORT,()=>{
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`)
})
