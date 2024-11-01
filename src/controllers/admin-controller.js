const prisma = require("../configs/prisma")
const createError = require("../utility/createError")

//user
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({})
        res.json(users)   
    } catch (error) {
        next(error)
    }
}
exports.updateUser = async (req, res, next) => {
    const { userId } = req.params
    const { role } = req.body
    try {
        const updateUser = await prisma.user.update({
            where: {
                id: Number(userId)
            },
            data: {
                role
            }
        })
        res.json(updateUser)
    } catch (error) {
        next(error)
    }
}
exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params
    try {
        const deletedUser = await prisma.user.delete({
            where: {
                id: Number(userId)
            }
        })
        res.json(deletedUser)
    } catch (error) {
        next(error)
    }
}

//partner
exports.getAllPartners = async(req,res,next)=>{
    try {
        const partners = await prisma.partner.findMany({})
        res.json(partners)
        
    } catch (error) {
        next(error)
    }

}
exports.updatePartnerStatus = async(req,res,next)=>{
    try {
        const {partnerId} = req.params
        const {status} = req.body
        const updatePartner = await prisma.partner.update({
            where: {
                id: Number(partnerId)
            },
            data: {
                status
            }
        })
        res.json(updatePartner)
        
    } catch (error) {
        next(error)
    }
}

//promotion
const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let randomCode = ''
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        randomCode += characters.charAt(randomIndex)
    }
    return randomCode
}
const isCodeUnique = async (code) => {
    const existingPromotion = await prisma.promotion.findFirst({
        where: {
            code
        }
    })
    return !existingPromotion
}
exports.createPromotion = async (req, res, next) => {
    const {name,img,description,discountPercent,discountValue,minimumSpend,maxDiscount,usageLimit,userLimit,isActive,startDate,endDate} = req.body
    try {
        let newCode 
        do{
            newCode = generateRandomCode(8)
        }while(!(await isCodeUnique(newCode)))
        const newPromotion = await prisma.promotion.create({
            data: {
                name,
                img,
                description,
                discountPercent,
                discountValue,
                minimumSpend,
                maxDiscount,
                usageLimit,
                userLimit,
                isActive,
                startDate:new Date(startDate),
                endDate:new Date(endDate),
                code:newCode
            }
        })
        res.json(newPromotion)

    } catch (error) {
        next(error)
    }
}
exports.updatePromotion = async (req, res, next) => {
    const { promotionId } = req.params
    const {name,img,description,discountPercent,discountValue,minimumSpend,maxDiscount,usageLimit,userLimit,isActive,startDate,endDate} = req.body
    try {
        const updatePromotion = await prisma.promotion.update({
            where: {
                id: Number(promotionId)
            },
            data: {
                name,
                img,
                description,
                discountPercent,
                discountValue,
                minimumSpend,
                maxDiscount,
                usageLimit,
                userLimit,
                isActive,
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) })
            }
        })
        res.json(updatePromotion)
    } catch (error) {
        next(error)
    }
}
exports.deletePromotion = async (req, res, next) => {
    const { promotionId } = req.params
    try {
        const deletedPromotion = await prisma.promotion.delete({
            where: {
                id: Number(promotionId)
            }
        })
        res.json(deletedPromotion)
    } catch (error) {
        next(error)
    }
}

//booking
exports.updateBookingStatus = async (req, res, next) => {
    try {
        const { bookingId } = req.params
        const { status } = req.body
        const updateBooking = await prisma.booking.update({
            where: {
                id: Number(bookingId)
            },
            data: {
                status
            }
        })
        res.json(updateBooking)
        
    } catch (error) {
        next(error)
    }
}