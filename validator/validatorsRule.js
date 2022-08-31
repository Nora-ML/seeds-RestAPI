const { check } = require('express-validator');

// notice its just an array
exports.userRegisterValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long')
]
exports.userLoginValidator = [
    check('email').isEmail().withMessage('Must be a valid email address'),
    check('password').isLength({min:6}).withMessage('Password must be atleast 6 characters long')
]
exports.forgotPasswordValidator = [
    check('email').isEmail().withMessage('Must be a valid email address'),
]
exports.resetPasswordValidator = [
    check('newPassword').isLength({ min: 6 }).withMessage('Password must be atleast 6 characters long'),
    check('resetPasswordLink').not().isEmpty().withMessage('Token is Required'),

]
exports.categoryValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('image').isEmpty().withMessage('Image is Required'),
    check('content').isLength({min:20}).withMessage('Content is required. Must be atleast 20 characters long')
]
exports.categoryUpdateValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('content').isLength({min:20}).withMessage('Content is required. Must be atleast 20 characters long')
]