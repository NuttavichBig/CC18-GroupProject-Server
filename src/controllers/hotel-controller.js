const prisma  = require("../configs/prima");
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
    const { name, detail, img, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage, partnerId } = req.body
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