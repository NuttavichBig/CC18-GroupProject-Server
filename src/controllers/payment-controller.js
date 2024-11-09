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
            where : {
                bookingId : Number(bookingId)
            }
        })
        if(existingPayment){
            return createError(409,"Payment for this booking already exist")
        }

        // Update booking status to "CONFIRMED"
        const booking = await prisma.booking.update({
            where: { id: Number(bookingId) },
            data: { status: "CONFIRMED" },
            include : {
                hotels : true,
                bookingRooms :{
                    include :{
                        rooms : {
                            include : {
                                images : true
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
       const payment =  await prisma.payment.create({
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
      <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #4a90e2;">Your Booking has Completed</h2>
        <div>
          <p style="text-align: center; color: #555; font-size: 16px;">Your Booking ID : ${booking.UUID}</p>
          <p style="text-align: center; color: #555; font-size: 16px;">Booker name : ${booking.firstName+' '+booking.lastName}</p>
          <p style="text-align: center; color: #555; font-size: 16px;">Hotel : ${booking.hotels.name}</p>
          <p style="text-align: center; color: #555; font-size: 16px;">Address : ${booking.hotels.address}</p>
          <p style="text-align: center; color: #555; font-size: 16px;">Check-in : ${checkInDateString}</p>
          <p style="text-align: center; color: #555; font-size: 16px;">Check-out : ${checkOutDateString}</p>
        </div>
        <p style="text-align: center; color: #555; font-size: 14px;">
          Contact us for more information or miss some information cc18hotelbook@gmail.com .
        </p>
      </div>`
      };
      transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

        res.json({ message: "Create Payment Success" ,booking : booking,payment : payment });
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
