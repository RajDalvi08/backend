const accountModel = require("../models/account.model")

//basically yeh user ki id create krooo n res m usse send krdo
async function createAccountController(req, res){
    const userId = req.user._id; //yeh line isliye kr rhe h taki aage ke controllers ma user ki information mil jaye


    const account = await accountModel.create({
        user: userId
    })

    res.status(201).json({
        account: account
    })
}

module.exports = {
    createAccountController
}