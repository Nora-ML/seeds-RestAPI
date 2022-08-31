const { validationResult } = require('express-validator');

exports.runValidation = (req, res, next) => {
    console.log("Running the validation specified")
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({error:errors.errors[0].msg})
    }
    // the next prevents the app from halting 
    // the app continues after the error was thrown
    next();
}