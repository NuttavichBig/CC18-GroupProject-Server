require('dotenv').config()

const prisma = require("../src/configs/prisma")
const dbName = process.env.DATABASE_NAME

async function run() {
    await prisma.$executeRawUnsafe(`DROP DATABASE ${dbName}`)
    await prisma.$executeRawUnsafe(`CREATE DATABASE ${dbName}`)
}

console.log("Reset DB")
run()