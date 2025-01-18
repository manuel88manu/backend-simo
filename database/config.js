const mysql = require('mysql');
require('dotenv').config();

let pool;  // Variable global para el pool de conexiones

// Crear el pool de conexiones
const createPool = () => {
    if (!pool) {  // Si no existe el pool, lo crea
        pool = mysql.createPool({
            connectionLimit: 10,  // Número máximo de conexiones simultáneas
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB,
        });

        // Manejo de errores global del pool
        pool.on('connection', (connection) => {
            console.log('Conexión al DB establecida');
        });

        pool.on('error', (err) => {
            console.error('Error en el pool de conexiones:', err);
            // Manejo de reconexión en caso de errores del pool (si es necesario)
        });
    }

    return pool;  // Devuelve el pool de conexiones
};

// Función que devuelve una promesa para ejecutar consultas
const ejecutarConsulta = (query, params = []) => {
    return new Promise((resolve, reject) => {
        const pool = createPool();  // Obtiene el pool de conexiones

        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);  // Error al obtener conexión
            } else {
                // Realizar la consulta
                connection.query(query, params, (error, resultados) => {
                    connection.release();  // Libera la conexión después de usarla

                    if (error) {
                        reject(error);  // Si hay error en la consulta
                    } else {
                        resolve(resultados);  // Devuelve los resultados
                    }
                });
            }
        });
    });
};

module.exports = {
    createPool,
    ejecutarConsulta
};