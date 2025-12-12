import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixEvidenciasFieldDirect() {
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
            console.log(`\n📄 Registro ${record._id}:`);
            console.log('  evidencias:', record.evidencias);
            console.log('  tipo:', typeof record.evidencias);

            let needsUpdate = false;
            let updateData = {};

            // Si evidencias es un string o tiene datos corruptos, limpiarlo
            if (typeof record.evidencias === 'string' ||
                (Array.isArray(record.evidencias) && record.evidencias.some(item => typeof item !== 'string' || item.includes('archivos')))) {
                updateData.evidencias = [];
                needsUpdate = true;
                console.log('  ⚠️  Evidencias corrupto detectado');
            }

            if (needsUpdate) {
                await collection.updateOne(
                    { _id: record._id },
                    { $set: updateData }
                );
                fixed++;
                console.log(`  ✅ Registro arreglado`);
            } else {
                console.log('  ✓ Registro OK');
            }
        }

        console.log(`\n🎉 Migración completada. ${fixed} registros arreglados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

fixEvidenciasFieldDirect();
