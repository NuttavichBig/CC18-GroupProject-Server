const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utility/createError");
const checkUser = require("../services/check-user")
const nodemailer = require("nodemailer")

const prisma = require("../configs/prisma");
const oAuth2Client = require("../configs/oAuth2Client")

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
    const { password: ps, role, createdAt, updatedAt, resetPasswordToken, status, ...respData } = user
    res.json({ token, user: respData });
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
      text: "Hello Click Link to resetPassword", // plain text body
      html: `
    <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="text-align: center; color: #4a90e2;">🔒 Reset Your Password</h2>
      <p style="text-align: center; color: #555; font-size: 16px;">
        We received a request to reset your password. Please click the button below to set a new password:
      </p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="http://localhost:5173/reset-password/${token}" style="
          display: inline-block; 
          padding: 15px 30px; 
          font-size: 16px; 
          color: #fff; 
          background: linear-gradient(90deg, #ff6f61, #de6b83); 
          border-radius: 5px; 
          text-decoration: none; 
          transition: background 0.3s;">
          Reset Password
        </a>
      </div>
      <p style="text-align: center; color: #555; font-size: 14px;">
        If you did not request a password reset, please ignore this email.
      </p>
    </div>`
    };
    transporter.sendMail(mailOptions, async (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
        await prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            resetPasswordToken: token
          }
        })
      }
    });


    res.json({ message: 'Please check your email', token })

  } catch (err) {
    next(err);
  }
}

exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.input
    // check is request?
    if (!req.user.resetPasswordToken) {
      return createError(400, "You haven't request for reset password")
    }
    // get token
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    if (token !== req.user.resetPasswordToken) {
      return createError(400, "Your token is not for reset password")
    }

    // check password 
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      }, select: {
        password: true
      }
    })
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      return createError(400, "You can't use old password");
    }

    // hash then change
    const hashPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: {
        id: req.user.id
      },
      data: {
        password: hashPassword,
        resetPasswordToken: null
      }
    })
    res.json({ message: "Successfully reset password" })
  } catch (err) {
    next(err)
  }
}

// exports.googleLogin = async (req, res, next) => {
//   try {
//     const { credential } = req.body;

//     if (!credential) {
//       return createError(400, "Please try to login")
//     }

//     const ticket = await oAuth2Client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.CLIENT_ID,
//     });

//     const payloadFromGoogle = ticket.getPayload();
//     const googleId = payloadFromGoogle["sub"];
//     const email = payloadFromGoogle["email"];
//     const firstName = payloadFromGoogle["given_name"];
//     const lastName = payloadFromGoogle["family_name"];

//     let user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       user = await prisma.user.create({
//         data: {
//           firstName,
//           lastName,
//           email,
//           googleId,
//         },
//       });
//     } else {
//       if (!user.googleId) {
//         user = await prisma.user.update({
//           where: { email },
//           data: { googleId },
//         });
//       }
//     }

//     const payload = {
//       id: user.id,
//     };

//     const token = jwt.sign(payload, process.env.SECRET_KEY, {
//       expiresIn: "1d",
//     });

//     res.json({ token });
//   } catch (error) {
//     next(error);
//   }
// };



const https = require('https');

// Google Login API สำหรับใช้ Access Token
exports.googleLogin = async (req, res, next) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ message: "Invalid access token, please try again" });
    }

    // ดึงข้อมูลผู้ใช้จาก Google API โดยใช้ https
    const googleApiUrl = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`;

    https.get(googleApiUrl, (response) => {
      let data = '';

      // รวบรวมข้อมูลที่ได้รับทีละส่วน
      response.on('data', (chunk) => {
        data += chunk;
      });

      // การตอบกลับเสร็จสิ้น
      response.on('end', async () => {
        try {
          const googleUserInfo = JSON.parse(data);

          const { id: googleId, email, given_name: firstName, family_name: lastName } = googleUserInfo;

          // ค้นหาผู้ใช้ในฐานข้อมูลโดยใช้อีเมลที่ดึงมา
          let user = await prisma.user.findUnique({
            where: { email },
          });

          // ถ้าไม่มีผู้ใช้นี้ ให้สร้างผู้ใช้ใหม่
          if (!user) {
            user = await prisma.user.create({
              data: {
                firstName,
                lastName,
                email,
                googleId,
              },
            });
          } else if (!user.googleId) {
            // ถ้ามีผู้ใช้แต่ยังไม่มี googleId ให้เพิ่ม googleId ให้กับผู้ใช้เดิม
            user = await prisma.user.update({
              where: { email },
              data: { googleId },
            });
          }

          // สร้าง JWT token เพื่อให้ผู้ใช้ล็อกอินเข้าสู่ระบบ
          const payload = { id: user.id };
          const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1d" });

          // ส่ง JWT token กลับไปยังไคลเอนต์
          res.json({ token });
        } catch (error) {
          console.error("Error parsing Google user info:", error);
          res.status(500).json({ message: "Failed to parse Google user info" });
        }
      });
    }).on('error', (error) => {
      console.error("Error during Google API request:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    });

  } catch (error) {
    console.error("Server error during Google login:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

