const express = require('express')
require('dotenv').config()
const db = require('./database/connection')
const bodyParser=require('body-parser')
const morgan = require('morgan')
const expressValidator=require('express-validator')
const cookieParser = require('cookie-parser')
const cors = require('cors')


const categoryRoute= require('./routes/categoryRoute')
const productRoute = require('./routes/productRoute')
const authRoute = require('./routes/authRoute')
const orderRoute = require('./routes/orderRoute')
const paymentRoute = require('./routes/paymentRoute')



//main app
const app = express()

//middleware
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(expressValidator())
app.use(cookieParser())
app.use(cors())
app.use('/public/uploads', express.static('public/uploads'))



//routes
app.use('/api',categoryRoute)
app.use('/api',productRoute)
app.use('/api',authRoute)
app.use('/api',orderRoute)
app.use('/api', paymentRoute)




//to read port number from .env file
const port=process.env.PORT


//to start the server
app.listen(port,()=>{
    console.log(`Server started on port ${port}`)
})