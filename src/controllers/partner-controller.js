const prisma = require("../configs/prisma");
const createError = require("../utility/createError");

exports.getPartnerInfo = async (req, res, next) => {
  try {
    const { id } = req.user;
    const partnerInfo = await prisma.partner.findUnique({
      where: {
        userId: id,
      },
      select: {
        companyName: true,
        address: true,
        taxNo: true,
        bankName: true,
        bankAccount: true,
      },
    });

    res.json(partnerInfo);
  } catch (error) {
    next(error);
  }
};

exports.createPartner = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { companyName, address, taxNo, bankName, bankAccount } = req.input;
    console.log("1")
    const partner = await prisma.partner.findFirst({
      where: {
        userId: Number(id),
      },
    });

    if (partner) {
      return createError(400, "Your Account has been register");
    }

    const company = await prisma.partner.findFirst({
      where: {
        companyName,
      },
    });

    if (company) {
      return createError(400, "Already have this company");
    }

    const newPartner = await prisma.partner.create({
      data: {
        companyName,
        address,
        taxNo,
        bankName,
        bankAccount,
        userId: Number(id),
      },
    });
    res.json(newPartner);
  } catch (error) {
    next(error);
  }
};

exports.updatePartner = async (req, res, next) => {
  try {
    const { id } = req.user;
    const partner = await prisma.partner.findUnique({
      where : {
        userId : id
      }
    })
    if(!partner){
      return createError(401,"You are not partner")
    }
    const editPartner = await prisma.partner.update({
      where: {
        id : partner.id
      },
      data:req.input
    });

    const { userId, createdAt, updatedAt, status, ...partnerData } =
      editPartner;

    res.json({ partner: partnerData });
  } catch (error) {
    next(error);
  }
};

exports.deletePartner = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    if (role !== "PARTNER") {
      return createError(401, "Unauthorized");
    }

    const partner = await prisma.partner.update({
      where: {
        userId: Number(id),
      },
      data: {
        status: "INACTIVE",
      },
    });

    await prisma.hotel.updateMany({
      where : {
        partnerId : partner.id
      },data :{
        isActive : false
      }
    })
    res.json("Inactive Success");
  } catch (error) {
    next(error);
  }
};
