import React, { useState } from 'react';
import api from '../services/api';
import useToastStore from '../stores/useToastStore';
import logger from '../utils/logger';
import { X, Upload, Link as LinkIcon, Image, Video } from 'lucide-react';

const CreateExerciseModal = ({ open, onClose, onExerciseCreated }) => {
    const toast = useToastStore();
    const [formData, setFormData] = useState({
        name: '',
        name_es: '',
        description: '',
        category: 'Fuerza',
        default_calories_per_minute: 5,
    });
    const [mediaType, setMediaType] = useState('url'); // 'url' or 'upload'
    const [gifUrl, setGifUrl] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedVideo, setUploadedVideo] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const categories = ['Cardio', 'Fuerza', 'Híbrido'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            toast.error('Formato de imagen no válido. Use JPEG, PNG, GIF o WebP.');
            return;
        }

        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('La imagen es demasiado grande. Máximo 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result);
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleVideoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (!validVideoTypes.includes(file.type)) {
            toast.error('Formato de video no válido. Use MP4, WebM o MOV.');
            return;
        }

        // Validar tamaño (10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('El video es demasiado grande. Máximo 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedVideo(reader.result);
            setVideoPreview(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validaciones
        if (!formData.name.trim()) {
            setError('El nombre del ejercicio es requerido.');
            return;
        }

        if (!formData.category) {
            setError('La categoría es requerida.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                name_es: formData.name_es.trim() || undefined,
                description: formData.description.trim() || undefined,
                category: formData.category,
                default_calories_per_minute: parseFloat(formData.default_calories_per_minute) || 5,
            };

            // Añadir media según el tipo seleccionado
            if (mediaType === 'url') {
                if (gifUrl.trim()) {
                    payload.gif_url = gifUrl.trim();
                }
                if (videoUrl.trim()) {
                    payload.video_url = videoUrl.trim();
                }
            } else {
                // Upload
                if (uploadedImage) {
                    payload.image_base64 = uploadedImage;
                }
                if (uploadedVideo) {
                    payload.video_base64 = uploadedVideo;
                }
            }

            const response = await api.post('/exercises', payload);
            
            toast.success('Ejercicio creado exitosamente');
            
            // Resetear formulario
            resetForm();
            
            // Cerrar modal y notificar al componente padre
            if (onExerciseCreated) {
                onExerciseCreated(response.data.exercise);
            }
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Error al crear el ejercicio';
            setError(errorMessage);
            logger.error('Error al crear ejercicio:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            name_es: '',
            description: '',
            category: 'Fuerza',
            default_calories_per_minute: 5,
        });
        setMediaType('url');
        setGifUrl('');
        setVideoUrl('');
        setUploadedImage(null);
        setUploadedVideo(null);
        setImagePreview(null);
        setVideoPreview(null);
        setError(null);
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl md:rounded-3xl shadow-xl w-full md:w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Crear Nuevo Ejercicio
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4" role="alert">
                            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre del Ejercicio *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Push Up, Squat, Bench Press"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Nombre en Español */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre en Español (opcional)
                        </label>
                        <input
                            type="text"
                            name="name_es"
                            value={formData.name_es}
                            onChange={handleInputChange}
                            placeholder="Ej: Flexión, Sentadilla, Press Banca"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descripción (opcional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe cómo realizar el ejercicio, músculos trabajados, etc."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all resize-none"
                        />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Categoría *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Calorías por minuto */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Calorías por minuto (opcional)
                        </label>
                        <input
                            type="number"
                            name="default_calories_per_minute"
                            value={formData.default_calories_per_minute}
                            onChange={handleInputChange}
                            min="0"
                            step="0.5"
                            placeholder="5"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Media Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Imagen o Video
                        </label>
                        <div className="flex gap-2 mb-4">
                            <button
                                type="button"
                                onClick={() => setMediaType('url')}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                    mediaType === 'url'
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <LinkIcon className="w-5 h-5" />
                                URL
                            </button>
                            <button
                                type="button"
                                onClick={() => setMediaType('upload')}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                    mediaType === 'upload'
                                        ? 'bg-blue-600 dark:bg-blue-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                            >
                                <Upload className="w-5 h-5" />
                                Subir Archivo
                            </button>
                        </div>

                        {/* URL Inputs */}
                        {mediaType === 'url' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        URL de Imagen/GIF (opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={gifUrl}
                                        onChange={(e) => setGifUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.gif"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                                    />
                                    {gifUrl && (
                                        <div className="mt-2">
                                            <img
                                                src={gifUrl}
                                                alt="Preview"
                                                className="max-w-full h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        URL de Video (opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={videoUrl}
                                        onChange={(e) => setVideoUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/video.mp4"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 transition-all"
                                    />
                                    {videoUrl && (
                                        <div className="mt-2">
                                            <video
                                                src={videoUrl}
                                                controls
                                                className="max-w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* File Upload */}
                        {mediaType === 'upload' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Subir Imagen/GIF (opcional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Seleccionar Imagen
                                            </span>
                                        </label>
                                    </div>
                                    {imagePreview && (
                                        <div className="mt-2">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="max-w-full h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Subir Video (opcional)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="video/mp4,video/webm,video/quicktime"
                                            onChange={handleVideoUpload}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label
                                            htmlFor="video-upload"
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Seleccionar Video
                                            </span>
                                        </label>
                                    </div>
                                    {videoPreview && (
                                        <div className="mt-2">
                                            <video
                                                src={videoPreview}
                                                controls
                                                className="max-w-full h-32 rounded-lg border border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando...' : 'Crear Ejercicio'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="px-4 py-3 bg-gray-600 dark:bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExerciseModal;

