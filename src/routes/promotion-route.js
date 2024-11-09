const express = require("express")
const router = express.Router()
const promotionController = require("../controllers/promotion-controller")
const {getPromotionQueryValidator,userGetPromotionValidator} = require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")
const checkRole = require("../middlewares/checkRole")


router.get('/',getPromotionQueryValidator,promotionController.getAllPromotions) // query
router.get('/:promotionCode',promotionController.getPromotionById)
router.post('/get',authenticate,checkRole.userCheck,userGetPromotionValidator,promotionController.userGetPromotions) // authen



module.exports = router