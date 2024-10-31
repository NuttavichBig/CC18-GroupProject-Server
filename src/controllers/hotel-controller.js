const prisma  = require("../configs/prisma");
const createError = require("../utility/createError");

exports.getHotels = async (req, res, next) => {}
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
    const { name, detail, img, address, lat, lng, star, checkInTime, checkOutTime, facilityHotel, phone, webPage } = req.body
    console.log(req.body)
    try{
        const newHotel = await prisma.hotel.create({
            data:{
                name,
                detail,
                img,
                address,
                lat,
                lng,
                star,
                checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
                checkOutTime: checkOutTime ? new Date(checkOutTime) : new Date(),
                phone,
                webPage,
                facilitiesHotels:{
                    create:facilityHotel
                },
            },
        })
        res.json(newHotel)
    } catch(error){
        next(error)
    }
}
exports.updateHotel = async (req, res,next) => {
    const {hotelId} = req.params
    const { name, detail, img, address, lat, lng, star, checkInTime, checkOutTime, facilityHotel } = req.body
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
                checkInTime:new Date(checkInTime),
                checkOutTime:new Date(checkOutTime),
                facilitiesHotels:{
                    create:facilityHotel
                },
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