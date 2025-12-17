// routes/dashboard.js
import express from "express";
import ServiceRecord from "../models/ServiceRecord.js";

const router = express.Router();

// GET: obtener estadísticas del dashboard
router.get("/stats", async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Si no se proporcionan fechas, usar el mes actual
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const start = startDate ? new Date(startDate) : firstDayOfMonth;
        const end = endDate ? new Date(endDate) : lastDayOfMonth;

        // Filtro de fecha
        const dateFilter = {
            createdAt: {
                $gte: start,
                $lte: end
            }
        };

        // 1. Total de servicios en el rango de fechas
        const totalServicios = await ServiceRecord.countDocuments(dateFilter);

        // 2. Total de servicios (histórico)
        const totalServiciosHistorico = await ServiceRecord.countDocuments();

        // 3. Servicios cerrados vs abiertos (en el rango)
        const serviciosCerrados = await ServiceRecord.countDocuments({
            ...dateFilter,
            servicioCerrado: true
        });
        const serviciosAbiertos = totalServicios - serviciosCerrados;

        // 4. Servicios pendientes de conformidad (sin firma del cliente)
        const serviciosPendientes = await ServiceRecord.countDocuments({
            ...dateFilter,
            $or: [
                { firmaCliente: { $exists: false } },
                { firmaCliente: null },
                { firmaCliente: "" }
            ]
        });

        // 5. Servicios por técnico
        const serviciosPorTecnico = await ServiceRecord.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$tecnico",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // 6. Servicios por cliente (top 10)
        const serviciosPorCliente = await ServiceRecord.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$cliente",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // 7. Tendencia de servicios por día (últimos 30 días o rango seleccionado)
        const serviciosPorDia = await ServiceRecord.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 8. Últimos 5 servicios
        const ultimosServicios = await ServiceRecord.find(dateFilter)
            .sort({ createdAt: -1 })
            .limit(5)
            .select('cotizacion cliente tecnico fechaServicio servicioCerrado createdAt');

        // 9. Servicios con evidencias
        const serviciosConEvidencias = await ServiceRecord.countDocuments({
            ...dateFilter,
            $or: [
                { 'evidencia.archivos1': { $ne: '' } },
                { 'evidencia.archivos2': { $ne: '' } },
                { 'evidencia.archivos3': { $ne: '' } }
            ]
        });

        res.json({
            periodo: {
                inicio: start,
                fin: end
            },
            resumen: {
                totalServicios,
                totalServiciosHistorico,
                serviciosCerrados,
                serviciosAbiertos,
                serviciosPendientes,
                serviciosConEvidencias
            },
            serviciosPorTecnico,
            serviciosPorCliente,
            serviciosPorDia,
            ultimosServicios
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            error: "Error al obtener estadísticas del dashboard",
            details: error.message
        });
    }
});

export default router;
