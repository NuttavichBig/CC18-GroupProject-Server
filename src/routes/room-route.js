const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");
const upload = require("../middlewares/upload");
const { createRoomValidator, updateRoomValidator } = require("../middlewares/validator");
const checkRole = require("../middlewares/checkRole")

router.post("/", upload.array("image", 5),createRoomValidator, roomController.createRoom);
router.patch("/:roomId",checkRole.partnerCheck,upload.array("image", 5),updateRoomValidator,roomController.updateRoom); // waiting for edit photo
router.delete("/:roomId",checkRole.partnerCheck, roomController.deleteRoom);

module.exports = router;
