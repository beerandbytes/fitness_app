import React, { useState, useEffect } from 'react';
import ModernNavbar from '../components/ModernNavbar';
import BottomNavigation from '../components/BottomNavigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, TrendingUp, TrendingDown, Calendar, Ruler, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import logger from '../utils/logger';
import useToastStore from '../stores/useToastStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, subDays } from 'date-fns';

const ProgressPage = () => {
    const toast = useToastStore();
    const [activeTab, setActiveTab] = useState('overview');
    const [measurements, setMeasurements] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMeasurementForm, setShowMeasurementForm] = useState(false);
    const [showPhotoForm, setShowPhotoForm] = useState(false);
    const [measurementForm, setMeasurementForm] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: '',
        neck: '',
        shoulders: '',
        body_fat_percentage: '',
    });
    const [photoForm, setPhotoForm] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        photo_front: null,
        photo_side: null,
        photo_back: null,
        weight: '',
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [measurementsRes, photosRes, analyticsRes] = await Promise.all([
                api.get('/progress/measurements'),
                api.get('/progress/photos'),
                api.get('/progress/analytics?period=30'),
            ]);
            setMeasurements(measurementsRes.data.measurements || []);
            setPhotos(photosRes.data.photos || []);
            setAnalytics(analyticsRes.data);
        } catch (error) {
            logger.error('Error al cargar datos de progreso:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMeasurement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/progress/measurements', measurementForm);
            toast.success('Medidas guardadas exitosamente');
            setShowMeasurementForm(false);
            loadData();
        } catch (error) {
            logger.error('Error al guardar medidas:', error);
            toast.error('Error al guardar medidas');
        }
    };

    const handleSavePhoto = async (e) => {
        e.preventDefault();
        try {
            // En producción, aquí se subirían las imágenes a un servicio de almacenamiento
            // Por ahora, usamos URLs placeholder
            const photoData = {
                ...photoForm,
                photo_front: photoForm.photo_front ? 'placeholder_front.jpg' : null,
                photo_side: photoForm.photo_side ? 'placeholder_side.jpg' : null,
                photo_back: photoForm.photo_back ? 'placeholder_back.jpg' : null,
            };
            await api.post('/progress/photos', photoData);
            toast.success('Fotos guardadas exitosamente');
            setShowPhotoForm(false);
            loadData();
        } catch (error) {
            logger.error('Error al guardar fotos:', error);
            toast.error('Error al guardar fotos');
        }
    };

    const prepareChartData = () => {
        if (measurements.length === 0) return [];
        
        return measurements.map(m => ({
            date: format(new Date(m.date), 'MMM dd'),
            chest: parseFloat(m.chest) || 0,
            waist: parseFloat(m.waist) || 0,
            hips: parseFloat(m.hips) || 0,
            arms: parseFloat(m.arms) || 0,
        }));
    };

    return (
        <>
            <ModernNavbar />
            <main className="min-h-screen bg-[#FAF3E1] dark:bg-black pb-24 md:pb-8 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">
                        Mi Progreso
                    </h1>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                        {[
                            { id: 'overview', label: 'Resumen', icon: TrendingUp },
                            { id: 'measurements', label: 'Medidas', icon: Ruler },
                            { id: 'photos', label: 'Fotos', icon: Camera },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && analytics && (
                        <div className="space-y-6">
                            {/* Análisis de Peso */}
                            {analytics.analysis.weight && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Análisis de Peso
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peso Inicial</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {analytics.analysis.weight.start?.toFixed(1)} kg
                                            </div>
                                        </div>
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peso Actual</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {analytics.analysis.weight.end?.toFixed(1)} kg
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-2xl ${
                                            analytics.analysis.weight.change > 0
                                                ? 'bg-red-50 dark:bg-red-900/20'
                                                : analytics.analysis.weight.change < 0
                                                ? 'bg-green-50 dark:bg-green-900/20'
                                                : 'bg-gray-50 dark:bg-gray-800'
                                        }`}>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cambio</div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {analytics.analysis.weight.change !== null && (
                                                    <>
                                                        {analytics.analysis.weight.change > 0 ? (
                                                            <TrendingUp className="w-6 h-6 text-red-600" />
                                                        ) : analytics.analysis.weight.change < 0 ? (
                                                            <TrendingDown className="w-6 h-6 text-green-600" />
                                                        ) : null}
                                                        {Math.abs(analytics.analysis.weight.change).toFixed(1)} kg
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Proyección */}
                                    {analytics.analysis.projection && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                Proyección hacia tu Objetivo
                                            </h3>
                                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                                A este ritmo alcanzarás tu objetivo en aproximadamente{' '}
                                                <span className="font-bold">{analytics.analysis.projection.daysToGoal} días</span>
                                                {' '}(alrededor del {format(new Date(analytics.analysis.projection.estimatedDate), 'dd MMM yyyy')})
                                            </div>
                                            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                                Ritmo promedio: {analytics.analysis.projection.ratePerWeek.toFixed(2)} kg/semana
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Gráfico de Medidas */}
                            {measurements.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Evolución de Medidas
                                    </h2>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={prepareChartData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="chest" stroke="#3b82f6" name="Pecho" />
                                            <Line type="monotone" dataKey="waist" stroke="#ef4444" name="Cintura" />
                                            <Line type="monotone" dataKey="hips" stroke="#10b981" name="Cadera" />
                                            <Line type="monotone" dataKey="arms" stroke="#f59e0b" name="Brazos" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* Measurements Tab */}
                    {activeTab === 'measurements' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Medidas Corporales
                                </h2>
                                <button
                                    onClick={() => setShowMeasurementForm(true)}
                                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                >
                                    + Añadir Medidas
                                </button>
                            </div>

                            {measurements.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                                    <Ruler className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No has registrado medidas todavía
                                    </p>
                                    <button
                                        onClick={() => setShowMeasurementForm(true)}
                                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                    >
                                        Registrar Primera Medida
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {measurements.map((measurement, index) => (
                                        <motion.div
                                            key={measurement.measurement_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
                                        >
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {format(new Date(measurement.date), 'dd MMM yyyy')}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {measurement.chest && (
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Pecho</div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {parseFloat(measurement.chest).toFixed(1)} cm
                                                        </div>
                                                    </div>
                                                )}
                                                {measurement.waist && (
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Cintura</div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {parseFloat(measurement.waist).toFixed(1)} cm
                                                        </div>
                                                    </div>
                                                )}
                                                {measurement.hips && (
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Cadera</div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {parseFloat(measurement.hips).toFixed(1)} cm
                                                        </div>
                                                    </div>
                                                )}
                                                {measurement.arms && (
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">Brazos</div>
                                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                            {parseFloat(measurement.arms).toFixed(1)} cm
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Photos Tab */}
                    {activeTab === 'photos' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Fotos de Progreso
                                </h2>
                                <button
                                    onClick={() => setShowPhotoForm(true)}
                                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                >
                                    + Añadir Fotos
                                </button>
                            </div>

                            {photos.length === 0 ? (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        No has subido fotos de progreso todavía
                                    </p>
                                    <button
                                        onClick={() => setShowPhotoForm(true)}
                                        className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                    >
                                        Subir Primera Foto
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {photos.map((photo, index) => (
                                        <motion.div
                                            key={photo.photo_id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg"
                                        >
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                                {format(new Date(photo.date), 'dd MMM yyyy')}
                                            </h3>
                                            {photo.weight && (
                                                <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                                    Peso: {parseFloat(photo.weight).toFixed(1)} kg
                                                </div>
                                            )}
                                            <div className="grid grid-cols-3 gap-2">
                                                {photo.photo_front && (
                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                {photo.photo_side && (
                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                {photo.photo_back && (
                                                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Measurement Form Modal */}
                    <AnimatePresence>
                        {showMeasurementForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                                onClick={() => setShowMeasurementForm(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Registrar Medidas
                                    </h3>
                                    <form onSubmit={handleSaveMeasurement} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                value={measurementForm.date}
                                                onChange={(e) => setMeasurementForm({ ...measurementForm, date: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Pecho (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={measurementForm.chest}
                                                    onChange={(e) => setMeasurementForm({ ...measurementForm, chest: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Cintura (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={measurementForm.waist}
                                                    onChange={(e) => setMeasurementForm({ ...measurementForm, waist: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Cadera (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={measurementForm.hips}
                                                    onChange={(e) => setMeasurementForm({ ...measurementForm, hips: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Brazos (cm)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={measurementForm.arms}
                                                    onChange={(e) => setMeasurementForm({ ...measurementForm, arms: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowMeasurementForm(false)}
                                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Photo Form Modal */}
                    <AnimatePresence>
                        {showPhotoForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                                onClick={() => setShowPhotoForm(false)}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.9, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                                >
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                        Subir Fotos de Progreso
                                    </h3>
                                    <form onSubmit={handleSavePhoto} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Fecha
                                            </label>
                                            <input
                                                type="date"
                                                value={photoForm.date}
                                                onChange={(e) => setPhotoForm({ ...photoForm, date: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Peso (kg)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={photoForm.weight}
                                                onChange={(e) => setPhotoForm({ ...photoForm, weight: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Frontal
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setPhotoForm({ ...photoForm, photo_front: e.target.files[0] })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Lateral
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setPhotoForm({ ...photoForm, photo_side: e.target.files[0] })}
                                                    className="w-full"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Posterior
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => setPhotoForm({ ...photoForm, photo_back: e.target.files[0] })}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Notas
                                            </label>
                                            <textarea
                                                value={photoForm.notes}
                                                onChange={(e) => setPhotoForm({ ...photoForm, notes: e.target.value })}
                                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                                rows="3"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowPhotoForm(false)}
                                                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
            <BottomNavigation />
        </>
    );
};

export default ProgressPage;

