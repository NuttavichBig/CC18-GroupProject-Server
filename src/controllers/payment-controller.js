const stripe = require("stripe")(
    "sk_test_51QHdYyBU681vIFBkAcT7iTHtfb6komW0wJyMrsANqQO2QLZjhrA8dHV3eeRNk8rLdfG7lXjEloRTXiJBRCb0oDk300Z3gJr4Sr"
);

exports.payment = async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1000,
            currency: "thb",
            payment_method_types: ["card", "promptpay"],
        });

        getPaymentMethodDetails("pi_3QHoZJBU681vIFBk2EUdL7M3")  //ไปเอาidจากหน้าบ้าน เปลี่ยนตามไอดีเพื่อหาpayment method หลังบ้านตรงtype
        console.log(paymentIntent)
        console.log("------------------------------------")

        res.send({
            clientSecret: paymentIntent.client_secret,
        });

    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).send({ error: "An error occurred while creating the payment intent." });
    }
};

async function getPaymentMethodDetails(paymentIntentId) {
    try {
        // Step 1: Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Step 2: Retrieve the payment method details using the payment_method ID from the payment intent
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);

        // Step 3: Decode and use the payment method details
        console.log("Payment Method Details:", paymentMethod);
        return paymentMethod;
    } catch (error) {
        console.error("Error retrieving payment method details:", error);
        throw error;
    }
}
