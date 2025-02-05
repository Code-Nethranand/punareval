require('dotenv').config();
const mongoose = require('mongoose');

async function fixPaymentIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    // Get the payments collection
    const db = mongoose.connection.db;
    const payments = db.collection('payments');

    // Drop all indexes
    await payments.dropIndexes();
    console.log('Dropped all indexes');

    // Create new indexes
    await payments.createIndex({ orderId: 1 }, { unique: true });
    await payments.createIndex({ userId: 1 });
    await payments.createIndex({ status: 1 });
    console.log('Created new indexes');

    console.log('Successfully fixed payment indexes');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing payment indexes:', error);
    process.exit(1);
  }
}

fixPaymentIndex();
