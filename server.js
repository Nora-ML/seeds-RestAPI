const express = require("express");
require('dotenv').config();
const authRoutes = require('./routes/auth.js')
const userRoutes = require('./routes/user.js')
const categoryRoutes = require('./routes/category.js')
const mongoose = require('mongoose')
//middleware
const morgan=require('morgan')
const bodyParser=require('body-parser')
const cors = require('cors')
//directly configure the dotenv 



//invoke express
const app = express();

// connect to database
mongoose.connect(process.env.DATABASE_CLOUD)
    .then(()=> console.log("Connected to Datbase atlas"))
    .catch(()=> console.log("Failed to connect to atlas Database"))
//middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
//app.use(cors());
//instead of allowing all websites access via cors()
//we will allow only our front end to access our server
app.use(cors({origin:process.env.CLIENT_URL}))


//middlewares -mount routes
app.use('/api',authRoutes)
app.use('/api',userRoutes)
app.use('/api',categoryRoutes)


const port = process.env.PORT ;

app.listen(port,() => console.log(`API is running on port :${port}`))