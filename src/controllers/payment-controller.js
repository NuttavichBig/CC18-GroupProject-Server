const prisma = require("../configs/prisma");
const createError = require("../utility/createError");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const nodemailer = require("nodemailer")

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

        // checking already pay
        const existingPayment = await prisma.payment.findFirst({
            where: {
                bookingId: Number(bookingId)
            }
        })
        if (existingPayment) {
            return createError(409, "Payment for this booking already exist")
        }

        // Update booking status to "CONFIRMED"
        const booking = await prisma.booking.update({
            where: { id: Number(bookingId) },
            data: { status: "CONFIRMED" },
            include: {
                hotels: true,
                bookingRooms: {
                    include: {
                        rooms: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
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
        console.log(bookingId)
        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                paymentMethod: type,
                bookingId: Number(bookingId),
                stripeId,
            },
        });

        // email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'cc18hotelbook@gmail.com',
                pass: 'qgsfjdpcajvdfxkt'
            }
        });
        const checkInDate = new Date(booking.checkinDate)
        const checkOutDate = new Date(booking.checkoutDate)
        const checkInDateString = `${checkInDate.getFullYear()}-${checkInDate.getMonth().toString().padStart(2, '0')}-${checkInDate.getDate().toString().padStart(2, '0')}`
        const checkOutDateString = `${checkOutDate.getFullYear()}-${checkOutDate.getMonth().toString().padStart(2, '0')}-${checkOutDate.getDate().toString().padStart(2, '0')}`
        const mailOptions = {
            from: 'cc18hotelbook@gmail.com',
            to: booking.email,
            subject: '[Hotel Book]Your Booking Has been completed',
            html: `
     <body style="margin: 0; padding: 0; background-color: #fdf2e9; font-family: 'Arial', sans-serif; width: 100%;">
    <table align="center" cellpadding="0" cellspacing="0" border="0"
        style="width: 100%; max-width: 600px; margin: 0 auto; border-collapse: collapse;">
        <tr>
            <td
                style="padding: 30px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="center"
                            style="padding: 20px; background: linear-gradient(90deg, #ff7e5f, #feb47b); border-radius: 10px 10px 0 0; color: white;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Booking Confirmation</h1>
                            <p style="margin: 0; font-size: 16px; font-weight: lighter;">Your reservation has been
                                successfully completed</p>
                        </td>
                    </tr>
                </table>


                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 10px;">
                            <img src="https://www.lappymaker.com/images/greentick-unscreen.gif" alt="Celebration GIF"
                                style="width: 100%; max-width: 300px; border-radius: 8px; display: block;" />
                        </td>
                    </tr>
                </table>


                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 20px; text-align: center;">
                            <p style="color: #444; font-size: 16px; text-align: center; line-height: 1.6;">
                                Thank you for choosing <strong>${booking.hotels.name}</strong>. We’re excited to host
                                you and make your
                                stay truly memorable.
                            </p>
                        </td>
                    </tr>
                </table>


                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td
                            style="padding: 20px; background-color: #fff6f0; border-radius: 8px; border: 1px solid #ffd4b8;">
                            <h2 style="color: #ff7e5f; font-size: 18px; margin: 0;">Booking Details</h2>
                            <p style="margin: 10px 0; color: #333; font-size: 14px;"><strong>Booking ID:</strong>
                                ${booking.UUID}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Booker Name:</strong>
                                ${booking.firstName} ${booking.lastName}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Hotel:</strong>
                                ${booking.hotels.name}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Address:</strong>
                                ${booking.hotels.address}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Check-in:</strong>
                                ${checkInDateString}</p>
                            <p style="margin: 5px 0; color: #333; font-size: 14px;"><strong>Check-out:</strong>
                                ${checkOutDateString}</p>
                        </td>
                    </tr>
                </table>


                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0;"></td>
                    </tr>
                </table>


                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <tr>
                        <td
                            style="padding: 20px; text-align: center; border-top: 1px solid #ffd4b8; background-color: #fff6f0;">
                            <p style="margin: 0; color: #777; font-size: 14px; line-height: 1.6;">
                                If you have any questions or require further assistance, feel free to contact us at
                                <a href="mailto:cc18hotelbook@gmail.com"
                                    style="color: #ff7e5f; text-decoration: none; font-weight: bold;">cc18hotelbook@gmail.com</a>.
                            </p>
                            <p style="margin: 10px 0 0; color: #999; font-size: 12px;">© 2024 Hotel Book. All rights
                                reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
`
        };
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.json({ message: "Create Payment Success", booking: booking, payment: payment });
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
