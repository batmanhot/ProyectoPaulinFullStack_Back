import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Testing connection to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Connection failed!');
        console.error('Error name:', err.name);
        console.error('Error message:', err.message);
        if (err.cause) console.error('Error cause:', err.cause);
        process.exit(1);
    });
