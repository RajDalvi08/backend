const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


async function authMidleware(req, res, next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]; //basically if dono maise ek bhi cheez satisfy nhi hoti menas user ne kbhi login kiya hi nhi tha


    if(!token){
        return res.status(401).json({
            success: false,
            message: "Unauthorized access"
        });
    }
    try {
       const decoded = jwt.verify(token, process.env.JWT_SECRET); 
       const user = await userModel.findById(decoded.userId);
       req.user = user; //yeh line isliye kr rhe h taki aage ke controllers ma user ki information mil jaye
         next();
    } catch (error) {
       return res.status(401).json({
        success: false,
        message: "Unauthorized access" 
    });
}
}

module.exports = {
    authMiddleware: authMidleware
};