const prisma = require("../src/config/prisma")
const bcrypt = require("bcryptjs")

const hashedPassword = bcrypt.hashSync('123456',10)


const user = [
    {
        email : "admin01@mail.com",
        password : hashedPassword,
        firstName : "admin01",
        lastName : "Leo",
        phone : '0123456789',
        gender : "MALE",
        role : "ADMIN",
    },
    {
        email : "admin02@mail.com",
        password : hashedPassword,
        firstName : "admin02",
        lastName : "Ploy",
        phone : '0123456789',
        gender : "FEMALE",
        role : "ADMIN",
    },
    {
        email : "admin03@mail.com",
        password : hashedPassword,
        firstName : "admin03",
        lastName : "Bell",
        phone : '0123456789',
        gender : "OTHER",
        role : "PARTNER",
    },
    {
        email : "admin04@mail.com",
        password : hashedPassword,
        firstName : "admin04",
        lastName : "Big",
        role : "USER",
    },
    {
        email : "admin05@mail.com",
        password : hashedPassword,
        firstName : "admin05",
        lastName : "Boeing",
        phone : '0123456789',
        role : "USER",
    },

]

