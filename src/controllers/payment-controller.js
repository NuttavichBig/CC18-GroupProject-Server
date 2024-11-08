const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res, next) => {
    try {
        const { totalPrice } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(totalPrice) * 100,
            // amount: 1000,
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
        const { stripeId, bookingId, userId, promotionId } = req.body;

        // Ensure booking exists
        const haveBooking = await prisma.booking.findFirst({
            where: { id: Number(bookingId) },
        });
        if (!haveBooking) {
            return next(createError(404, "Booking not found"));
        }

        // Update booking status to "CONFIRMED"
        await prisma.booking.update({
            where: { id: Number(bookingId) },
            data: { status: "CONFIRMED" },
        });

        // If promotionId is provided, find and update userHavePromotion, or create a new one if not found
        if (promotionId) {
            let userPromotion = await prisma.userHavePromotion.findFirst({
                where: {
                    userId: Number(userId),
                    promotionId: Number(promotionId),
                },
            });

            if (userPromotion) {
                // Update existing userHavePromotion to mark it as used
                await prisma.userHavePromotion.update({
                    where: { id: userPromotion.id },
                    data: { isUsed: true },
                });
            } else {
                // If no entry exists, create a new one and mark it as used
                userPromotion = await prisma.userHavePromotion.create({
                    data: {
                        userId: Number(userId),
                        promotionId: Number(promotionId),
                        isUsed: true,
                    },
                });
            }
        }

        // Get payment type and validate
        let type = await getPaymentMethodDetails(stripeId);
        console.log("Payment Method Type:", type); // Debugging output
        if (type === "card") {
            type = "CREDITCARD";
        } else if (type === "promptpay") {
            type = "SCAN";
        } else {
            throw createError(400, "Invalid payment method type");
        }

        // Create payment record
        await prisma.payment.create({
            data: {
                paymentMethod: type,
                bookingId: Number(bookingId),
                stripeId,
            },
        });

        res.json({ message: "Create Payment Success" });
    } catch (error) {
        console.error("Error in paymentSuccess:", error);
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
