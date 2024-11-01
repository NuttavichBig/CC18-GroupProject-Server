const express = require("express")
const router = express.Router()
const promotionController = require("../controllers/promotion-controller")


router.get('/',promotionController.getAllPromotions) // query
router.patch('/:promotionId',promotionController.getPromotionById)
router.post('/get',promotionController.userGetPromotions) // authen




module.exports = router