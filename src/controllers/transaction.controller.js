const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');

async function createTransaction(req, res) {
      /* Validate request joh bhi ereq aarha h voh sahi h ki nhi */
    const { fromAccount, toAccount, amount,  idempotencyKey } = req.body;

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
    return res.status(400).json({
        success: false,
        message: "Missing required fields"
    });
}

const fromUserAccount = await accountModel.findByOne({
    _id: fromAccount,
});

const toUserAccount = await accountModel.findByOne({
    _id: toAccount,
});

if(!fromUserAccount || !toUserAccount){
    return res.status(400).json({
        success: false,
        message: "One or both accounts not found"
    });

}

/*Validate idempotency key */
const existingTransaction = await transactionModel.findOne({
    idempotencyKey: idempotencyKey

})
if(existingTransaction){
    if(existingTransaction.status === "COMPLETED"){
        return res.status(200).json({
            success: true,
            message: "Transaction already completed",
            transaction: existingTransaction
        });
    }
    if(existingTransaction.status === "PENDING"){
        return res.status(200).json({
            
            message: "Transaction is pending",
            
        });
    }
    if(existingTransaction.status === "FAILED"){
        return res.status(500).json({
            success: false,
            message: "Transaction already failed",
            
        });
    }
    if(existingTransaction.status === "REVERSED"){
        return res.status(500).json({
            
            message: "Transaction already reversed",
})
}
}
}
