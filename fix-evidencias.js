import mongoose from 'mongoose';
import ServiceRecord from './models/ServiceRecord.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixEvidenciasField() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto_paulin');
        console.log('✅ Conectado a MongoDB');

        // Buscar todos los registros
        const records = await ServiceRecord.find({});
        console.log(`📋 Encontrados ${records.length} registros`);

        let fixed = 0;
        for (const record of records) {
            let needsUpdate = false;

            // Verificar si evidencias tiene datos corruptos
            if (record.evidencias && Array.isArray(record.evidencias)) {
                const cleanedEvidencias = record.evidencias.filter(item => {
                    // Filtrar items que no sean strings válidos
                    return typeof item === 'string' && item.trim() !== '' && !item.includes('archivos');
                });

                if (cleanedEvidencias.length !== record.evidencias.length) {
                    record.evidencias = cleanedEvidencias;
                    needsUpdate = true;
                }
            } else if (record.evidencias) {
                // Si evidencias no es un array, limpiarlo
                record.evidencias = [];
                needsUpdate = true;
            }

            if (needsUpdate) {
                await record.save();
                fixed++;
                console.log(`✅ Registro ${record._id} arreglado`);
            }
        }

        console.log(`\n🎉 Migración completada. ${fixed} registros arreglados.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        process.exit(1);
    }
}

fixEvidenciasField();
