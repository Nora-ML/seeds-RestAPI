const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        
        required: true,
        max: 12,
        unique: true,
        index: true,

    },
    name: {
        type: String,
        trim:true,
        max: 32,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,

        unique: true,
        required: true,
    },
    hashed_password: {
        type: String,
        required:true
    },
    //essentially the string of hashing you require
    salt: String,
    role: {
        type: String,
        default:'subscriber'
    },
    //it has 'data' type 
    resetPasswordLink: {
        data: String,
        default:"",
    }
}, { timestamps: true })


// virtual fields not persistent in the data field
userSchema.virtual('password')
    .set(function (password) {
        //create temp variable called _password
        this._password = password;
        //generate salt
        this.salt = this.makeSalt()
        //encrypt password
        this.hashed_password=this.encryptPassword(password)
    })
    .get(function () {
        return this._password;
    })

    
//methods > authenticate, encryptPassword,makeSalt
userSchema.methods = {
    encryptPassword: function (password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (error) {
            return '';
        } 
    },
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()+'')
    },
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    }
}


//export user model
module.exports = mongoose.model('User',userSchema);