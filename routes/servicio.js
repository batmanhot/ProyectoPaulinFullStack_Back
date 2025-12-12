// routes/servicio.js
import express from "express";
import ServiceRecord from "../models/ServiceRecord.js";
import upload from "../middleware/upload.js";

const router = express.Router();

const evidenciasUpload = upload.fields([
    { name: "evidencia1", maxCount: 1 },
    { name: "evidencia2", maxCount: 1 },
    { name: "evidencia3", maxCount: 1 }
]);

// PUT: actualizar servicio
router.put("/editar-servicio/:id", evidenciasUpload, async (req, res) => {
    const { id } = req.params;
    const { modo } = req.query;

    try {
        const servicio = await ServiceRecord.findById(id);
        if (!servicio) return res.status(404).json({ error: "Servicio no encontrado" });

        console.log('📁 Modo:', modo);
        console.log('📁 Archivos recibidos:', req.files);
        console.log('📁 Body recibido:', req.body);

        // ✅ MODO EVIDENCIAS
        if (modo === "evidencias") {
            // Guardar los nombres de archivo en evidencia.archivos1, archivos2, archivos3
            if (req.files && req.files.evidencia1 && req.files.evidencia1[0]) {
                const fileName = req.files.evidencia1[0].filename;
                servicio.evidencia.archivos1 = fileName;
                servicio.evidencia.casilla1 = true;
                console.log('✅ Archivo 1 guardado:', fileName);
            }
            if (req.files && req.files.evidencia2 && req.files.evidencia2[0]) {
                const fileName = req.files.evidencia2[0].filename;
                servicio.evidencia.archivos2 = fileName;
                servicio.evidencia.casilla2 = true;
                console.log('✅ Archivo 2 guardado:', fileName);
            }
            if (req.files && req.files.evidencia3 && req.files.evidencia3[0]) {
                const fileName = req.files.evidencia3[0].filename;
                servicio.evidencia.archivos3 = fileName;
                servicio.evidencia.casilla3 = true;
                console.log('✅ Archivo 3 guardado:', fileName);
            }

            // También actualizar otros campos si vienen en el body
            if (req.body.detalleServicio) servicio.detalleServicio = req.body.detalleServicio;
            if (req.body.fechaServicio) servicio.fechaServicio = req.body.fechaServicio;
            if (req.body.observacion) servicio.observacion = req.body.observacion;
            if (req.body.conformidadCliente) servicio.conformidadCliente = req.body.conformidadCliente;
        }

        // ✅ MODO CONFORMIDAD
        else if (modo === "conformidad") {
            servicio.conformidadCliente = req.body.conformidadCliente;
            if (req.body.fechaServicio) servicio.fechaServicio = req.body.fechaServicio;
        }

        // ✅ MODO VER / GENERAL
        else {
            if (req.body.detalleServicio) servicio.detalleServicio = req.body.detalleServicio;
            if (req.body.fechaServicio) servicio.fechaServicio = req.body.fechaServicio;
        }

        await servicio.save();

        res.json({
            mensaje: "Servicio actualizado correctamente",
            servicio
        });

    } catch (error) {
        console.error('❌ Error en editar-servicio:');
        console.error('Error completo:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            error: "Error al actualizar el servicio",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

export default router;