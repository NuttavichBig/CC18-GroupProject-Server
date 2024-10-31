// Import
const express = require("express")
const cors = require("cors")
const handleError = require("./src/middlewares/error")
const handleNotFound = require("./src/middlewares/notFound")
const {createServer} = require("node:http")
const socketIo = require("socket.io")


// config
require("dotenv").config()
const app = express()
const server = createServer(app)
const io = socketIo(server,{
    cors : {}
})

// entry middlewares
app.use(cors())
app.use(express.json())

// API Path


// exit middlewares
app.use("*",handleNotFound)
app.use(handleError)


// Socket Middleware


// Socket Function
io.on("connection",(socket)=>{
    console.log(`User : ${socket.id} has connected`)



    // disconnect listener
    socket.on("disconnect",()=>{
        console.log(`USer : ${socket.id} has disconnected`)
    })
})



// server listen
const port = process.env.PORT || 8000
server.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})