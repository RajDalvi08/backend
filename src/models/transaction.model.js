const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, 'Transactionmust be associated with fromAccount'],
        index:true //kahse pisa search krna hai to fast ho jayega
    },
    toAccount:{
          type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, 'Transactionmust be associated with toAccount'],
        index:true //kahse pisa search krna hai to fast ho jayega
    },
    status:{
        type:String,
        enum:{
            values: ['PENDING', 'COMPLETED', 'FAILED','REVERSED'],
            message: 'Status must be either PENDING, COMPLETED, FAILED or REVERSED',


        },
        default: 'PENDING'
    },
    amount:{
        type:Number,
        required: [true, 'Amount is required'],
         min: [0, 'Amount must be a positive number']
    },
    idempotencyKey:{ //amount ko track krne ke liye baiscally 10 baar payment krne se rokti h idempotency client side not backend
        type:String,
        required: [true, 'Idempotency key is required'],
        unique: true,
        index:true //idempotency key se search krna hai to fast ho jayega
    }
},{
    timestamps: true
})

const transactionModel = mongoose.model('transaction', transactionSchema);
module.exports = transactionModel;