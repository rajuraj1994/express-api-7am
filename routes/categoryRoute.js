const express = require('express')
const router = express.Router()

const { helloCategory, postCategory, categoryList, categoryDetails, updateCategory, deleteCategory } = require('../controllers/categoryController')
const { requireSignin } = require('../controllers/authController')
const errorHandler = require('../helpers/errorHandler')


router.get('/welcome',helloCategory)
router.post('/postcategory', requireSignin, errorHandler,postCategory)
router.get('/categorylist',categoryList)
router.get('/categorydetails/:id',categoryDetails)
router.put('/updatecategory/:id', requireSignin, errorHandler,updateCategory)
router.delete('/deletecategory/:id',  requireSignin, errorHandler, deleteCategory)


module.exports = router

