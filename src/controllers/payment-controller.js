// const stripe = require("stripe")(
//     "sk_test_51QHdYyBU681vIFBkAcT7iTHtfb6komW0wJyMrsANqQO2QLZjhrA8dHV3eeRNk8rLdfG7lXjEloRTXiJBRCb0oDk300Z3gJr4Sr"
// );

// exports.payment = async (req, res) => {
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: 1000,
//             currency: "thb",
//             payment_method_types: ["card", "promptpay"],
//         });

//         getPaymentMethodDetails("pi_3QHoZJBU681vIFBk2EUdL7M3")  //ไปเอาidจากหน้าบ้าน เปลี่ยนตามไอดีเพื่อหาpayment method หลังบ้านตรงtype
//         console.log(paymentIntent)
//         console.log("------------------------------------")

//         res.send({
//             clientSecret: paymentIntent.client_secret,
//         });

//     } catch (error) {
//         console.error("Error creating payment intent:", error);
//         res.status(500).send({ error: "An error occurred while creating the payment intent." });
//     }
// };

// async function getPaymentMethodDetails(paymentIntentId) {
//     try {
//         // Step 1: Retrieve the payment intent
//         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//         // Step 2: Retrieve the payment method details using the payment_method ID from the payment intent
//         const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);

//         // Step 3: Decode and use the payment method details
//         console.log("Payment Method Details:", paymentMethod);
//         return paymentMethod;
//     } catch (error) {
//         console.error("Error retrieving payment method details:", error);
//         throw error;
//     }

const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res, next) => {
    try {
        const { totalPrice } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(totalPrice) * 100,
            currency: "thb",
            payment_method_types: ["card", "promptpay"],
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        next(error);
    }
};

exports.paymentSuccess = async (req, res, next) => {
    try {
        const { stripeId, bookingId } = req.body;
        const haveBooking = prisma.booking.findFirst({
            where: { id: Number(bookingId) },
        });

        if (haveBooking) {
            return createError(404, "Book not found");
        }

        await prisma.booking.update({
            where: {
                bookingId: Number(bookingId),
            },
            data: {
                status: "CONFIRMED",
            },
        });

        let type = getPaymentMethodDetails(stripeId);
        if (type === "card") {
            type = "CREDITCARD";
        }
        if (type === "promptpay") {
            type = "SCAN";
        }

        await prisma.payment.create({
            data: {
                paymentMethod: type,
                bookingId: Number(bookingId),
                stripeId,
            },
        });
        res.json("Create Payment Success");
    } catch (error) {
        next(error);
    }
};

async function getPaymentMethodDetails(paymentIntentId) {
    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const paymentMethod = await stripe.paymentMethods.retrieve(
            paymentIntent.payment_method
        );
        return paymentMethod.type;
    } catch (error) {
        console.error("Error retrieving payment method details:", error);
        throw error;
    }
}
