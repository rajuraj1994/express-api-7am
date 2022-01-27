const express = require('express')
const router = express.Router()
const { userRegister, postEmailConfirmation, signIn, signout, forgetPassword, resetPassword, userList, userDetails, resendEmailVerificationLink, requireSignin } = require('../controllers/authController')
const errorHandler = require('../helpers/errorHandler')



router.post('/register', userRegister)
router.post('/confirmation/:token',postEmailConfirmation)
router.post('/signin',signIn)
router.post('/signout', signout)
router.post('/forgetpassword', forgetPassword)
router.put('/resetpassword/:token',resetPassword)
router.get('/userlist',requireSignin,errorHandler, userList)
router.get('/userdetails/:id', requireSignin,errorHandler,userDetails)
router.post('/resendverificationmail',resendEmailVerificationLink)

module.exports = router