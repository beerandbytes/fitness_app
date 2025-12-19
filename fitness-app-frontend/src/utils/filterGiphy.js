// Utilidad para filtrar URLs de Giphy
// Asegura que ninguna URL de Giphy se muestre en el frontend

/**
 * Filtra URLs de Giphy, retornando null si la URL es de Giphy
 * @param {string|null|undefined} url - URL a verificar
 * @returns {string|null} - URL si no es de Giphy, null si es de Giphy
 */
export function filterGiphyUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }
    
    const urlLower = url.toLowerCase();
    
    // Lista de patrones de Giphy a detectar
    const giphyPatterns = [
        'giphy.com',
        'giphy',
        'media.giphy.com',
        'i.giphy.com',
        'media0.giphy.com',
        'media1.giphy.com',
        'media2.giphy.com',
        'media3.giphy.com',
        'api.giphy.com'
    ];
    
    // Si la URL contiene alguno de los patrones de Giphy, retornar null
    for (const pattern of giphyPatterns) {
        if (urlLower.includes(pattern)) {
            return null;
        }
    }
    
    return url;
}

/**
 * Filtra un objeto de ejercicio para remover URLs de Giphy
 * @param {Object} exercise - Objeto de ejercicio
 * @returns {Object} - Objeto de ejercicio con URLs de Giphy filtradas
 */
export function filterExerciseGiphy(exercise) {
    if (!exercise) {
        return exercise;
    }
    
    return {
        ...exercise,
        gif_url: filterGiphyUrl(exercise.gif_url),
        video_url: filterGiphyUrl(exercise.video_url),
        thumbnail: filterGiphyUrl(exercise.thumbnail)
    };
}

