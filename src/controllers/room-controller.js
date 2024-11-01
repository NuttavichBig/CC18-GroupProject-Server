const createError = require("../utility/createError");
const path = require("path");
const prisma = require("../configs/prima");
const fs = require("fs");
const cloudinary = require("../configs/cloudinary");

exports.createRoom = async (req, res, next) => {
  try {
    const {
      name,
      detail,
      type,
      price,
      recommendPeople,
      hotelId,
      facilityRoom,
      roomAmount,
    } = req.body;

    const files = req.files;
    const uploadResults = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          overwrite: true,
          public_id: path.parse(file.path).name,
        });
        uploadResults.push(uploadResult.secure_url); // Collect the secure URLs
        fs.unlinkSync(file.path); // Remove the file after upload
      }
    }

    for (const key in facilityRoom) {
      if (facilityRoom[key] === "true") facilityRoom[key] = true;
      if (facilityRoom[key] === "false") facilityRoom[key] = false;
    }

    const newRoom = await prisma.room.create({
      data: {
        name,
        detail,
        type,
        price: Number(price),
        recommendPeople: Number(recommendPeople),
        hotel: {
          connect: { id: Number(hotelId) },
        },
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
      recommendPeople,
      facilityRoom,
      roomAmount,
    } = req.body;

    const updateRoom = await prisma.room.update({
      where: {
        id: Number(roomId),
      },
      data: {
        name,
        detail,
        type,
        price: Number(price),
        recommendPeople: Number(recommendPeople),
        roomAmount: Number(roomAmount),
        facilitiesRoom: {
          update: {
            update: facilityRoom,
          },
        },
      },
    });
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
