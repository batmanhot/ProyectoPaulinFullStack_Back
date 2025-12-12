import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixEvidenciasFieldFinal() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto_paulin');
        console.log('✅ Conectado a MongoDB');

        const db = mongoose.connection.db;
        const collection = db.collection('servicerecords');

        // Buscar todos los documentos
        const records = await collection.find({}).toArray();
        console.log(`📋 Encontrados ${records.length} registros`);

        let fixed = 0;
        for (const record of records) {
            let needsUpdate = false;
            let updateData = {};

            // Si evidencias NO es un array, convertirlo a array vacío
            if (record.evidencias !== undefined && !Array.isArray(record.evidencias)) {
                console.log(`\n📄 Registro ${record._id}:`);
                console.log('  evidencias ANTES:', record.evidencias);
                updateData.evidencias = [];
                needsUpdate = true;
            }

            if (needsUpdate) {
                await collection.updateOne(
                    { _id: record._id },
                    { $set: updateData }
                );
                fixed++;
                console.log('  evidencias DESPUÉS: []');
                console.log(`  ✅ Registro arreglado`);
            }
        }

        console.log(`\n🎉 Migración completada. ${fixed} registros arreglados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

fixEvidenciasFieldFinal();
