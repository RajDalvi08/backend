const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true,"Email is required for user"],
        trim:true,
        lowercase:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
        unique:[true,"Email already exists"]


    },
    name: {
        type: String,
        required:[true,"Name is required for creating an account"]
    },
    password: {
        type: String,
        required:[true,"Password is required for creating an account"],
        minlength:[6,"Password should contain more than 6 characters"],
        select:false
    },
    
     systemUser:{
       type: Boolean,
       default:false,
       immutable:true //system user create hone ke baad uska type change nahi hoga
        
     }
},{
    timestamps: true
})

userSchema.pre("save", async function(){
    //agr use ka password change hua rhega toh hash krenge
if(!this.isModified("password")){
    return
}

const hash = await bcrypt.hash(this.password, 10) //agr future m user password change krrha hoga for tht
this.password = hash //for saving password
return 
})

userSchema.methods.comparePassword = async function(password) { //basically joh password m save hoo rha h usko compare krne liye if user ke paasword se match toh true like tht
    
    return await bcrypt.compare(password, this.password)
}


const userModel = mongoose.model("user",userSchema)


module.exports = userModel
