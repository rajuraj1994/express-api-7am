const errorHandler=(err,req,res,next) => {
    if(err.name === 'UnauthorizedError'){
        //jwt authentication error
        return res.status(401).json({error:'The user is not authorized'})
    }

    //default to 500 server errror
    return res.status(500).json(err)
}

module.exports = errorHandler