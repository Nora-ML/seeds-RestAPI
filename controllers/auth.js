const User = require('../models/User');
const jwt=require('jsonwebtoken')
const AWS = require("aws-sdk")
const { registerEmailParams,resetPasswordParams } = require('../helpers/email.js');
const shortId = require('shortid');
const { expressjwt: expressJWT } = require('express-jwt');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1", 
})

const ses=new AWS.SES({apiVersion:'2010-12-01'})

exports.register = (req, res) => {
	//console.log("Register ..... req.body:",req.body)
	const { name, email, password } = req.body;
	// check if user exists in DB
	//if we are looking for only one user use findOne
	//its better for performance than find() in this case
	User.findOne({ email }).exec((error, user) => {
		if (user) {
			console.log("Error :", user);
			return res.status(400).json({ error: "email is taken !" });
		} else {
			//generate token with user name email and password
			//we will send this token to the users email
			//when he clicks on it he will be directed to the frontPage
			//the front page send the token back to the server
			//the server will decode it(express-jwt) using the secret and finally verify user !
			const token = jwt.sign(
				{ name, email, password },
				process.env.JWT_ACCOUNT_ACTIVATION,
				{ expiresIn: "10m" }
			);

			const params = registerEmailParams(token, name, email);
			const sendEmailOnRegister = ses.sendEmail(params).promise();

			sendEmailOnRegister
				.then((data) => {
					console.log("data :", data);
					return res.json({
						message: `Email has been sent to ${email},follow the instruction to complete your registeration !`,
					});
				})
				.catch((error) => {
					console.log("error :", error);
					return res
						.status(400)
						.json({ message: `Couldn't send email to ${email} !` });
				});
		}
	});
};

exports.registerActivate = (req, res) => {
	const { token } = req.body;
	jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (error, decoded) => {
		if (error) {
			return res.status(401).json({ error: "Expired link.Try Again." });
		} else {
			const { name, email, password } = jwt.decode(token);
			const username = shortId.generate();
			User.findOne({ email }).exec((error, user) => {
				if (user) {
					return res.status(401).json({ error: "Email is taken" });
				} else {
					//register new user
					const user = new User({ username, name, email, password });
					user.save((error, user) => {
						if (error) {
							return res
								.status(400)
								.json({
									error: "Error saving user in Database. Try again later.",
								});
						} else {
							return res.json({ message: "Registration success please login" });
						}
					});
				}
			});
		}
	});
};
exports.login = (req, res) => {
	const { email, password } = req.body;
	console.table({ email, password });
	User.findOne({ email }).exec((error, user) => {
		if (error || !user) {
			return res
				.status(400)
				.json({ error: "User doesn't exist. Please register" });
		} else {
			//authenticate
			if (!user.authenticate(password)) {
				return res.status(400).json({ error: "Password Incorrect." });
			} else {
				// password correct. generate token and send to client
				const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
					expiresIn: "7days",
				});
				const { _id, name, email, role } = user;
				return res.json({ token, user: { _id, name, email, role } });
			}
		}
	});
};
//middleware that decodes token recieved in the header from client
//it checks if secret and expiry date match with those in the token
//if they match it returns the payload saved in the token (in this case user _id)
exports.requireSignIn = expressJWT({
	secret: process.env.JWT_SECRET,
	algorithms: ["HS256"],
	/* requestProperty:"auth"-- auth is default anyway */
});

//will be applied after the requireSignin because we need the user ID
//which is returned from succesful requireSignin
// It will check if the user exists by querying user  _id
// if user exists it will save his info in the header under profile property
exports.authMiddleware = (req, res, next) => {
	console.log(
		"authMiddleware -> Checking user exists + saving user info in header"
	);
	const authUserId = req.auth._id;
	User.findOne({ _id: authUserId }).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({ error: "User Not Found !" });
		} else {
			//we create a "profile" property in the req header
			req.profile = user;
			next();
		}
	});
};

// Admin Middleware
exports.adminMiddleware = (req, res, next) => {
	console.log("Running Admin Middleware");
	const adminUserId = req.auth._id;
	User.findOne({ _id: adminUserId }).exec((error, user) => {
		if (error || !user) {
			return res.status(400).json({ error: "User Not Found !" });
		} else {
			//check if user is admin
			if (user.role !== "admin") {
				return res.status(400).json({ error: "Restricted Access." });
			}
			req.profile = user;
			next();
		}
	});
};


exports.forgotPassword = (req, res) => {
    console.log("Sending token for Resetting password")
    // 1 -  check that user email is registered
    const { email } = req.body;
    User.findOne({ email }).exec((error, user) => {
        if (error || !user) {
            return res.status(400).json({message:" User with that email doesn't Exist !"})
        }
         // 2 - generate a web token and send it to their email
        else {
            const token = jwt.sign({ name: user.name }, process.env.JWT_RESET_Password, { expiresIn: '10m' })

            const params = resetPasswordParams(user.name, email, token);
            const sendingMail = ses.sendEmail(params).promise();


            // 3 - populate the resetPasswordLink property of the userModel with the token
            user.updateOne({ resetPasswordLink: token }).exec((error, updated) => {
                if (error) {
                    return res.status(400).json({error:"Password reset Failed"})
                } else {
                    sendingMail
                    .then(data => {
                    return res.status(200).json({message:`Email has been sent to ${email}.Click on reset link to change your password`})
                    })
                    .catch(error => {
                        return res.status(400).json({error:`We couldn't verify your email: ${email}`})
                     })
                }
            })
        }
    })

   


}

exports.resetPassword = (req, res) => {
    console.log("Resetting the password")
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        // check for expiry using jwt.verify
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_Password, ((error, success) => {
            if (error) {
                return res.status(400).json({error:"Expired Link try Again."})
            } else {
                // find user based on the link we sent to their mail
                User.findOne({ resetPasswordLink })
                    .exec((error, user) => {
                        if (error || !user) {
                            return res.status(400).json({ error: "Invalid token. Try again" })
                        } else {
                            
                            const { _doc } = user;
                            Object.entries(_doc).map(([key, value]) => {
                                user.password = newPassword;
                                // this insures a token is used only once
                                user.resetPasswordLink=""
                            })
                            user.save((error, result) => {
                                console.log("Saving updated user info")
                                if (error) {
                                    return res.status(400).json({ error: "Password Reset failed. Try again" })
                                } else {
                                    return res.json({message:`Great ! Now you can login with your new Password`,result:result})
                                }
                            })
                            
                        }
                    })
            }
        }))
        
    }
}