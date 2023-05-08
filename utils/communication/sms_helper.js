const http = require("https");

const sendSMS = (smsOption) => {
    return new Promise((resolve, reject) => {

        const data = JSON.stringify({
            sender: process.env.SMS_SERVICE_SENDER_ID,
            ...smsOption
        })

        var options = {
            "method": "POST",
            "hostname": "api.msg91.com",
            "port": null,
            "path": "/api/v5/flow/",
            "headers": {
              "authkey": process.env.SMS_SEVICE_AUTH_KEY,
              "content-type": "application/JSON"
            }
          };
          
        var req = http.request(options, function (res) {
            var chunks = [];
            
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            
            res.on("end", function () {
                var body = Buffer.concat(chunks).toString();
                console.log(body);

                if(JSON.parse(body).type == "error") {
                    resolve(false)
                }
                
                resolve(true)
            });
        });
        req.write(data);
        req.end();
    })
}

module.exports = {
    sendOTP: (smsOptions) => {
        return new Promise((resolve, reject) => {

            const data = {
                otp: smsOptions.otp,
                template_id: process.env.SMS_SERVICE_OTP_TEMPLATE_ID,
                mobile: "91" + smsOptions.phone,
                authkey: process.env.SMS_SEVICE_AUTH_KEY
            }


            var options = {
                "method": "GET",
                "hostname": "api.msg91.com",
                "port": null,
                "path": `/api/v5/otp?template_id=${process.env.SMS_SERVICE_OTP_TEMPLATE_ID}&mobile=${data.mobile}&authkey=${data.authkey}&otp=${data.otp}`,
                "headers": {
                    "content-type": "application/json"
                }
            };
            
            var req = http.request(options, function (res) {
                var chunks = [];
                
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                
                res.on("end", function () {
                    var body = Buffer.concat(chunks).toString();
                    console.log(body);

                    if(JSON.parse(body).type == "error") {
                        resolve(false)
                    }
                    
                    resolve(true)
                });
            });
            
            req.end();
        })
    },

    retryOTP: (smsOptions) => {

        return new Promise((resolve, reject) => {

            const data = {
                mobile: "91" + smsOptions.phone,
                authkey: process.env.SMS_SEVICE_AUTH_KEY
            }

            const options = {
                "method": "GET",
                "hostname": "api.msg91.com",
                "port": null,
                "path": `/api/v5/otp/retry?authkey=${data.authkey}&retrytype=text&mobile=${data.mobile}`,
                "headers": {}
            };
            
            const req = http.request(options, function (res) {
                const chunks = [];
            
                res.on("data", function (chunk) {
                    chunks.push(chunk);
                });
                
                res.on("end", function () {
                    var body = Buffer.concat(chunks).toString();
                    console.log(body);

                    if(JSON.parse(body).type == "error") {
                        resolve(false)
                    }
                    
                    resolve(true)
                });

            });
            
            req.end();
        })

    }
}
