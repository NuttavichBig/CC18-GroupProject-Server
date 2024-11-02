const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partner-controller");
const checkRole = require("../middlewares/checkRole");
const { createPartnerValidator, updatePartnerValidator } = require("../middlewares/validator");


router.get("/", checkRole.partnerCheck,partnerController.getPartnerInfo);
router.post("/", checkRole.userCheck,createPartnerValidator,partnerController.createPartner);
router.patch("/", checkRole.partnerCheck,updatePartnerValidator,partnerController.updatePartner);
router.delete("/", checkRole.partnerCheck,partnerController.deletePartner);

module.exports = router;


