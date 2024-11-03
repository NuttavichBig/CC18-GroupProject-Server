const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const cloudinary = require("../configs/cloudinary")
const fs = require("fs")
const path = require("path")

exports.getHotels = async (req, res, next) => {
    try {
        const { search, maxPrice, minPrice, star, orderBy, sortBy, facilities, limit, page, isActive } = req.input

        // make initial condition
        const condition = {
            orderBy: {},
            take: limit,
            skip: (page - 1) * limit,
            include: {
                rooms: true,
                reviews: true
            }
        }

        // check nest sorted
        if (sortBy !== 'price' && sortBy !== 'rating') {
            condition.orderBy = {
                [sortBy]: orderBy
            }
        }

        // check where condition
        if (search || minPrice || maxPrice || star || facilities || isActive) {
            condition.where = {
                ...(search && { name: { contains: search } }),
                ...(star && { star: { equals: star } }),
                ...(facilities && { facilitiesHotel: { AND: facilities.map((item) => ({ [item]: true })) } }),
                ...(isActive && { isActive: { equals: isActive } })
            }
            if (maxPrice) {
                condition.where.rooms = {
                    some: {
                        AND: [
                            (minPrice !== undefined && { price: { gte: minPrice } }),
                            (maxPrice !== undefined && { price: { lte: maxPrice } })
                        ]
                    }
                };
            }else{
                condition.where.rooms = {
                    some: {
                            ...(minPrice !== undefined && { price: { gte: minPrice } }),
                    }
                };
            }
        }
        const getHotels = await prisma.hotel.findMany(condition)
        let finalHotels = []
        if(getHotels.length > 0){
            // avg review rating
            const hotels = getHotels.map(hotel=>{
                if(hotel.reviews.length > 0){
                    const totalRate = hotel.reviews.reduce((acc,prv)=>acc+prv.rating,0)
                    hotel.rating = totalRate/hotel.reviews.length
                }else{
                    hotel.rating = null
                }
                return hotel
            })
            
            // sort nest
            let sortedHotels = [...hotels]
            if (sortBy === 'price') {
                if(orderBy === 'asc'){
                    sortedHotels = hotels.sort((a, b) => {
                        const minPriceA = a.rooms.length ? Math.min(...a.rooms.map(room => room.price)) : Infinity; // Handle no rooms
                        const minPriceB = b.rooms.length ? Math.min(...b.rooms.map(room => room.price)) : Infinity;
                        return minPriceA - minPriceB;
                    });
                }else{
                    sortedHotels = hotels.sort((a, b) => {
                        const minPriceA = a.rooms.length ? Math.max(...a.rooms.map(room => room.price)) : -Infinity; // Handle no rooms
                        const minPriceB = b.rooms.length ? Math.max(...b.rooms.map(room => room.price)) : -Infinity;
                        return minPriceB - minPriceA
                    });
                }
            }
            if(sortBy === 'rating'){
                sortedHotels =hotels.sort((a,b)=>{
                    return orderBy === 'asc'?a.rating-b.rating : b.rating - a.rating
                })
            }
            
            // filter for data
            finalHotels = sortedHotels.map(hotel=>{
                const {reviews,rooms,...data} = hotel
                return data
            })
        }
        res.json({ hotels: finalHotels })
    } catch (error) {
        next(error)
    }
}
exports.getHotelById = async (req, res, next) => {
    const { hotelId } = req.params
    try {
        const hotel = await prisma.hotel.findUnique({
            where: { id: Number(hotelId) },
            include: {
                facilitiesHotel: true,
                rooms: true,
                rooms: {
                    include: {
                        facilitiesRoom: true
                    }
                },
                reviews: true
            }
        })
        
        res.json(hotel)
    } catch (error) {
        next(error)
    }
}
exports.createHotel = async (req, res, next) => {
    try {
    const { name, detail, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage, img } = req.input
    let partner = await prisma.partner.findUnique({
        where: {
            userId: Number(req.user.id),
        },
    });

    if (!partner) {
        return createError(404, "Partner not found")
    }

    let uploadedImg = null

    if (req.file) {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
            overwrite: true,
            public_id: path.parse(req.file.path).name
        })
        uploadedImg = uploadedFile.secure_url
        fs.unlinkSync(req.file.path)
    }


        const newHotel = await prisma.hotel.create({
            data: {
                name,
                detail,
                address,
                lat,
                lng,
                star,
                checkinTime,
                checkoutTime,
                phone,
                webPage,
                img: uploadedImg,
                facilitiesHotel: {
                    create: facilitiesHotel
                },
                partner: {
                    connect: {
                        id: Number(partner.id),
                    }
                }
            },
        })
        res.json(newHotel)
    } catch (error) {
        next(error)
    }
}
exports.updateHotel = async (req, res, next) => {
    const { hotelId } = req.params
    const { name, detail, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage } = req.input
    let uploadedImg = null
    if (req.file) {
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
            overwrite: true,
            public_id: path.parse(req.file.path).name
        })
        uploadedImg = uploadedFile.secure_url
        fs.unlinkSync(req.file.path)
    }
    try {
        const updatedHotel = await prisma.hotel.update({
            where: { id: Number(hotelId) },
            data: {
                name,
                detail,
                img: uploadedImg,
                address,
                lat,
                lng,
                star,
                checkinTime,
                checkoutTime,
                phone,
                webPage,
                facilitiesHotel: {
                    upsert: {
                        create: facilitiesHotel,
                        update: facilitiesHotel
                    }
                }
            },
        })
        res.json(updatedHotel)
    } catch (error) {
        next(error)
    }
}
exports.deleteHotel = async (req, res, next) => {
    const { hotelId } = req.params
    try {
        const deletedHotel = await prisma.hotel.delete({
            where: { id: Number(hotelId) },
        })
        res.json(deletedHotel)
    } catch (error) {
        next(error)
    }
}