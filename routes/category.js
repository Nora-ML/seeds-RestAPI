const express = require('express');
const router = express.Router();

// import validators
const { categoryValidator,categoryUpdateValidator  } = require('../validator/validatorsRule');
const { runValidation} = require('../validator/runValidation');

//import from controllers
const {requireSignIn,adminMiddleware}=require('../controllers/auth.js')
const {create,list,read,update,remove}=require('../controllers/category.js')


// routes
router.post('/category',categoryValidator,runValidation,requireSignIn,adminMiddleware,create);
router.get('/categories',list);
router.get('/category/:slug',read);
router.put('/category/:slug',categoryUpdateValidator,runValidation,requireSignIn,adminMiddleware,update);
router.delete('/category:/slug',requireSignIn,adminMiddleware,remove);


module.exports = router;