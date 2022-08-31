const express = require('express');
const router = express.Router();
const {requireSignIn,authMiddleware,adminMiddleware}=require('../controllers/auth.js')

//import from controllers
const {read}=require('../controllers/user.js')

router.get('/user', requireSignIn, authMiddleware,read);
router.get('/admin', requireSignIn, adminMiddleware,read);




module.exports = router;