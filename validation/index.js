exports.productValidation=(req,res,next) => {
    req.check('product_name','Product name is required').notEmpty()
    req.check('product_price','Product price is mandatory').notEmpty()
    .isNumeric()
    .withMessage('Price only accepts numeric value')
    req.check('countInStock','Stock quantity is required').notEmpty()
    .isNumeric()
    .withMessage('Stock quantity only accepts numeric value')
    req.check('product_description','Description is required').notEmpty()
    .isLength({
        min:30
    })
    .withMessage('Description must be more than 30 characters')
    req.check('category','Category is required').notEmpty()

    const errors = req.validationErrors()
    if(errors){
        const showError=errors.map(err=>err.msg)[0]
        return res.status(400).json({error:showError})
    }
    next()

}