const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

exports.getAllPromotions = async (req, res, next) => {
    const {search,page = 1, limit = 10,orderBy="id",sortBy="asc"} = req.query
    const skip = (page - 1) * limit

    const allowedOrder = ["id","name","startDate","endDate","isActive","discountValue","discountPercent","minimumSpend","maxDiscount","usageLimit","createdAt","updatedAt"]
    const orderField = allowedOrder.includes(orderBy) ? orderBy : "id"
    const orderDirection = sortBy.toLowerCase()==="desc"?"desc":"asc"
    try {
        const promotions = await prisma.promotion.findMany({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { code: { contains: search} }
                ]
            } : {},
            orderBy: {
                [orderField]: orderDirection,
            },
            skip: Number(skip),
            take: Number(limit),
        })
        const totalPromotions = await prisma.promotion.count({
            where: search ? {
                OR: [
                    { name: { contains: search } },
                    { code: { contains: search} }
                ]
            } : {},

        })
        res.json({
            total: totalPromotions,
            page: Number(page),
            limit: Number(limit),
            data: promotions
        })
        
    } catch (error) {
        next(error)
    }
}

exports.getPromotionById = async (req, res, next) => {
    const {promotionId} = req.params
    try{
        const promotion = await prisma.promotion.findUnique({
            where:{ id: Number(promotionId) },
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
    const {promotionId} = req.body
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
            throw createError(404, "Promotion not available")
        }
        res.json(promotion)
        
    } catch (error) {
        next(error)
    }
}