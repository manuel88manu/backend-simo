const jwt=require('jsonwebtoken');
require('dotenv').config();


const generarJWT=(uid,name)=>{

    return new Promise((resolve,reject)=>{
        const payload={uid,name};

        jwt.sign(payload,process.env.SECRET_JWT_SEED,{
            expiresIn:'12h'
        }, (error,token)=>{
            if(error){
                console.log(error)
                reject('No se pudo generar el token')
            }
            resolve(token)
        })

    }
    )

}

module.exports={
    generarJWT
}