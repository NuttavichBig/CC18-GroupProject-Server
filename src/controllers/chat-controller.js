const prisma = require("../configs/prisma")
const jwt = require('jsonwebtoken')
const createError = require("../utility/createError")



module.exports.userChat = async (io, socket) => {
    try {
        let chatRoom = null
        const authorization = socket?.handshake?.headers?.authorization
        // const authorization = socket?.handshake?.headers?.token
        // console.log(socket.handshake)
        if (authorization) {
            // console.log(socket.handshake)
            if (!authorization || !authorization.startsWith('Bearer')) {
                return createError(401, 'Your token invalid')
            }
            const token = authorization.split(' ')[1]
            if (!token) return createError(401, 'Your token invalid')
            const payLoad = jwt.verify(token, process.env.SECRET_KEY)
            const findUSer = await prisma.user.findUnique({
                where: {
                    id: payLoad.id
                }
            })
            if (!findUSer) {
                return createError(401, "Your token invalid")
            }
            socket.user = findUSer
            chatRoom = await prisma.chatbox.create({
                data: {
                    userId: findUSer.id,
                    socketId: socket.id
                }
            })
        } else {
            chatRoom = await prisma.chatbox.create({
                data: {
                    socketId: socket.id
                }
            })
        }
        socket.join(chatRoom.id)


        socket.emit('joinComplete', ({ message: 'you have success join a chat' }))
        socket.removeAllListeners('message')
        socket.on('message', async (msg) => {
            const addMessage = await prisma.message.create({
                data: {
                    chatboxId: chatRoom.id,
                    message: msg
                }
            })
            const message = await prisma.chatbox.findFirst({
                where:{
                 id : addMessage.chatboxId
                },
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'desc',
                        },
                        take: 1, // Take only the latest message
                    },
                },
            })
            io.to('admin').emit('userMessage', { data: message })
            io.to(chatRoom.id).emit('message', { data: addMessage })
        })

        // disconnect listener
        socket.on("disconnect", async () => {
            await prisma.chatbox.delete({
                where: {
                    id: chatRoom.id
                }
            })
        });
    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}


module.exports.adminChat = async (io, socket) => {
    try {
        const authorization = socket?.handshake?.headers?.authorization
        // const authorization = socket?.handshake?.headers?.token
        if (!authorization) {
            return createError(401, 'unauthorized')
        }
        if (!authorization || !authorization.startsWith('Bearer')) {
            return createError(401, 'Unauthorized')
        }
        const token = authorization.split(' ')[1]
        if (!token) return createError(401, 'Unauthorized')

        // verify token
        const payLoad = jwt.verify(token, process.env.SECRET_KEY)


        // find user data 
        const findUser = await prisma.user.findUnique({ where: { id: payLoad.id } })
        if (!findUser) {
            return createError(401, 'Unauthorized')
        }
        if (findUser.role !== 'ADMIN') {
            return createError(401, 'Unauthorized')
        }

        socket.join('admin')

        const allLastMessage = await prisma.chatbox.findMany({
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 1, // Take only the latest message
                },
            },
        })
        socket.emit('adminJoinComplete',allLastMessage)

        socket.removeAllListeners('adminJoinChat')
        socket.on('adminJoinChat', async (roomID) => {
            const room = await prisma.chatbox.findUnique({
                where: {
                    id: roomID
                }
            })
            socket.join(room.id)
            socket.emit('joinComplete', ({ message: 'you have success join a chat' }))
            socket.removeAllListeners('message')
            socket.removeAllListeners('leaveRoom')
            socket.on('message', async (msg) => {
                const addMessage = await prisma.message.create({
                    data: {
                        chatboxId: room.id,
                        isAdmin: true,
                        message: msg
                    }
                })
                const message = await prisma.chatbox.findFirst({
                    where:{
                     id : addMessage.chatboxId
                    },
                    include: {
                        messages: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                            take: 1, // Take only the latest message
                        },
                    },
                })
                io.to('admin').emit('userMessage', { data: message })
                io.to(chatRoom.id).emit('message', { data: addMessage })
            })
            socket.on('leaveRoom', () => {
                socket.leave(room.id)
            })
        })

    } catch (err) {
        console.log(err.message)
        socket.emit("error", err.message)
    }
}