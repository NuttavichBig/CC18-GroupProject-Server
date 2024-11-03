
const prisma = require("../configs/prisma")
const checkPromotionByCode = require("../services/check-promotion-by-code")
const createError = require("../utility/createError")
const generatePromotionCode = require("../utility/generatePromotionCode")
const cloudinary = require("cloudinary")
const getPublicId = require("../utility/getPublicId")
const fs = require("fs/promises")

//user
exports.getAllUsers = async (req, res, next) => {
    try {
        const { search, limit, page, orderBy, sortBy, role, status } = req.input
        // make condition variable
        const condition = {
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { [sortBy]: orderBy }
        }

        // check search
        if (search) {
            condition.where = {
                OR: [
                    { email: { contains: search } },
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { phone: { contains: search } }
                ]
            }
        }

        // check have other query?
        if (role) {
            condition.where = { ...condition.where, role }
        }
        if (status) {
            condition.where = { ...condition.where, status }
        }
        const users = await prisma.user.findMany(condition)
        res.json(users)
    } catch (error) {
        next(error)
    }
}
exports.updateUser = async (req, res, next) => {
    try {
        const { userId } = req.params
        const { role } = req.input


        // check use exist
        const userInDataBase = await prisma.user.findUnique({
            where: {
                id: +userId
            }
        })
        if (!userInDataBase) {
            return createError(400, "User not found")
        }

        // update
        const updateUser = await prisma.user.update({
            where: {
                id: +userId
            },
            data: {
                role
            }
        })
        const { resetPasswordToken, password, ...user } = updateUser
        res.json({ message: "update completed", user })
    } catch (error) {
        next(error)
    }
}
exports.deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params
        // check use exist
        const userInDataBase = await prisma.user.findUnique({
            where: {
                id: +userId
            }
        })
        if (!userInDataBase) {
            return createError(400, "User not found")
        }
        const deletedUser = await prisma.user.update({
            where: {
                id: userInDataBase.id
            },
            data: {
                status: 'BANNED'
            }
        })
        const { resetPasswordToken, password, ...user } = deletedUser
        res.json({ message: "User has been terminate", user })
    } catch (error) {
        next(error)
    }
}

//partner
exports.getAllPartners = async (req, res, next) => {
    try {
        const { search, limit, page, orderBy, sortBy, status } = req.input
        // make condition variable
        const condition = {
            take: limit,
            skip: (page - 1) * limit,
            orderBy: { [sortBy]: orderBy }
        }

        // check search
        if (search) {
            condition.where = {
                OR: [
                    { companyName: { contains: search } },
                    { taxNo: { contains: search } },
                    { bankAccount: { contains: search } },
                    { bankName: { contains: search } },
                ]
            }
        }

        // check have other query?
        if (status) {
            condition.where = { ...condition.where, status }
        }
        const partners = await prisma.partner.findMany(condition)
        res.json(partners)

    } catch (error) {
        next(error)
    }

}
exports.updatePartnerStatus = async (req, res, next) => {
    try {
        const { partnerId } = req.params
        const { status } = req.input

        // check partnerID
        const partner = await prisma.partner.findUnique({
            where: {
                id: +partnerId
            }
        })
        if (!partner) {
            return createError(400, "Partner not found")
        }

        const updatePartner = await prisma.partner.update({
            where: {
                id: partner.id
            },
            data: {
                status
            }
        })
        res.json({ message: 'Update success', partner: updatePartner })

    } catch (error) {
        next(error)
    }
}

// promotion
exports.createPromotion = async (req, res, next) => {
    try {
        // make data
        const data = { ...req.input }
        const haveFile = !!req.file

        // generate code
        let newCode
        do {
            newCode = generatePromotionCode()
        } while (!!(await checkPromotionByCode(newCode)))
        data.code = newCode

        if (haveFile) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            data.img = uploadResult.secure_url

        }
        const newPromotion = await prisma.promotion.create({
            data
        })
        res.json({ message: "Create promotion success", promotion: newPromotion })

    } catch (error) {
        next(error)
    }
}
exports.updatePromotion = async (req, res, next) => {
    try {
        // make data
        const data = { ...req.input }
        const { promotionId } = req.params
        const haveFile = !!req.file

        // check exist
        const promotion = await prisma.promotion.findUnique({
            where: {
                id: +promotionId
            }
        })
        if (!promotion) {
            return createError(400, "Promotion not found")
        }

        if (haveFile) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                public_id: req.file.filename.split(".")[0]
            })
            fs.unlink(req.file.path)
            data.img = uploadResult.secure_url
            if (promotion.img) {
                cloudinary.uploader.destroy(getPublicId(promotion.img))
            }

        }
        const updatePromotion = await prisma.promotion.update({
            where: {
                id: promotion.id
            },
            data
        })
        res.json({ message: "Update promotion success", promotion: updatePromotion })

    } catch (error) {
        next(error)
    }
}
exports.deletePromotion = async (req, res, next) => {
    try {
        const {promotionId} =req.params

        //check exist
        const promotion = await prisma.promotion.findUnique({
            where: {
                id: +promotionId
            }
        })
        if(!promotion) {
            return createError(400, "Promotion not found")
        }   
        
        if(promotion.img){
            cloudinary.uploader.destroy(getPublicId(promotion.img))
            console.log("Delete image from cloud")
        }
        const deletedPromotion = await prisma.promotion.delete({
            where:{
                id : promotion.id
            }
        })
        res.json({message : "Delete success",promotion :deletedPromotion})
    } catch (err) {
        next(err)
    }
}

//booking
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params
        const { status } = req.input

        //check exist
        const booking = await prisma.booking.findUnique({
            where :{
                id : +bookingId
            }
        })
        if(!booking){
            return createError(400,"Booking not found")
        }
        const updateBooking = await prisma.booking.update({
            where: {
                id: booking.id
            },
            data: {
                status
            }
        })
        res.json({message : "Update booking success",booking : updateBooking})
    } catch (error) {
        next(error)
    }
}