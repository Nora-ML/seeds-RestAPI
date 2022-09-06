const { validationResult } = require("express-validator"),
	formidable = require("formidable");

exports.runValidation = (req, res, next) => {
	console.log("Running the validation specified req:", req);
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log("Error validating");
		return res.status(422).json({ error: errors.errors[0].msg });
	}
	// the next prevents the app from halting
	// the app continues after the error was thrown
	next();
};
exports.runFormDataValidation = (req, res, next) => {
	console.log("Running validation on formData");
	let form = new formidable.IncomingForm();
	form.keepExtension = true;
	form.parse(req, (error, fields, files) => {
		console.log("Fields to be validated:", fields);
		if (error) {
			return res.status(400).json({ error: "Error Parsing form" });
		} else {
			const errors = validationResult(fields);
			if (!errors.isEmpty()) {
				console.log("Error validating");
				return res.status(422).json({ error: errors.errors[0].msg });
			}
			req.fields = fields;
			req.files = files;
			next();
		}
	});
	// the next prevents the app from halting
	// the app continues after the error was thrown
};
