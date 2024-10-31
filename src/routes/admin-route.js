const express = require("express")
const router = express.Router()


// user
router.get('/user',()=>{}) // query
router.patch('/user/:userId',()=>{}) 
router.delete('/user/:userId',()=>{}) 

//partner
router.get('/partner',()=>{}) // query
router.patch('/partner/:partnerId',()=>{})

// promotion
router.post('/promotion',()=>{})
router.patch('/promotion/:promotionId',()=>{})
router.delete('/promotion/:promotionId',()=>{})

// booking
router.patch('/booking/:bookingId',()=>{})




module.exports = router