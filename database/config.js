const mysql = require('mysql');
require('dotenv').config();

let conexion;  // Variable global para la conexión

const dbConnection = () => {
    if (!conexion) {  // Si no hay conexión, la crea
        conexion = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
        });

        conexion.connect((error) => {
            if (error) {
                console.log('Conexión fallida');
                throw error;
            } else {
                console.log('Conexión del DB exitosa');
            }
        });
    }

    return conexion;  // Devuelve siempre la misma conexión
}

// Función que devuelve una promesa para ejecutar consultas
const ejecutarConsulta = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const conexion = dbConnection();
        conexion.query(query, params, (error, resultados) => {
            if (error) {
                reject(error);
            } else {
                resolve(resultados);
            }
        });
    });
};

module.exports = {
    dbConnection,
    ejecutarConsulta
};