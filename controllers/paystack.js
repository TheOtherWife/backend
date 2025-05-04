const https = require("https");

const handlePayment = (PAY_STACK_SECRET_KEY) => async (req, res) => {
  try {
    // Validate amount is a positive number
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Amount must be a positive number",
      });
    }

    // Convert to kobo and ensure it's an integer
    const amountInKobo = Math.round(amount * 100);

    const params = JSON.stringify({
      email: req.body.email,
      amount: amountInKobo, // Must be integer in kobo
      callback_url: "https://farmyapp.com",
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAY_STACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const reqPaystack = https.request(options, (resPaystack) => {
      let data = "";

      resPaystack.on("data", (chunk) => {
        data += chunk;
      });

      resPaystack.on("end", () => {
        try {
          const response = JSON.parse(data);

          if (!response.status) {
            // Forward Paystack's error message to client
            return res.status(400).json({
              status: false,
              message: response.message,
              code: response.code,
              data: response.data,
            });
          }

          return res.json({
            status: true,
            message: "Payment initialized",
            data: response.data,
          });
        } catch (error) {
          return res.status(500).json({
            status: false,
            message: "Error parsing payment response",
          });
        }
      });
    });

    reqPaystack.on("error", (error) => {
      return res.status(500).json({
        status: false,
        message: "Payment gateway error",
      });
    });

    reqPaystack.write(params);
    reqPaystack.end();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const handleVerifyTransaction = (PAY_STACK_SECRET_KEY) => async (req, res) => {
  const { reference } = req.query;

  try {
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAY_STACK_SECRET_KEY}`,
      },
    };

    const reqPaystack = https
      .request(options, (resPaystack) => {
        let data = "";

        resPaystack.on("data", (chunk) => {
          data += chunk;
        });

        resPaystack.on("end", () => {
          res.send(JSON.parse(data));
        });
      })
      .on("error", (error) => {
        console.error(error);
        res.send(error);
      });
    reqPaystack.end();
  } catch (error) {
    console.log(error);
  }
};

module.exports = { handlePayment, handleVerifyTransaction };
