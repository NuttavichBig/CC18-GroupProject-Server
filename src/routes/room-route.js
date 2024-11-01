const express = require("express");
const router = express.Router();
const roomController = require("../controllers/room-controller");
const upload = require("../middlewares/upload");

router.post("/", upload.array("image", 5), roomController.createRoom);
router.patch("/:roomId", roomController.updateRoom); // waiting for edit photo
router.delete("/:roomId", roomController.deleteRoom);

module.exports = router;
