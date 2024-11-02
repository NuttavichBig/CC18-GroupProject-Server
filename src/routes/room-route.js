const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");
const upload = require("../middlewares/upload");
const { createRoomValidator, updateRoomValidator } = require("../middlewares/validator");

router.post("/", upload.array("image", 5),createRoomValidator, roomController.createRoom);
router.patch("/:roomId",upload.array("image", 5),updateRoomValidator,roomController.updateRoom); // waiting for edit photo
router.delete("/:roomId", roomController.deleteRoom);

module.exports = router;
