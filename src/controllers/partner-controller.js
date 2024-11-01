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
    const { companyName, address, taxNo, bankName, bankAccount } = req.body;
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

    if (company.companyName === companyName) {
      return createError(400, "Already have company name");
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
    const { address, bankName, bankAccount } = req.body;

    const editPartner = await prisma.partner.update({
      where: {
        userId: Number(id),
      },
      data: {
        address,
        bankName,
        bankAccount,
      },
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

    await prisma.partner.update({
      where: {
        userId: Number(id),
      },
      data: {
        status: "INACTIVE",
      },
    });
    res.json("Inactive Success");
  } catch (error) {
    next(error);
  }
};
