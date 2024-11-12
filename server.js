// Import
const express = require("express");
const cors = require("cors");
const handleError = require("./src/middlewares/error");
const handleNotFound = require("./src/middlewares/notFound");
const { createServer } = require("node:http");
const socketIo = require("socket.io");
const authenticate = require("./src/middlewares/authenticate");
const checkRole = require("./src/middlewares/checkRole");

// Route
const hotelRoute = require("./src/routes/hotel-route");
const roomRoute = require("./src/routes/room-route");
const reviewRoute = require("./src/routes/review-route");
const bookingRoute = require("./src/routes/booking-route");
const promotionRoute = require("./src/routes/promotion-route");
const partnerRoute = require("./src/routes/partner-route");
const authRoutes = require("./src/routes/auth-route");
const adminRoute = require("./src/routes/admin-route");
const paymentRoute = require("./src/routes/payment-route");
const chatController = require("./src/controllers/chat-controller");
const adminDashboardRoute = require("./src/routes/adminDashboard-route")

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
app.use("/hotel", hotelRoute);
app.use("/room", authenticate, roomRoute); // authen
app.use("/review", authenticate, reviewRoute);
app.use("/booking", bookingRoute);
app.use("/promotion", promotionRoute);
app.use("/partner", authenticate, partnerRoute); // authen
app.use("/admin", authenticate, checkRole.adminCheck, adminRoute); // authen
app.use("/payment", paymentRoute)

app.use("/adminDashboard",adminDashboardRoute)

// exit middlewares
app.use("*", handleNotFound);
app.use(handleError);


// Socket Function
io.on("connection", (socket) => {
  console.log(`User : ${socket.id} has connected`);
  socket.removeAllListeners('joinChat')
  socket.removeAllListeners('adminJoin')
  socket.on('joinChat', () => chatController.userChat(io, socket))
  socket.on('adminJoin', () => chatController.adminChat(io, socket))


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
