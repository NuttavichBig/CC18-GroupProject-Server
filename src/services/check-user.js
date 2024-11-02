const prisma = require("../configs/prisma")

module.exports.byEmail = async(email)=>{
    const user = await prisma.user.findUnique({
        where : {
            email
        }
    })
    return user
}