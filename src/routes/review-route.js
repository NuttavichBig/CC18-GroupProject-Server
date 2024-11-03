const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review-controller")
const {getReviewQueryValidator,createReviewValidator,updateReviewValidator} = require("../middlewares/validator")
const authenticate = require("../middlewares/authenticate")
const checkRole = require("../middlewares/checkRole")
const upload = require("../middlewares/upload")


router.get('/',checkRole.adminCheck,getReviewQueryValidator,reviewController.getAllReviews) // query
router.post('/',checkRole.userCheck,upload.single("img"),createReviewValidator,reviewController.createReview) // authen
router.patch('/:reviewId',checkRole.userCheck,upload.single("img"),updateReviewValidator,reviewController.editReview) // authen
router.delete('/:reviewId',reviewController.deleteReview) 

module.exports = router