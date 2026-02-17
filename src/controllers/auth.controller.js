const { JsonWebTokenError } = require("jsonwebtoken");
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require('../services/email.service')
/*user register controller
POST /api/auth/register
*/
async function userRegisterController(req, res){
 const {email, password, name} = req.body;

 const isExists = await userModel.findOne({
    email:email
 })

 if(isExists){
    return res.Status(422).json({
        message:"User already exists",
        status: "failed"
    })
 }

 const user = await userModel.create({
    email,password,name
 })

 const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})

res.cookie("token", token )

res.status(201).json({
   user:{
      _id:user._id,
      email:user.email,
      name:user.name
   },
   token:token
})

await emailService.sendRegistrationEmail(user.email, user.name)
}

/*user login controller
POST /api/auth/login
*/
async function userLoginController(req, res){
    const {email, password} = req.body;

    const user = await userModel.findOne({
        email:email
    }).select("+password") //.agr password select nhi hoga toh compare nhi kr payenge

    if(!user){
        return res.status(404).json({
            message:"User not found",
            status:"failed"
        })
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if(!isPasswordCorrect){
        return res.status(401).json({
            message:"Invalid credentials",
            status:"failed"
        })
    }

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})

    res.cookie("token", token )

    res.status(200).json({
        user:{
           _id:user._id,
           email:user.email,
           name:user.name
        },
        token:token
   })
}

/*user regi controller
POST /api/auth/register
*/


module.exports = {
    userRegisterController,
    userLoginController
}