const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware').authMiddleware;
const transactionController = require('../controllers/transaction.controller');
const transactionRoutes  = Router();

//basically these is to understand transfer kaise kya hoo rhe money show krne ke liye
/* POST /api/transactions/ - Create a new transaction */
 transactionRoutes.post("/", authMiddleware,transactionController.createTransaction);

 module.exports = transactionRoutes;