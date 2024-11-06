const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res, next) => {
    try {
        // const { totalPrice } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            // amount: Number(totalPrice) * 100,
            amount: 1000,
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
