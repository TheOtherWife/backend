const https = require("https");

const handlePayment = (PAY_STACK_SECRET_KEY) => async (req, res) => {
  console.log(
    "Initiating payment with amount:",
    req.body.amount,
    "for email:",
    req.body.email
  );
  const { amount, email } = req.body;
  try {
    const params = JSON.stringify({
      email: email,
      amount: amount,
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
        res.send(error);
      });

    reqPaystack.write(params);
    reqPaystack.end();
  } catch (error) {
    console.log(error);
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
