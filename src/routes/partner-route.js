const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partner-controller");

router.get("/", partnerController.getPartnerInfo);
router.post("/", partnerController.createPartner);
router.patch("/", partnerController.updatePartner);
router.delete("/", partnerController.deletePartner);

module.exports = router;
