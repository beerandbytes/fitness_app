# Solución para ChunkLoadError en Docusaurus

## Problema

Error al cargar chunks de JavaScript:
```
Loading chunk c4f5d8e4 failed.
ChunkLoadError
```

## Causas Comunes

1. **Build desactualizado** - Los archivos de build no coinciden con el código actual
2. **Caché del navegador** - El navegador está usando archivos antiguos en caché
3. **Caché de Docusaurus** - Archivos `.docusaurus` desactualizados
4. **Problemas de baseUrl** - Configuración incorrecta de baseUrl

## Soluciones Aplicadas

### 1. Limpieza Completa ✅

```bash
cd docs
npm run clear
# Eliminar manualmente .docusaurus y build si es necesario
```

### 2. Reconstruir desde Cero ✅

```bash
cd docs
npm run clear
npm install  # Reinstalar dependencias si es necesario
npm start    # Reconstruir en modo desarrollo
```

### 3. Limpiar Caché del Navegador

- **Chrome/Edge**: Ctrl+Shift+Delete → Limpiar caché
- **Firefox**: Ctrl+Shift+Delete → Limpiar caché
- O usar modo incógnito para probar

### 4. Verificar Configuración

Verificar que `baseUrl` en `docusaurus.config.js` sea `/` (no `/docs/` u otro)

## Pasos Recomendados

1. **Detener el servidor** (Ctrl+C)

2. **Limpiar completamente**:
   ```bash
   cd docs
   npm run clear
   rm -rf .docusaurus build node_modules/.cache
   ```

3. **Reinstalar dependencias** (opcional pero recomendado):
   ```bash
   npm install
   ```

4. **Reiniciar el servidor**:
   ```bash
   npm start
   ```

5. **Limpiar caché del navegador**:
   - Ctrl+Shift+R (hard refresh)
   - O usar modo incógnito

## Verificación

Después de limpiar y reconstruir:

1. El servidor debería iniciar sin errores
2. Los chunks deberían cargar correctamente
3. La página debería funcionar en ambos idiomas

## Si el Problema Persiste

1. Verificar que no hay procesos de Node.js ejecutándose:
   ```bash
   # Windows
   taskkill /F /IM node.exe
   
   # Linux/Mac
   pkill node
   ```

2. Verificar puerto 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

3. Cambiar puerto temporalmente:
   ```bash
   PORT=3001 npm start
   ```

4. Verificar logs del servidor para más detalles del error

## Estado

✅ **Limpieza aplicada**
- Caché de Docusaurus limpiado
- Build eliminado
- Servidor reiniciado

El problema debería estar resuelto después de la limpieza y reconstrucción.

