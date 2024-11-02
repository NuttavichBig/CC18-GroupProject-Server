const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utility/createError");
const checkUser = require("../services/check-user")
const nodemailer = require("nodemailer")

const prisma = require("../configs/prisma");

exports.register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      gender,
      birthdate,
    } = req.input;

    const isUserExist = await checkUser.byEmail(email)

    if (isUserExist) {
      return createError(400, "Email Already Exist");
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
    const { email, password } = req.input;
    const user = await checkUser.byEmail(email)

    if (!user) {
      return createError(400, "Email or Password incorrect");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return createError(400, "Email or Password incorrect");
    }

    if (user.status === "INACTIVE") {
      return createError(401, "Please request admin to active account");
    }

    if (user.status === "BANNED") {
      return createError(401, "Your account was banned");
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

exports.currentUser = async (req, res, next) => {
  try {
    const { createdAt, updatedAt, resetPasswordToken, status, ...userData } = req.user;
    res.json({ user: userData });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const data = req.input
    const id = req.user.id

    const updateData = await prisma.user.update({
      where: {
        id
      },
      data
    })

    const { password: ps, createdAt, updatedAt, resetPasswordToken, status, ...user } = updateData
    res.json({ message: "update success", user: user })
  } catch (err) {
    next(err);
  }
}

// INCOMPLETE WAIT FOR O2AUTH
exports.forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.input

    // check user 
    const user = await checkUser.byEmail(email)
    if (!user) {
      return createError(400, "This email is not registered")
    }
    if (user.status === "BANNED") {
      return createError(401, "Your account has been terminated");
    }
    if (user.status === "INACTIVE") {
      return createError(401, "Your account is inactive, please contact support")
    }

    // create token
    const payLoad = {
      id: user.id,
      message: 'use for reset password'
    }
    const token = jwt.sign(payLoad, process.env.SECRET_KEY, {
      expiresIn: "2h"
    })


    // email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'cc18hotelbook@gmail.com',
        pass: 'qgsfjdpcajvdfxkt'
      }
    });
    const mailOptions = {
      from: 'cc18hotelbook@gmail.com',
      to: email,
      subject: 'Hotel book account reset password',
      text: `this is reset password link for your account http://localhost:5703/reset-password/${token}`
    };
    transporter.sendMail(mailOptions, async(error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        await prisma.user.update({
          where : {
            id : user.id
          },
          data : {
            resetPasswordToken : token
          }
        })
      }
    });


    res.json({message : 'Please check your email',token})

  } catch (err) {
    next(err);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const {password} = req.input
    // check is request?
    if(!req.user.resetPasswordToken){
      return createError(400,"You haven't request for reset password")
    }
    // get token
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    if(token !== req.user.resetPasswordToken){
      return createError(400,"Your token is not for reset password")
    }

    // check password 
    const user = await prisma.user.findUnique({
      where : {
        id : req.user.id
      },select:{
        password : true
      }
    })
    const isPasswordMatch = await bcrypt.compare(password,user.password);
    if (isPasswordMatch) {
      return createError(400, "You can't use old password");
    }

    // hash then change
    const hashPassword = await bcrypt.hash(password,10);
    await prisma.user.update({
      where : {
        id : req.user.id
      },
      data : {
        password : hashPassword,
        resetPasswordToken : null
      }
    })
    res.json({message : "Successfully reset password"})
  } catch (err) {
    next(err)
  }
}