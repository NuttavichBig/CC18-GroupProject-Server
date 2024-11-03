const createError = require("../utility/createError")
const Joi =require("joi")


// Joi Object
const authObject = require("../configs/joi/auth-object")
const hotelObject = require("../configs/joi/hotel-object")
const roomObject = require("../configs/joi/room-object")
const reviewObject = require("../configs/joi/review-object")
const bookingObject = require("../configs/joi/booking-object")
const promotionObject = require("../configs/joi/promotion-object")
const partnerObject = require("../configs/joi/partner-object")
const adminObject = require("../configs/joi/admin-object")

// validate function
const validateSchema = (schema) => (req, res, next) => {
        const { value, error } = schema.validate(req.body)
        if (error) {
            return createError(400, error.details[0].message)
        }
        req.input = value
        next();
}

const validateQuery = (schema) => (req, res, next) => {
        const { value, error } = schema.validate(req.query)
        if (error) {
            return createError(400, error.details[0].message)
        }
        req.input = value
        next();
}


// Export

// auth
module.exports.registerValidator = validateSchema(authObject.registerSchema)
module.exports.loginValidator = validateSchema(authObject.loginSchema)
module.exports.updateUserValidator = validateSchema(authObject.updateUserSchema)
module.exports.forgotPasswordValidator = validateSchema(authObject.forgotPasswordSchema)
module.exports.resetPasswordValidator = validateSchema(authObject.resetPasswordSchema)

// hotel
module.exports.getHotelQueryValidator = validateQuery(hotelObject.getHotelQuerySchema)
module.exports.createHotelValidator = validateSchema(hotelObject.createHotelSchema)
module.exports.updateHotelValidator = validateSchema(hotelObject.updateHotelSchema)

// room
module.exports.createRoomValidator = validateSchema(roomObject.createRoomSchema)
module.exports.updateRoomValidator = validateSchema(roomObject.createRoomSchema)

// review
module.exports.getReviewQueryValidator = validateQuery(reviewObject.getReviewQuerySchema)
module.exports.createReviewValidator = validateSchema(reviewObject.createReviewSchema)
module.exports.updateReviewValidator = validateSchema(reviewObject.updateReviewSchema)

// booking
module.exports.getBookingQueryValidator = validateQuery(bookingObject.getBookingQuerySchema)
module.exports.createBookingValidator = validateSchema(bookingObject.createBookingSchema)

// promotion
module.exports.getPromotionQueryValidator = validateQuery(promotionObject.getPromotionQuerySchema)
module.exports.userGetPromotionValidator = validateSchema(promotionObject.userGetPromotion)

// partner
module.exports.createPartnerValidator = validateSchema(partnerObject.createPartnerSchema)
module.exports.updatePartnerValidator = validateSchema(partnerObject.updatePartnerSchema)

// admin
module.exports.adminGetUserQueryValidator = validateQuery(adminObject.adminGetUserQuerySchema)
module.exports.adminUpdateUserValidator = validateSchema(adminObject.adminUpdateUserSchema)
module.exports.adminGetPartnerQueryValidator = validateQuery(adminObject.adminGetPartnerQuerySchema)
module.exports.adminUpdatePartnerValidator = validateSchema(adminObject.adminUpdatePartnerSchema)
module.exports.adminCreatePromotionValidator = validateSchema(adminObject.adminCreatePromotionSchema)
module.exports.adminUpdatePromotionValidator = validateSchema(adminObject.adminUpdatePromotionSchema)
module.exports.adminUpdateBookingValidator = validateSchema(adminObject.adminUpdateBookingSchema)