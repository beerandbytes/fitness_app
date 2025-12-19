import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Search } from 'lucide-react';
import api from '../services/api';
import logger from '../utils/logger';
import useToastStore from '../stores/useToastStore';

/**
 * Componente para escanear códigos de barras usando la cámara
 * Integrado con Open Food Facts API
 */
const BarcodeScanner = ({ onFoodFound, onClose }) => {
    const toast = useToastStore();
    const videoRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [barcode, setBarcode] = useState('');
    const [foodData, setFoodData] = useState(null);
    const [loading, setLoading] = useState(false);
    const streamRef = useRef(null);

    useEffect(() => {
        return () => {
            // Limpiar stream al desmontar
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Cámara trasera en móvil
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setScanning(true);
            }
        } catch (error) {
            logger.error('Error al acceder a la cámara:', error);
            toast.error('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const stopScanning = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setScanning(false);
    };

    const handleBarcodeInput = (e) => {
        setBarcode(e.target.value);
    };

    const searchBarcode = async () => {
        if (!barcode.trim()) {
            toast.error('Ingresa un código de barras');
            return;
        }

        setLoading(true);
        try {
            // Buscar en Open Food Facts API
            const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
            const data = await response.json();

            if (data.status === 1 && data.product) {
                const product = data.product;
                
                // Convertir datos de Open Food Facts al formato de nuestra app
                const foodData = {
                    name: product.product_name_es || product.product_name || 'Producto desconocido',
                    calories_base: product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0,
                    protein_g: product.nutriments?.proteins_100g || 0,
                    carbs_g: product.nutriments?.carbohydrates_100g || 0,
                    fat_g: product.nutriments?.fat_100g || 0,
                    image_url: product.image_url || product.image_front_url,
                    barcode: barcode,
                };

                setFoodData(foodData);
                
                if (onFoodFound) {
                    onFoodFound(foodData);
                }
            } else {
                toast.error('Producto no encontrado en Open Food Facts');
            }
        } catch (error) {
            logger.error('Error al buscar código de barras:', error);
            toast.error('Error al buscar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        Escanear Código de Barras
                    </h2>
                    <button
                        onClick={() => {
                            stopScanning();
                            if (onClose) onClose();
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Input manual de código de barras */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        O ingresa el código manualmente
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={barcode}
                            onChange={handleBarcodeInput}
                            placeholder="Ej: 3017620422003"
                            className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 dark:focus:border-blue-400 text-gray-900 dark:text-white"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    searchBarcode();
                                }
                            }}
                        />
                        <button
                            onClick={searchBarcode}
                            disabled={loading || !barcode.trim()}
                            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            Buscar
                        </button>
                    </div>
                </div>

                {/* Área de cámara */}
                {scanning ? (
                    <div className="relative mb-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 bg-black rounded-xl object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="border-2 border-blue-500 rounded-lg w-64 h-32" />
                        </div>
                        <button
                            onClick={stopScanning}
                            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                            Detener Escaneo
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={startScanning}
                        className="w-full py-4 bg-blue-600 dark:bg-blue-500 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mb-4"
                    >
                        <Camera className="w-5 h-5" />
                        Iniciar Escaneo con Cámara
                    </button>
                )}

                {/* Resultado del producto */}
                {foodData && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {foodData.name}
                        </h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>Calorías: {foodData.calories_base} kcal/100g</p>
                            <p>Proteínas: {foodData.protein_g}g | Carbohidratos: {foodData.carbs_g}g | Grasas: {foodData.fat_g}g</p>
                        </div>
                        {foodData.image_url && (
                            <img 
                                src={foodData.image_url} 
                                alt={foodData.name}
                                className="mt-2 w-full h-32 object-contain rounded-lg"
                            />
                        )}
                    </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Los datos provienen de Open Food Facts
                </p>
            </div>
        </div>
    );
};

export default BarcodeScanner;
