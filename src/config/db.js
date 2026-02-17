const mongoose = require('mongoose')


function connectToDB(){
mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("Server is connected to db")
})
.catch(err=>{
    console.log("Error connecting to db")
    process.exit(1) //server agr database ko connect nhi hoga toh hum band krdenge
})
}

module.exports = connectToDB