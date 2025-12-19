# Configuración de Medios de Ejercicios desde wger API

La aplicación utiliza **wger API** (pública y gratuita) para obtener imágenes y videos de ejercicios. No se requiere configuración de API keys.

## wger API (Pública - Sin API Key Requerida) ⭐

wger es una API pública y gratuita que no requiere autenticación. Se usa automáticamente para ejercicios que tienen `wger_id` en la base de datos.

### Características:
- ✅ **Pública y gratuita**: No requiere API key
- ✅ **Sin límites estrictos**: API pública, pero se recomienda ser respetuoso con las requests
- ✅ **Base de datos extensa**: Miles de ejercicios con imágenes y videos
- ✅ **Soporte en español**: Ejercicios disponibles en múltiples idiomas
- ✅ **Imágenes y videos**: Proporciona tanto imágenes estáticas como videos de demostración

### Limitaciones:
- ⚠️ Principalmente imágenes estáticas (.jpg, .png), no GIFs animados
- ⚠️ Solo funciona para ejercicios que ya tienen `wger_id` en la base de datos

### Uso:
No requiere configuración. Se usa automáticamente si el ejercicio tiene `wger_id`.

**Documentación**: https://wger.de/api/v2/

## Uso del Script de Poblamiento

Para poblar la base de datos con imágenes y videos desde wger, ejecuta:

```bash
cd fitness-app-backend
node scripts/populate-animated-gifs.js
```

Para procesar solo un número limitado de ejercicios (modo prueba):

```bash
node scripts/populate-animated-gifs.js 10
```

El script:
- Busca imágenes y videos para cada ejercicio que tiene `wger_id`
- Actualiza `gif_url` con la imagen principal del ejercicio
- Actualiza `video_url` con el video de demostración (si está disponible)
- Respeta los límites de rate limiting automáticamente (200ms entre requests)
- Muestra un resumen detallado al finalizar

## Notas Importantes

- **Solo ejercicios con wger_id**: El script solo procesa ejercicios que tienen `wger_id` en la base de datos
- **Imágenes estáticas**: wger principalmente proporciona imágenes estáticas (.jpg, .png), no GIFs animados
- **Videos opcionales**: No todos los ejercicios tienen videos disponibles
- **Rate Limiting**: El script incluye delays automáticos (200ms) para ser respetuoso con la API pública
- **Sin configuración requerida**: No necesitas configurar ninguna API key
