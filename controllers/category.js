const Category = require('../models/category'),
    slugify = require('slugify'),
    AWS = require('aws-sdk'),
    formidable = require('formidable'),
    // we will use this to create a key for the image
    { v4: uuidv4 } = require('uuid'),
    fs = require('fs');
    

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-1", 
})


// 1- We parse the incoming form Data using formidable
//         to access the fields and files in the form recieved in the request
// 2- destructure info in files and fields
// 3- create a slug for the category - use slugify package
// 4- verify image size
// 5- upload the image to s3
// 6- recieve the image url recieved from s3 
exports.create = (req, res) => {
    console.log("Creating a category fields:",req.fields,"files:",req.files,"profile:",req.profile);
    const { name, content } = req.fields;
    const { image } = req.files;
    const slug = slugify(name);
    // instantiate a new category
    const category = new Category({ name, slug, content });
    // this is not strictly necessary since i'll be resizing the image on the client side
    if (image.size > 2000000) {
        return res
            .status(400)
            .json({ error: "Image should be less than 2mb" });
    } else {
        // set image params
        console.log("Image params");
        const params = {
            Bucket: "seeds-image-bucket",
            Key: `category/${uuidv4()}`,
            // we use fs.readFileSync to read the file synchronously and return only once completed
            Body: fs.readFileSync(image.filepath),
            // access control limit
            ACL: "public-read",
            ContentType: "image/jpg",
        };

        // upload image to s3
        s3.upload(params, (error, data) => {
            console.log('Params :',params)
            console.log('error :',error)
            console.log('data :',data)
            if (error) {
                return res
                    .status(400)
                    .json({ error: "Uploading image to s3 failed" });
            } else {
                category.image.url = data.Location;
                category.image.key = data.Key;
                category.postedBy = req.profile._id;
                category.save((error, data) => {
                    if (error || !data) {
                        console.log("Category Creation error");
                        return res
                            .status(400)
                            .json({ error: "Category Creation Failed" });
                    } else {
                        return res.status(200).json(data);
                    }
                });
            }
        });
    }
};

/* exports.create = (req, res) => {
    console.log("Creating a category ");
		let form = new formidable.IncomingForm();
		form.keepExtension = true;
		form.parse(req, (error, fields, files) => {
			console.log("Fields to be validated:", fields);
			if (error) {
				console.log("Error parsing form");
				return res.status(400).json({ error: "Error Parsing form" });
			} else {
				const { name, content } = fields;
				const { image } = files;
				const slug = slugify(name);
				// instantiate a new category
				const category = new Category({ name, slug, content });
				// this is not strictly necessary since i'll be resizing the image on the client side
				if (image.size > 2000000) {
					return res
						.status(400)
						.json({ error: "Image should be less than 2mb" });
				} else {
					// set image params
					console.log("Image params");
					const params = {
						Bucket: "seeds-image-bucket",
						Key: `category/${uuidv4()}`,
						// we use fs.readFileSync to read the file synchronously and return only once completed
						Body: fs.readFileSync(image.path),
						// access control limit
						ACL: "public-read",
						ContentType: "image/jpg",
					};

					// upload image to s3
					s3.upload(params, (error, data) => {
						if (error) {
							return res
								.status(400)
								.json({ error: "Uploading image to s3 failed" });
						} else {
							category.image.url = data.Location;
							category.image.key = data.Key;
							category.postedBy = req.user._id;
							category.save((error, data) => {
								if (error || !data) {
									console.log("Category Creation error");
									return res
										.status(400)
										.json({ error: "Category Creation Failed" });
								} else {
									return res.status(200).json(data);
								}
							});
						}
					});
				}
			}
		});
};
 */



exports.list = (req, res) => {
    console.log('Listing all category')
}
exports.read = (req, res) => {
    console.log('Reading a category')
}
exports.update= (req, res) => {
    console.log('Updating a category')
}
exports.remove= (req, res) => {
    console.log('Removing a category')
}
