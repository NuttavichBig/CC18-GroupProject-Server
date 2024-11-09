const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

exports.getAllPromotions = async (req, res, next) => {
    const {search,page, limit,orderBy,sortBy,isActive} = req.input
    const skip = (page - 1) * limit
    try {
        const promotions = await prisma.promotion.findMany({
            where: {
                ...(search ? {
                OR: [
                    { name: { contains: search } },
                    { code: { contains: search} }
                ]
            } : {}),
                ...(isActive === true || isActive === false?{isActive: isActive}:{}),
            },
            orderBy: {
                [sortBy]: orderBy,
            },
            skip,
            take: limit,
        })
        const totalPromotions = await prisma.promotion.count({
            where:{
                ...(search ? {
                    OR: [
                        { name: { contains: search } },
                        { code: { contains: search} }
                    ]
                } : {}),
                ...(isActive === true || isActive === false?{isActive: isActive}:{}),
            } 

        })
        res.json({
            total: totalPromotions,
            page,
            limit,
            promotion: promotions
        })
        
    } catch (error) {
        next(error)
    }
}

exports.getPromotionById = async (req, res, next) => {
    const {promotionCode} = req.params
    try{
        const promotion = await prisma.promotion.findFirst({
            where:{ code: promotionCode },
        })
        if(!promotion){
            throw createError(404, "Promotion not found")
        }
        res.json(promotion)
    }catch(error){
        next(error)
    }
}
exports.userGetPromotions = async (req, res, next) => {
    const {promotionId} = req.input
    try {
        const currentDate = new Date()
        const promotion = await prisma.promotion.findFirst({
            where: {
                id:Number(promotionId),
                isActive: true,
                startDate: {
                    lte: currentDate,
                },
                endDate: {
                    gte: currentDate,
                },
            },
        })
        if(!promotion){
            throw createError(400, "Promotion not available")
        }
        const promotionGet = await prisma.userHavePromotion.create({
            data : {
                userId : req.user.id,
                promotionId
            }
        })
        res.json({message : "get promotion",promotion :promotionGet,promotion})
        
    } catch (error) {
        next(error)
    }
}