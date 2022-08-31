
exports.registerEmailParams = (token,name,email) => {
    return{
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: `
                    <html>
                    <h1 style="color:red;">Hello ${name}</h1>
                    <h2>Please use the following link to complete your registration</h2>
                    <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    </html>
                    `
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Complete your Registeration'
            }
        }
    };
}


exports.resetPasswordParams = (name, email, token) => {
    return {
        Source: process.env.EMAIL_FROM,
        Destination: {
            ToAddresses: [email]
        },
        ReplyToAddresses: [process.env.EMAIL_TO],
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `
                <html>
                        <h1 style="color:red;">Hello ${name}</h1>
                        <h2>Please use the following link to Reset Your Password</h2>
                        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                        </html>
                `
                }
                },
               
            Subject: {
                Charset: "UTF-8",
                Data: "Password Reset"
            }
        }
    };
};