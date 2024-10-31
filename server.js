// Import
const express = require("express")
const cors = require("cors")
const handleError = require("./src/middlewares/error")
const handleNotFound = require("./src/middlewares/notFound")
const {createServer} = require("node:http")
const socketIo = require("socket.io")

// Route
const hotelRoute = require("./src/routes/hotel-route")
const roomRoute = require("./src/routes/room-route")
const reviewRoute = require("./src/routes/review-route")
const bookingRoute = require("./src/routes/booking-route")
const promotionRoute = require("./src/routes/promotion-route")
const partnerRoute = require("./src/routes/partner-route")
const authRoutes = require("./src/routes/auth-route");

// config
require("dotenv").config();
const app = express();
const server = createServer(app);
const io = socketIo(server, {
  cors: {},
});

// entry middlewares
app.use(cors());
app.use(express.json());

// API Path
app.use("/auth", authRoutes);
app.use('/hotel',hotelRoute)
app.use('/room',roomRoute) // authen
app.use('/review',reviewRoute)
app.use('/booking',bookingRoute)
app.use('/promotion',promotionRoute)
app.use('/partner',partnerRoute) // authen
app.use('/admin',()=>{}) // authen



// exit middlewares
app.use("*", handleNotFound);
app.use(handleError);

// Socket Middleware

// Socket Function
io.on("connection", (socket) => {
  console.log(`User : ${socket.id} has connected`);

  // disconnect listener
  socket.on("disconnect", () => {
    console.log(`USer : ${socket.id} has disconnected`);
  });
});

// server listen
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
