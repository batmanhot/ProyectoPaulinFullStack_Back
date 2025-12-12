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

        // Validar si el servicio YA estaba cerrado previamente
        // Si ya estaba cerrado, no permitir ninguna modificacion
        const estabaCerrado = servicio.servicioCerrado;

        if (estabaCerrado && modo !== "ver") {
            return res.status(403).json({
                error: "Este servicio esta cerrado y no se puede modificar"
            });
        }

        console.log('Modo:', modo);
        console.log('Archivos recibidos:', req.files);
        console.log('Body recibido:', req.body);

        // MODO CONFORMIDAD - Ahora aqui se guardan las imagenes
        if (modo === "conformidad") {
            // Guardar los nombres de archivo en evidencia.archivos1, archivos2, archivos3
            if (req.files && req.files.evidencia1 && req.files.evidencia1[0]) {
                const fileName = req.files.evidencia1[0].filename;
                servicio.evidencia.archivos1 = fileName;
                servicio.evidencia.casilla1 = true;
                console.log('Archivo 1 guardado:', fileName);
            }
            if (req.files && req.files.evidencia2 && req.files.evidencia2[0]) {
                const fileName = req.files.evidencia2[0].filename;
                servicio.evidencia.archivos2 = fileName;
                servicio.evidencia.casilla2 = true;
                console.log('Archivo 2 guardado:', fileName);
            }
            if (req.files && req.files.evidencia3 && req.files.evidencia3[0]) {
                const fileName = req.files.evidencia3[0].filename;
                servicio.evidencia.archivos3 = fileName;
                servicio.evidencia.casilla3 = true;
                console.log('Archivo 3 guardado:', fileName);
            }

            // Actualizar otros campos
            if (req.body.conformidadCliente) servicio.conformidadCliente = req.body.conformidadCliente;
            if (req.body.fechaServicio) servicio.fechaServicio = req.body.fechaServicio;
            if (req.body.observacion) servicio.observacion = req.body.observacion;

            // Actualizar la firma del cliente
            if (req.body.firmaCliente) {
                servicio.firmaCliente = req.body.firmaCliente;
                console.log('Firma del cliente actualizada');
            }

            // Actualizar el estado de servicio cerrado
            if (req.body.servicioCerrado !== undefined) {
                servicio.servicioCerrado = req.body.servicioCerrado === 'true' || req.body.servicioCerrado === true;
                console.log('Servicio cerrado actualizado:', servicio.servicioCerrado);
            }
        }

        // MODO EVIDENCIAS - Solo lectura, no se permite modificar
        else if (modo === "evidencias") {
            // En modo evidencias no se permite modificar nada
            return res.status(403).json({
                error: "El modo evidencias es solo de lectura"
            });
        }

        // MODO VER / GENERAL
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
        console.error('Error en editar-servicio:');
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