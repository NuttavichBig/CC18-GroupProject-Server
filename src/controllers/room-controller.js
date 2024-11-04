const createError = require("../utility/createError");
const path = require("path");
const prisma = require("../configs/prisma");
const fs = require("fs/promises");
const cloudinary = require("../configs/cloudinary");
const getPublicId = require("../utility/getPublicId")

exports.createRoom = async (req, res, next) => {
  try {
    const {
      name,
      detail,
      type,
      price,
      recommendPeople,
      facilityRoom,
      size,
      roomAmount,
    } = req.input;

    const { id } = req.user
    const partner = await prisma.partner.findFirst({
      where: { userId: Number(id) }
    })

    if (!partner) {
      return createError(400, "ํYou are not a partner")
    }

    const hotel = await prisma.hotel.findFirst({
      where: {
        partnerId: partner.id,
        isActive: true
      }
    })
    if (!hotel) {
      return createError(400, "Please create hotel")
    }

    const files = req.files;
    const uploadResults = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          overwrite: true,
          public_id: path.parse(file.path).name,
        });
        uploadResults.push(uploadResult.secure_url); // Collect the secure URLs
        fs.unlink(file.path); // Remove the file after upload
      }
    }
    console.log(facilityRoom)
    const newRoom = await prisma.room.create({
      data: {
        name,
        detail,
        type,
        price: Number(price),
        recommendPeople: Number(recommendPeople),
        hotel :{
          connect: {id : hotel.id}
        },
        size: Number(size),
        roomAmount: Number(roomAmount),
        facilitiesRoom: {
          create: facilityRoom,
        },
      },
    });


    const RoomImg = uploadResults.map((el) => ({
      img: el,
      roomId: newRoom.id, // Associate each image with the created room
    }));

    await prisma.roomImg.createMany({
      data: RoomImg,
    });
    res.json(newRoom); // Create Image room
  } catch (error) {
    next(error);
  }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const {
      name,
      detail,
      type,
      price,
      size,
      recommendPeople,
      facilityRoom,
      roomAmount,
      deleteImage,
    } = req.input;

    // check exist
    const room = await prisma.room.findFirst({
      where: {
        id: Number(roomId),
      },include:{
        hotel :{
          select : {
            partnerId : true
          }
        }
      }
    })
    if (!room) {
      return createError(404, "This room does not Exist!!");
    }

    const partner = await prisma.partner.findUnique({
      where : {
        userId : req.user.id
      }
    })

    if(room.hotel.partnerId !== partner.id){
      return createError(401,"You don't have permitted")
    }
    //image handle
    const files = req.files;
    const uploadResults = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          overwrite: true,
          public_id: path.parse(file.path).name,
        });
        uploadResults.push(uploadResult.secure_url); // Collect the secure URLs
        fs.unlink(file.path); // Remove the file after upload
      }
    }


    const updateRoom = await prisma.room.update({
      where: {
        id: Number(roomId),
      },
      data: {
        name,
        detail,
        type,
        price: Number(price),
        size: Number(size),
        recommendPeople: Number(recommendPeople),
        roomAmount: Number(roomAmount),
        facilitiesRoom: {
          update: facilityRoom,
        },
      },
    });
    const RoomImg = uploadResults.map((el) => ({
      img: el,
      roomId :+roomId, // Associate each image with the created room
    }));
    await prisma.roomImg.createMany({
      data: RoomImg,
    });


    //DELETE IMAGE    
    if (deleteImage && deleteImage.length > 0) {
      for(const img of deleteImage) {
      cloudinary.uploader.destroy(getPublicId(img))
      const imageId = await prisma.roomImg.findFirst({
        where : {
          img : img
        }
      })
      await prisma.roomImg.delete({
        where : {
              id : imageId.id
      }})
      }
  }

    res.json(updateRoom);
  } catch (error) {
    next(error);
  }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await prisma.room.findFirst({
      where: {
        id: Number(roomId),
      },
      include: {
        images: true,
      },
    });

    if (!room) {
      return createError(404, "This room does not Exist!!");
    }

    for (const image of room.images) {
      const publicId = path.parse(image.img).name; // Extract the public_id from the image URL
      await cloudinary.uploader.destroy(publicId); // Delete the image from Cloudinary
    }

    await prisma.roomImg.deleteMany({
      where: { roomId: room.id },
    });

    await prisma.room.delete({
      where: { id: room.id },
    });

    res.json({ message: "Room and associated photos deleted successfully" });
  } catch (error) {
    next(error);
  }
};
