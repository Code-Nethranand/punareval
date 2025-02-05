const mongoose = require('mongoose');
require('dotenv').config();

async function dropIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.collections();
    
    for (let collection of collections) {
      if (collection.collectionName === 'payments') {
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);
        
        await collection.dropIndexes();
        console.log('Dropped all indexes from payments collection');
      }
    }

    console.log('Done');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropIndexes();
