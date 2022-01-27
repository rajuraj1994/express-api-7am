const User = require('../models/authModel')
const Token = require('../models/tokenModel')
const sendEmail = require('../utils/setEmail')
const crypto = require('crypto')
const jwt = require('jsonwebtoken') // authentication
const expressJwt = require('express-jwt')  // authorization


//register user
exports.userRegister=async(req,res) => {
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        password: req.body.password
    })
    //check for unique email
    User.findOne({email:user.email}, async(error, data) => {
        if(data == null){
            user =await user.save()
    if(!user){
        return res.status(400).json({error:'Something went wrong'})
    }
    let token = new Token({
        token:crypto.randomBytes(16).toString('hex'),
        userId : user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:'failed to store token'})
    }
    //sendEmail
    sendEmail({
        from :'no-reply@ecommerce-api.com',
        to:user.email,
        subject:'Email Verification Link',
        text:`Hello, \n\n Please verify your email by click in the below link : \n\n
        http:\/\/${req.headers.host}\/api\/confirmation\/${token.token}
        `,
        //http://localhost:5000/api/confirmation/58ab3456
    })
    res.send(user)

        }
        else{
            return res.status(400).json({error:'email must be unique'})
        }
    })
    
}

//confirmation of email
exports.postEmailConfirmation = (req,res) =>{
    //at first find the valid token or matching token
    Token.findOne({token:req.params.token},(error,token)=>{
        if(error || !token){
            return res.status(400).json({error:'invalid token or token may have expired'})
        }
    // if we find the valid token then find the valid user for that token
    User.findOne({_id:token.userId},(error,user)=>{
        if(error || !user){
            return res.status(400).json({error:'sorry we are unable to find the valid user for this token'})
        }
        // if user is already verified
        if(user.isVerified){
            return res.status(400).json({error:'email is already verified ,login to continue'})
        }
        //save the verified user
        user.isVerified = true
        user.save((error)=>{
            if(error){
                return res.status(400).json({error:error})
            }
            res.json({message:'congrats! your email has been verified'})
        })
    })
    })
}

//signin  process
exports.signIn=async(req,res) => {
    const {email, password} = req.body
    // const email = req.body.email
    // const password = req.body.password

    //at first check if the email is registered or not
    const user = await User.findOne({email})
    if(!user){
        return res.status(403).json({error:'sorry the email you provided not found in our system'})
    }
    //if email found then  check the matching password for that email
    if(!user.authenticate(password)){
        return res.status(400).json({error:'email and password doesnot match'})
    }
    // check if user is verified or not
    if(!user.isVerified){
        return res.status(400).json({error:'verify your email first to continue'})
    }
    //now generate token with user id and jwt secret
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET)

    //store token in the cookie
    res.cookie('helloCookie',token,{expire:Date.now()+999999})

    //return user information to frontend
    const {_id,name,role} = user
    return res.json({token,user:{name,email,role,_id}})


}

//signout
exports.signout=(req,res) => {
    res.clearCookie('helloCookie')
    res.json({message:'signout success'})
}

//forget password
exports.forgetPassword= async(req,res) => {
    const user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(403).json({error:'sorry the email you enter is not found in our system'})
    }
    let token = new Token({
        token:crypto.randomBytes(16).toString('hex'),
        userId:user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:'something went wrong'})
    }
     //sendEmail
     sendEmail({
        from :'no-reply@ecommerce-api.com',
        to:user.email,
        subject:'Password Reset Link',
        text:`Hello, \n\n Please reset your password by click in the below link : \n\n
        http:\/\/${req.headers.host}\/api\/resetpassword\/${token.token}
        `,
       
    })
    res.json({message:'password reset link has been sent'})
}


//reset password
exports.resetPassword= async(req,res) => {
    // at first find the valid token
    let token = await Token.findOne({token:req.params.token})
    if(!token){
        return res.status(403).json({error:'inavlid token or token may have expired'})
    }
    // if token found then find the valid user for that token
    let user = await User.findOne({
        _id:token.userId,
        email:req.body.email
    })
    if(!user){
        return res.status(400).json({error:' sorry the email you provided not associated with this token please try another or register'})
    }
    user.password= req.body.password
    user = await user.save()
    if(!user){
        return res.status(400).json({error:'failed to reset password'})
    }
    res.json({message:'password has been reset successfully'})
}

//user list
exports.userList= async(req,res) => {
    const user = await User.find()
    .select('-hashed_password')

    if(!user){
        return res.status(400).json({error:'something went wrong'})
    }
    res.send(user)
}

//single user
exports.userDetails = async(req,res) => {
    const user = await User.findById(req.params.id)
    .select('-hashed_password')

    if(!user){
        return res.status(400).json({error:'something went wrong'})
    }
    res.send(user)
}

//resend email verification link
exports.resendEmailVerificationLink=async(req,res) =>{
    //at first find the register user
    let user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(403).json({error:'sorry the email you enter is not found in our system'})
    }
    //check if already verified
    if(user.isVerified){
        return res.status(400).json({error:'email is already verified , login to continue'})
    }
  // create token to store in database  and  send to verification link
    let token = new Token({
        token:crypto.randomBytes(16).toString('hex'),
        userId:user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:'something went wrong'})
    }
    //sendEmail
    sendEmail({
        from :'no-reply@ecommerce-api.com',
        to:user.email,
        subject:'Email Verification Link',
        text:`Hello, \n\n Please verify your email by click in the below link : \n\n
        http:\/\/${req.headers.host}\/api\/confirmation\/${token.token}
        `,
        //http://localhost:5000/api/confirmation/58ab3456
    })
    res.json({message:'verification link has been sent'})

}

//for authorization
exports.requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    algorithms:['HS256']
})
