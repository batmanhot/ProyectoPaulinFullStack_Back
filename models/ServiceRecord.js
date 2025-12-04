import mongoose from 'mongoose';

const ServiceRecordSchema = new mongoose.Schema({
    cotizacion: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    cliente: { type: String, required: true },
    detalleServicio: { type: String, required: true },
    tecnico: { type: String, required: true },
    fechaServicio: { type: Date, required: true },
    observacion: { type: String },
    conformidadCliente: { type: String }, // Storing name or signature data
    evidencia: {
        casilla1: { type: Boolean, default: false },
        casilla2: { type: Boolean, default: false },
        casilla3: { type: Boolean, default: false }
    }
}, { timestamps: true });

// export const User = mongoose.model('User', userSchema);
export default mongoose.model('servicerecord', ServiceRecordSchema);
