require('dotenv').config();

 const ftpConfig = {
  host: process.env.FTP_HOST, // Cambia a tu host en la nube más adelante
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
  secure:process.env.FTPS_VALUE === 'true', // Habilita FTPS
            secureOptions: {
                rejectUnauthorized: false // Solo para certificados autofirmados
            }
}; 


module.exports = {
    ftpConfig
};