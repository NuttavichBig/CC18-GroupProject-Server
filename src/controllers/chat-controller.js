const prisma = require("../configs/prisma")
const jwt = require('jsonwebtoken')
const createError = require("../utility/createError")



module.exports.userChat =  async(io,socket,token)=>{
    try{
        let chatRoom = null
        if(token){
            const payLoad = jwt.verify(token,process.env.SECRET_KEY)
            const findUSer = await prisma.user.findUnique({
                where : {
                    id : payLoad.id
                }
            })
            socket.user = findUSer
            chatRoom = await prisma.chatbox.create({
                data : {
                    userId  : findUSer.id
                }
            })
        }else {
            chatRoom = await prisma.chatbox.create({
                data : {
                    userId : null
                }
            })
        }
        socket.join(chatRoom.id)


        socket.emit('joinComplete',({message : 'you have success join a chat'}))

        socket.on('message',async(msg)=>{
            const addMessage = await prisma.message.create({
                data  :{
                    chatboxId  : chatRoom.id,
                    message  : msg
                }
            })
            io.to('admin').emit('message',{data : addMessage})
        })
    }catch(err){
        console.log(err.message)
        socket.emit("error", err.message)
    }
}


module.exports.adminChat  = (io,socket,token)=>{
    try{
        if(token){
            return createError(401,'unauthorized')
        }
        
    }catch(err){
        console.log(err.message)
        socket.emit("error", err.message)
    }
}