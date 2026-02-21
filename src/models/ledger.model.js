const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"account",
        required: [true, 'Ledger entry must be associated with an account'],
        index:true,
        immutable:true //ledger entry create hone ke baad account change nahi hoga
    },
    amount:{
        type:Number,
        required: [true, 'Amount is required for creating a ledger entry'],
         immutable:true //ledger entry create hone ke baad amount change nahi hoga
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required: [true, 'Ledger entry must be associated with a transaction'],
        index:true,
        immutable:true //ledger entry create hone ke baad transaction change nahi hoga
    },
    type:{
       type:String,
        enum:{
            values: ['DEBIT', 'CREDIT'],
            message: 'Type must be either DEBIT or CREDIT',
        },
        required: [true, 'Type is required for creating a ledger entry'],
        immutable:true //ledger entry create hone ke baad type change nahi hoga 
    }

});


function preventLedgerModification(){
    throw new Error('Ledger entries cannot be modified after creation');
}

//agr koi usre update delete karne ki koshish karega to error throw hoga kyuki ledger entries ko create hone ke baad modify nahi kiya ja sakta ledger entries financial records hote hai jise accurate rakhna zaruri hota hai isliye unhe modify nahi kiya ja sakta
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification);
ledgerSchema.pre('updateOne', preventLedgerModification);
ledgerSchema.pre('deleteOne', preventLedgerModification);
ledgerSchema.pre('remove', preventLedgerModification);
ledgerSchema.pre('deleteMany', preventLedgerModification);
ledgerSchema.pre('updateMany', preventLedgerModification);
ledgerSchema.pre('findOneAndDelete', preventLedgerModification);
ledgerSchema.pre('findOneAndReplace', preventLedgerModification);

const ledgerModel = mongoose.model('ledger', ledgerSchema);
module.exports = ledgerModel;