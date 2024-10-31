const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utility/createError");
const prisma = require("../config/prisma");

exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      gender,
      birthdate,
    } = req.body;

    const isUserExist = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (isUserExist) {
      return createError(400, "User Already Exist");
    }

    if (password !== confirmPassword) {
      return createError(400, "Password not match");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        firstName,
        lastName,
        phone,
        gender,
        birthdate,
      },
    });
    res.json({ message: "Register Successful" });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return createError(400, "user does not exist");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return createError(401, "Unauthorize");
    }

    if (user.status === "INACTIVE") {
      return create(401, "Please request admin to active account");
    }

    if (user.status === "BANNED") {
      return create(401, "Your account was banned");
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.json({ payload, token });
  } catch (err) {
    next(err);
  }
};

exports.currentUser = async (req, res, next) => {
  try {
    const id = req.user.id;
    const member = await prisma.user.findFirst({
      where: {
        id: +id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
    console.log(email);
    res.json({ member });
  } catch (err) {
    next(err);
  }
};
