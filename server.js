import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import ServiceRecord from './models/ServiceRecord.js'

import dotenv from 'dotenv';
dotenv.config();

console.log(process.env.MONGO_URI);


//const express = require('express');
//const mongoose = require('mongoose');
//const cors = require('cors');
//const ServiceRecord = require('./models/ServiceRecord');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto_paulin')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes

app.get('/api/test', (req, res) => {
    res.send('Hello Mundo esto es una prueba del backend del Proyecto Paulin!');
});


// Create
app.post('/api/services', async (req, res) => {
    try {
        const newRecord = new ServiceRecord(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Read All
//const users = await User.find({}, 'email nombres apellidos telefono');

app.get('/api/services', async (req, res) => {
    try {
        const records = await ServiceRecord.find().sort({ createdAt: -1 });
        //const records = await ServiceRecord.find();
        res.status(200).json(records);
    } catch (error) {
        console.log(error);
        // res.status(500).json({ message: error.message });
        res.status(500).json({ message: 'Error al obtener los registros' });
    }
});

// Update
app.put('/api/services/:id', async (req, res) => {
    try {
        const updatedRecord = await ServiceRecord.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(updatedRecord);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete
app.delete('/api/services/:id', async (req, res) => {
    try {
        await ServiceRecord.findByIdAndDelete(req.params.id);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
