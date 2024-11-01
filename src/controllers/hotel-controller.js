const prisma  = require("../configs/prisma");
const createError = require("../utility/createError");
const Joi = require("joi");
const { getHotelQuerySchema,createHotelSchema,updateHotelSchema } = require("../configs/joi/hotel-object");

exports.getHotels = async (req, res, next) => {
    const {error, value} = getHotelQuerySchema.validate(req.query)
    if(error){
        return createError(400, error.details[0].message)
    }
    const {search,maxPrice,minPrice,star,orderBy,sortBy,facilities,limit,page,isActive} = value
    const filterCondition = {
        ...(search && { name: { contains: search } }),
        ...(maxPrice && { price: { lte: maxPrice } }),  
        ...(minPrice && { price: { gte: minPrice } }),
        ...(star && { star: { equals: star } }),
        ...(facilities && { facilitiesHotel: { some: { id: { in: facilities } } } }),
        ...(isActive && { isActive: { equals: isActive } })
    }
    try{
        const hotels = await prisma.hotel.findMany({
            where: filterCondition,
            orderBy: {
                [sortBy]: orderBy
            },
            take: limit,
            skip: (page - 1) * limit,
        })
        res.json(hotels)
    } catch(error){
        next(error)
    }
}
exports.getHotelById = async (req, res,next) => {
    const {hotelId} = req.params
    try{
        const hotel = await prisma.hotel.findUnique({
            where:{ id: Number(hotelId) },
            include:{
                facilitiesHotel: true,
                rooms: true,
                rooms:{
                    include:{
                        facilitiesRoom: true
                    }
                },
                reviews: true
            }
        })
        res.json(hotel)
    }catch(error){
        next(error)
    }
}
exports.createHotel = async (req, res,next) => {
    const {error, value} = createHotelSchema.validate(req.body)
    if(error){
        return createError(400, error.details[0].message)
    }
    const {name, detail, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage, partnerId } = value
    try{
        
        const newHotel = await prisma.hotel.create({
            data:{
                name,
                detail,
                address,
                lat,
                lng,
                star,
                checkinTime: new Date(checkinTime),
                checkoutTime: new Date(checkoutTime),
                phone,
                webPage,
                facilitiesHotel:{
                    create:facilitiesHotel
                },
                partner: {
                    connect: {
                        id: Number(partnerId)
                    }
                }
            },
        })
        res.json(newHotel)
    } catch(error){
        next(error)
    }
}
exports.updateHotel = async (req, res,next) => {
    const {hotelId} = req.params
    const { name, detail, img, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage, partnerId } = req.body
    try{
        const updatedHotel = await prisma.hotel.update({
            where:{ id: Number(hotelId) },
            data:{
                name,
                detail,
                img,
                address,
                lat,
                lng,
                star,
                checkinTime: new Date(checkinTime),
                checkoutTime: new Date(checkoutTime),
                phone,
                webPage,
                facilitiesHotel:{
                    create:facilitiesHotel
                }
            },
        })
        res.json(updatedHotel)
    } catch(error){
        next(error)
    }
}
exports.deleteHotel = async (req, res,next) => {
    const {hotelId} = req.params
    try{
        const deletedHotel = await prisma.hotel.delete({
            where:{ id: Number(hotelId) },
        })
        res.json(deletedHotel)
    } catch(error){
        next(error)
    }
}