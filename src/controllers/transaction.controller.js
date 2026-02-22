const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const mongoose = require('mongoose');
const emailService = require('../services/email.service');
/*Create a new transaction
THE 10-STEP TRANFER FLOW:
1. Validate the request
2. Validate idempotency key
3. Check account status
4. Derive sender balance from ledger
5. Create transaction with PENDING status
6. Create DEBIT Ledger entry
7. Create CREDIT Ledger entry
8. Mark transaction as COMPLETED
9. Commit mongodb session
10. Send email notification


*/
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

/*Check account status */
if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
        success: false,
        message: "One or both accounts are not active"
    });

}

/*Derive sender balance from ledger */
   const balance = await fromUserAccount.getBalance();

if(balance < amount){
    return res.status(400).json({
        success: false,
        message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
    });

}
/*Create transaction with PENDING status */
const session = await mongoose.startSession();
session.startTransaction(); // this is bassically for either transaction completes it save it all in db and no one one of the point not completed it again goes back

const transaction = await transactionModel.create([{
    fromAccount,
    toAccount,
    amount,
    status: "PENDING",
    idempotencyKey
}], { session });  /// ek toh 4 steps complete hoga nhi toh ek bhi nhi hoga

const debitLedgerEntry = await ledgerModel.create({
   account: fromAccount,
    type: "DEBIT",
    amount,
    transaction: transaction._id

}, { session });


const creditLedgerEntry = await ledgerModel.create({
    account: toAccount,
    type: "CREDIT",
    amount,
    transaction: transaction._id
}, { session });

  transaction.status = "COMPLETED";
  await transaction.save({ session }); // basically after completing to show complete status

  await session.commitTransaction();
  session.endSession(); // basically all done then session end

  /*Send email notification */
   await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);
   res.status(200).json({
    success: true,
    message: "Transaction completed successfully",
    transaction
   });
}

module.exports = {
    createTransaction
}