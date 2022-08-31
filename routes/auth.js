const express = require('express');
const router = express.Router();
//imposrt validators
const { userRegisterValidator,userLoginValidator,forgotPasswordValidator,resetPasswordValidator } = require('../validator/validatorsRule.js')
const {runValidation}=require('../validator/runValidation.js')
//import from controllers
const {register,registerActivate,login,forgotPassword,resetPassword}=require('../controllers/auth.js')


router.post('/register',userRegisterValidator ,runValidation, register)
router.post('/register/activate',registerActivate)
router.post('/login', userLoginValidator, runValidation, login)

// resetiing a password will be put request
router.put('/forgot-password',forgotPasswordValidator,runValidation,forgotPassword)
router.put('/reset-password',resetPasswordValidator,runValidation,resetPassword) 



module.exports = router;