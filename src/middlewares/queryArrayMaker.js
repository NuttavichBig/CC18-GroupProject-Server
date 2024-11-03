const queryArrayMaker = (keyName)=>(req,res,next)=>{
    try{
        const selected = req.query[keyName]
        if(selected){
            const selectedArray = selected.split(',')
            req.query[keyName] = selectedArray
        }
        next();
    }catch(err){
        next(err)
    }

}

module.exports = queryArrayMaker