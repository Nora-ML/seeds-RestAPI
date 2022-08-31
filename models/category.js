const mongoose = require('mongoose'),
{ObjectId }= mongoose.Schema;


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        max:32
    },
    slug: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
        max: 32,
        index:true
    },
    //we will use AWS for the image and it provides me with a url
    image: {
        url: String,
        key:String
    },
    content: {
        // we are using object it will give us freedom to store anything
        // in this case we want to stores pure/raw HTML content.
        // the disadvantage is i can't set required or unique in this case
        // i have to do my own validation
        type: {},
        min: 20,
        max:2000000,
    },
    postedBy: {
        // type is objectID and refers to the User model
        // don't forget to import it from mongoose schema
        type: ObjectId,
        re:'User',
    }
}, { timestamps: true })

module.exports=mongoose.model('Category',categorySchema)