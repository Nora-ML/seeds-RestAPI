const express = require('express');
const router = express.Router();

// import validators
const { categoryValidator,categoryUpdateValidator  } = require('../validator/validatorsRule');
const { runFormDataValidation } = require("../validator/runValidation");

//import from controllers
const { requireSignIn, adminMiddleware } = require("../controllers/auth.js");
const {
	create,
	list,
	read,
	update,
	remove,
} = require("../controllers/category.js");

// routes
router.post(
	"/category",
	categoryValidator,
	runFormDataValidation,
	requireSignIn,
	adminMiddleware,
	create
);
router.get("/categories", list);
router.get("/category/:slug", read);
router.put(
	"/category/:slug",
	categoryUpdateValidator,
	runFormDataValidation,
	requireSignIn,
	adminMiddleware,
	update
);
router.delete('/category:/slug',requireSignIn,adminMiddleware,remove);


module.exports = router;