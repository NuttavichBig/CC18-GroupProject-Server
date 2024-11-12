const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const cloudinary = require("../configs/cloudinary")
const getPublicId = require("../utility/getPublicId")
const fs = require("fs/promises")
const path = require("path");
const haversine = require("../utility/haversine");

exports.getHotels = async (req, res, next) => {
    try {
        const { search, maxPrice, minPrice, star, orderBy, sortBy, facilities, limit, page, isActive, lat, lng, checkinDate, checkoutDate, guest, roomAmount, roomType } = req.input
        const maxDistance = 8000
        // make initial condition'
        const condition = {
            orderBy: {},
            // take: limit,
            // skip: ((page - 1) * limit),
            include: {
                rooms: true,
                reviews: true,
                facilitiesHotel: true
            },
            where: {},
        }
        //  console.log(condition.skip,condition.take)

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
                ...(isActive && { isActive: { equals: isActive } }),
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
            } else {
                condition.where.rooms = {
                    some: {
                        ...(minPrice !== undefined && { price: { gte: minPrice } }),
                    }
                };
            }
        }

        // console.log(condition)
        const getHotels = await prisma.hotel.findMany(condition)

        let finalHotels = []
        if (getHotels.length > 0) {
            // around location filter
            let nearbyHotels = [...getHotels]
            if (lat && lng) {
                const currentLocation = { latitude: parseFloat(lat), longitude: parseFloat(lng) }
                //filter location with maxDistance 
                nearbyHotels = getHotels.filter(hotel => {
                    if (hotel.lat && hotel.lng) {
                        const point = { latitude: parseFloat(hotel.lat), longitude: parseFloat(hotel.lng) };
                        const distance = haversine(currentLocation, point)
                        return distance < maxDistance
                    }
                    return false
                })
                if(nearbyHotels.length === 0){
                    return res.json({hotels : nearbyHotels})
                }
            }

            // avg review rating
            let hotels = nearbyHotels.map(hotel => {
                if (hotel.reviews.length > 0) {
                    const totalRate = hotel.reviews.reduce((acc, prv) => acc + prv.rating, 0)
                    hotel.rating = totalRate / hotel.reviews.length
                } else {
                    hotel.rating = null
                }
                return hotel
            })

            //filter for date
            if (checkinDate) {
                let dateList = []
                let startDate = new Date(checkinDate)
                do {
                    dateList.push(new Date(startDate))
                    startDate.setDate(startDate.getDate() + 1)
                } while (checkoutDate && startDate < checkoutDate)
                for (let hotel of hotels) {
                    let availableRoom = hotel.rooms.length
                    for (const room of hotel.rooms) {
                        if (room.price < minPrice) {
                            availableRoom--
                            break;
                        } else if (maxPrice && room.price > maxPrice) {
                            availableRoom--
                            break;
                        }
                        if(guest){
                            if(guest > room.recommendPeople){
                                availableRoom--
                                break;
                            }
                        }
                        if(roomType){
                            if(roomType !== room.type){
                                availableRoom--
                                break;
                            }
                        }
                        let isAvailable = true
                        for (const date of dateList) {
                            const bookNo = await prisma.booking.count({
                                where: {
                                    checkinDate: { lte: date },
                                    checkoutDate: { gt: date },
                                    bookingRooms: {
                                        some: {
                                            roomId: room.id
                                        }
                                    }
                                }
                            })
                            if (room.roomAmount - bookNo < roomAmount) {
                                isAvailable = false
                                break;
                            }
                        }
                        if (isAvailable === false) {
                            availableRoom--
                            break;
                        }
                    }
                    if (availableRoom <= 0) {
                        hotel = null
                    }
                }
                hotels = hotels.filter(item => item !== null)
            }


            // sort nest
            let sortedHotels = [...hotels]
            if (sortBy === 'price') {
                if (orderBy === 'asc') {
                    sortedHotels = hotels.sort((a, b) => {
                        const minPriceA = a.rooms.length ? Math.min(...a.rooms.map(room => room.price)) : Infinity; // Handle no rooms
                        const minPriceB = b.rooms.length ? Math.min(...b.rooms.map(room => room.price)) : Infinity;
                        return minPriceA - minPriceB;
                    });
                } else {
                    sortedHotels = hotels.sort((a, b) => {
                        const minPriceA = a.rooms.length ? Math.max(...a.rooms.map(room => room.price)) : -Infinity; // Handle no rooms
                        const minPriceB = b.rooms.length ? Math.max(...b.rooms.map(room => room.price)) : -Infinity;
                        return minPriceB - minPriceA
                    });
                }
            }
            else if (sortBy === 'rating') {
                sortedHotels = hotels.sort((a, b) => {
                    return orderBy === 'asc' ? a.rating - b.rating : b.rating - a.rating
                })
            }

            // filter for data
            finalHotels = sortedHotels.map(hotel => {
                const { reviews, rooms, ...data } = hotel
                return data
            })
        }

        const skip = (page-1)*limit
        const takeHotels = finalHotels.splice(skip,limit)
        res.json({ hotels: takeHotels })
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
                        facilitiesRoom: true,
                        images : true
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
        const { name, detail, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage } = req.input

        // check is partner registered
        const partner = await prisma.partner.findUnique({
            where: {
                userId: req.user.id
            }
        })
        if (!partner) {
            return createError(400, "Please complete your partner registered form")
        }

        // check is already have hotel
        const hotels = await prisma.hotel.findMany({
            where: {
                partnerId: partner.id
            }
        })
        if (hotels.length > 0) {
            const findActive = hotels.find(item => item.isActive === true)
            if (findActive) {
                return createError(400, "You already have registered hotel")
            }
        }

        // image handle
        if (!req.file) {
            return createError(400, "Image must be provided")
        }
        const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
            overwrite: true,
            public_id: path.parse(req.file.path).name
        })
        const uploadedImg = uploadedFile.secure_url
        fs.unlink(req.file.path)


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
    try {
        const { hotelId } = req.params
        // const { name, detail, address, lat, lng, star, checkinTime, checkoutTime, facilitiesHotel, phone, webPage } = req.input

        // check exist
        const hotel = await prisma.hotel.findUnique({
            where: {
                id: +hotelId
            }, include: {
                partner: {
                    select: {
                        userId: true
                    }
                }
            }
        })
        if (!hotel) {
            return createError(404, "This hotel no longer exist")
        }
        console.log(req.user.id)
        console.log(hotel.partner.userId)
        // check owner
        if (req.user.id !== hotel.partner.userId) return createError(401, "You don't have permitted")


        const {facilitiesHotel,...body} = req.input

        body.facilitiesHotel = {
            upsert : {
                create : facilitiesHotel,
                update : facilitiesHotel
            }
        }

        // image handle
        if (req.file) {
            const uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                overwrite: true,
                public_id: path.parse(req.file.path).name
            })
            body.img = uploadedFile.secure_url
            fs.unlink(req.file.path)
            if (hotel.img) {
                cloudinary.uploader.destroy(getPublicId(hotel.img))
            }
        }
        const updatedHotel = await prisma.hotel.update({
            where: { id: Number(hotelId) },
            data: body,
            include:{
                facilitiesHotel : true
            }
        })
        res.json(updatedHotel)
    } catch (error) {
        next(error)
    }
}
exports.deleteHotel = async (req, res, next) => {
    try {
        const { hotelId } = req.params

        // check exist
        const hotel = await prisma.hotel.findUnique({
            where: {
                id: +hotelId
            }, include: {
                partner: {
                    select: {
                        userId: true
                    }
                }
            }
        })
        if (!hotel) {
            return createError(404, "This hotel no longer exist")
        }
        // check owner
        if (req.user.id !== hotel.partner.userId) return createError(401, "You don't have permitted")
        const deletedHotel = await prisma.hotel.update({
            where: { id: Number(hotelId) },
            data: {
                isActive: false
            }
        })
        res.json(deletedHotel)
    } catch (error) {
        next(error)
    }
}