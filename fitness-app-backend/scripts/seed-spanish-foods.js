/**
 * Script para poblar la base de datos con alimentos típicos españoles
 * Incluye ingredientes con técnicas de cocción españolas, platos tradicionales y productos procesados
 * Ejecutar: npm run seed:foods:spanish
 * 
 * Fuentes: BEDCA, tablas nutricionales españolas, valores estándar para platos tradicionales
 */

require('dotenv').config();
const { db } = require('../db/db_config');
const { foods } = require('../db/schema');
const { eq } = require('drizzle-orm');

// Lista completa de alimentos españoles con valores nutricionales (por 100g)
const spanishFoods = [
    // ========================================
    // CARNES Y AVES - POLLO
    // ========================================
    { name: 'Pollo (pechuga, cruda)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Pollo (pechuga, asada)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Pollo (pechuga, horneada)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Pollo (pechuga, a la plancha)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Pollo (muslo, crudo)', calories_base: 209, protein_g: 26, carbs_g: 0, fat_g: 10 },
    { name: 'Pollo (muslo, asado)', calories_base: 209, protein_g: 26, carbs_g: 0, fat_g: 10 },
    { name: 'Pollo (muslo, horneado)', calories_base: 209, protein_g: 26, carbs_g: 0, fat_g: 10 },
    { name: 'Pollo (ala, cruda)', calories_base: 222, protein_g: 23, carbs_g: 0, fat_g: 13 },
    { name: 'Pollo (ala, asada)', calories_base: 222, protein_g: 23, carbs_g: 0, fat_g: 13 },
    { name: 'Pollo (entero, crudo)', calories_base: 215, protein_g: 27, carbs_g: 0, fat_g: 11 },
    { name: 'Pollo (entero, asado)', calories_base: 239, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Pollo (entero, horneado)', calories_base: 239, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Pollo (en salmuera)', calories_base: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
    { name: 'Pollo (estofado)', calories_base: 180, protein_g: 28, carbs_g: 2, fat_g: 7 },
    { name: 'Pollo (guisado)', calories_base: 180, protein_g: 28, carbs_g: 2, fat_g: 7 },
    
    // ========================================
    // CARNES Y AVES - CERDO
    // ========================================
    { name: 'Cerdo (lomo, crudo)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Cerdo (lomo, asado)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Cerdo (lomo, a la plancha)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Cerdo (solomillo, crudo)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Cerdo (solomillo, asado)', calories_base: 242, protein_g: 27, carbs_g: 0, fat_g: 14 },
    { name: 'Cerdo (costilla, cruda)', calories_base: 297, protein_g: 27, carbs_g: 0, fat_g: 20 },
    { name: 'Cerdo (costilla, asada)', calories_base: 297, protein_g: 27, carbs_g: 0, fat_g: 20 },
    { name: 'Cerdo (panceta, cruda)', calories_base: 518, protein_g: 9, carbs_g: 0, fat_g: 53 },
    { name: 'Cerdo (panceta, frita)', calories_base: 518, protein_g: 9, carbs_g: 0, fat_g: 53 },
    { name: 'Cerdo (codillo, cocido)', calories_base: 297, protein_g: 27, carbs_g: 0, fat_g: 20 },
    { name: 'Cerdo (estofado)', calories_base: 280, protein_g: 25, carbs_g: 2, fat_g: 18 },
    { name: 'Jamón serrano', calories_base: 240, protein_g: 30, carbs_g: 0, fat_g: 12 },
    { name: 'Jamón ibérico (bellota)', calories_base: 375, protein_g: 21, carbs_g: 0, fat_g: 32 },
    { name: 'Jamón ibérico (cebo)', calories_base: 320, protein_g: 25, carbs_g: 0, fat_g: 24 },
    { name: 'Jamón ibérico (recebo)', calories_base: 350, protein_g: 23, carbs_g: 0, fat_g: 28 },
    { name: 'Jamón cocido', calories_base: 120, protein_g: 19, carbs_g: 1, fat_g: 4 },
    { name: 'Chorizo (dulce)', calories_base: 455, protein_g: 24, carbs_g: 2, fat_g: 38 },
    { name: 'Chorizo (picante)', calories_base: 455, protein_g: 24, carbs_g: 2, fat_g: 38 },
    { name: 'Salchichón', calories_base: 430, protein_g: 25, carbs_g: 1, fat_g: 35 },
    { name: 'Fuet', calories_base: 380, protein_g: 22, carbs_g: 1, fat_g: 32 },
    { name: 'Lomo embuchado', calories_base: 320, protein_g: 30, carbs_g: 0, fat_g: 22 },
    { name: 'Morcilla (de Burgos)', calories_base: 379, protein_g: 15, carbs_g: 2, fat_g: 34 },
    { name: 'Morcilla (de arroz)', calories_base: 350, protein_g: 12, carbs_g: 8, fat_g: 30 },
    { name: 'Butifarra', calories_base: 320, protein_g: 18, carbs_g: 2, fat_g: 26 },
    { name: 'Sobrasada', calories_base: 420, protein_g: 20, carbs_g: 1, fat_g: 36 },
    
    // ========================================
    // CARNES Y AVES - TERNERA
    // ========================================
    { name: 'Ternera (lomo, crudo)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (lomo, asado)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (lomo, a la plancha)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (solomillo, crudo)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (solomillo, asado)', calories_base: 250, protein_g: 26, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (carne picada, 95% magra)', calories_base: 171, protein_g: 27, carbs_g: 0, fat_g: 7 },
    { name: 'Ternera (carne picada, 80% magra)', calories_base: 254, protein_g: 25, carbs_g: 0, fat_g: 17 },
    { name: 'Ternera (estofada)', calories_base: 220, protein_g: 24, carbs_g: 2, fat_g: 12 },
    { name: 'Ternera (guisada)', calories_base: 220, protein_g: 24, carbs_g: 2, fat_g: 12 },
    { name: 'Rabo de toro', calories_base: 280, protein_g: 28, carbs_g: 0, fat_g: 18 },
    { name: 'Carrillada de ternera', calories_base: 240, protein_g: 22, carbs_g: 0, fat_g: 16 },
    { name: 'Callos a la madrileña', calories_base: 180, protein_g: 20, carbs_g: 3, fat_g: 9 },
    
    // ========================================
    // CARNES Y AVES - CORDERO
    // ========================================
    { name: 'Cordero (paleta, cruda)', calories_base: 294, protein_g: 25, carbs_g: 0, fat_g: 21 },
    { name: 'Cordero (paleta, asada)', calories_base: 294, protein_g: 25, carbs_g: 0, fat_g: 21 },
    { name: 'Cordero (paleta, horneada)', calories_base: 294, protein_g: 25, carbs_g: 0, fat_g: 21 },
    { name: 'Cordero (pierna, cruda)', calories_base: 258, protein_g: 25, carbs_g: 0, fat_g: 17 },
    { name: 'Cordero (pierna, asada)', calories_base: 258, protein_g: 25, carbs_g: 0, fat_g: 17 },
    { name: 'Cordero (costillas, asadas)', calories_base: 320, protein_g: 23, carbs_g: 0, fat_g: 24 },
    { name: 'Cordero (estofado)', calories_base: 280, protein_g: 24, carbs_g: 2, fat_g: 19 },
    
    // ========================================
    // CARNES Y AVES - CONEJO Y PAVO
    // ========================================
    { name: 'Conejo (entero, crudo)', calories_base: 173, protein_g: 33, carbs_g: 0, fat_g: 4 },
    { name: 'Conejo (asado)', calories_base: 173, protein_g: 33, carbs_g: 0, fat_g: 4 },
    { name: 'Conejo (en salmuera)', calories_base: 173, protein_g: 33, carbs_g: 0, fat_g: 4 },
    { name: 'Conejo (estofado)', calories_base: 190, protein_g: 30, carbs_g: 2, fat_g: 6 },
    { name: 'Pavo (pechuga, cruda)', calories_base: 135, protein_g: 30, carbs_g: 0, fat_g: 1 },
    { name: 'Pavo (pechuga, asada)', calories_base: 189, protein_g: 30, carbs_g: 0, fat_g: 7 },
    { name: 'Pavo (pechuga, horneada)', calories_base: 189, protein_g: 30, carbs_g: 0, fat_g: 7 },
    { name: 'Pavo (muslo, crudo)', calories_base: 144, protein_g: 28, carbs_g: 0, fat_g: 4 },
    { name: 'Pavo (muslo, asado)', calories_base: 200, protein_g: 28, carbs_g: 0, fat_g: 9 },
    
    // ========================================
    // PESCADOS FRESCOS - TÉCNICAS ESPAÑOLAS
    // ========================================
    { name: 'Merluza (fresca, cruda)', calories_base: 71, protein_g: 17, carbs_g: 0, fat_g: 0.6 },
    { name: 'Merluza (a la plancha)', calories_base: 85, protein_g: 18, carbs_g: 0, fat_g: 1.5 },
    { name: 'Merluza (al horno)', calories_base: 90, protein_g: 18, carbs_g: 0, fat_g: 2 },
    { name: 'Merluza (en salsa verde)', calories_base: 120, protein_g: 17, carbs_g: 2, fat_g: 4 },
    { name: 'Merluza (a la romana)', calories_base: 220, protein_g: 16, carbs_g: 15, fat_g: 10 },
    { name: 'Bacalao (fresco, crudo)', calories_base: 82, protein_g: 18, carbs_g: 0, fat_g: 0.7 },
    { name: 'Bacalao (en salazón, seco)', calories_base: 290, protein_g: 62, carbs_g: 0, fat_g: 2 },
    { name: 'Bacalao (en salazón, remojado)', calories_base: 82, protein_g: 18, carbs_g: 0, fat_g: 0.7 },
    { name: 'Bacalao (al pil-pil)', calories_base: 280, protein_g: 20, carbs_g: 0, fat_g: 20 },
    { name: 'Bacalao (a la vizcaína)', calories_base: 180, protein_g: 18, carbs_g: 5, fat_g: 8 },
    { name: 'Bacalao (al horno)', calories_base: 95, protein_g: 18, carbs_g: 0, fat_g: 2 },
    { name: 'Dorada (fresca, cruda)', calories_base: 144, protein_g: 20, carbs_g: 0, fat_g: 6 },
    { name: 'Dorada (a la plancha)', calories_base: 160, protein_g: 20, carbs_g: 0, fat_g: 7 },
    { name: 'Dorada (al horno)', calories_base: 165, protein_g: 20, carbs_g: 0, fat_g: 7.5 },
    { name: 'Dorada (a la sal)', calories_base: 144, protein_g: 20, carbs_g: 0, fat_g: 6 },
    { name: 'Lubina (fresca, cruda)', calories_base: 124, protein_g: 24, carbs_g: 0, fat_g: 3 },
    { name: 'Lubina (a la plancha)', calories_base: 140, protein_g: 24, carbs_g: 0, fat_g: 4 },
    { name: 'Lubina (al horno)', calories_base: 145, protein_g: 24, carbs_g: 0, fat_g: 4.5 },
    { name: 'Lubina (a la sal)', calories_base: 124, protein_g: 24, carbs_g: 0, fat_g: 3 },
    { name: 'Rodaballo (fresco, crudo)', calories_base: 91, protein_g: 16, carbs_g: 0, fat_g: 2 },
    { name: 'Rodaballo (a la plancha)', calories_base: 105, protein_g: 16, carbs_g: 0, fat_g: 3 },
    { name: 'Rodaballo (al horno)', calories_base: 110, protein_g: 16, carbs_g: 0, fat_g: 3.5 },
    { name: 'Sardinas (frescas, crudas)', calories_base: 208, protein_g: 25, carbs_g: 0, fat_g: 11 },
    { name: 'Sardinas (a la plancha)', calories_base: 220, protein_g: 25, carbs_g: 0, fat_g: 12 },
    { name: 'Sardinas (al horno)', calories_base: 225, protein_g: 25, carbs_g: 0, fat_g: 12.5 },
    { name: 'Sardinas (en escabeche)', calories_base: 250, protein_g: 24, carbs_g: 2, fat_g: 15 },
    { name: 'Boquerones (frescos, crudos)', calories_base: 131, protein_g: 20, carbs_g: 0, fat_g: 5 },
    { name: 'Boquerones (en vinagre)', calories_base: 150, protein_g: 20, carbs_g: 1, fat_g: 6 },
    { name: 'Boquerones (fritos)', calories_base: 280, protein_g: 18, carbs_g: 8, fat_g: 18 },
    { name: 'Anchoas (frescas, crudas)', calories_base: 131, protein_g: 20, carbs_g: 0, fat_g: 5 },
    { name: 'Anchoas (en salazón)', calories_base: 210, protein_g: 28, carbs_g: 0, fat_g: 9 },
    { name: 'Anchoas (en aceite)', calories_base: 280, protein_g: 25, carbs_g: 0, fat_g: 18 },
    { name: 'Atún (fresco, crudo)', calories_base: 184, protein_g: 30, carbs_g: 0, fat_g: 6 },
    { name: 'Atún (a la plancha)', calories_base: 200, protein_g: 30, carbs_g: 0, fat_g: 7 },
    { name: 'Atún (al horno)', calories_base: 205, protein_g: 30, carbs_g: 0, fat_g: 7.5 },
    { name: 'Atún (en conserva, aceite)', calories_base: 198, protein_g: 26, carbs_g: 0, fat_g: 8 },
    { name: 'Atún (en conserva, agua)', calories_base: 116, protein_g: 26, carbs_g: 0, fat_g: 1 },
    { name: 'Salmón (fresco, crudo)', calories_base: 208, protein_g: 20, carbs_g: 0, fat_g: 13 },
    { name: 'Salmón (ahumado)', calories_base: 117, protein_g: 25, carbs_g: 0, fat_g: 4 },
    { name: 'Salmón (a la plancha)', calories_base: 220, protein_g: 20, carbs_g: 0, fat_g: 14 },
    { name: 'Salmón (al horno)', calories_base: 225, protein_g: 20, carbs_g: 0, fat_g: 14.5 },
    { name: 'Pescado (a la sal)', calories_base: 120, protein_g: 20, carbs_g: 0, fat_g: 4 },
    
    // ========================================
    // MARISCOS - TÉCNICAS ESPAÑOLAS
    // ========================================
    { name: 'Gambas (frescas, crudas)', calories_base: 85, protein_g: 18, carbs_g: 1, fat_g: 1 },
    { name: 'Gambas (a la plancha)', calories_base: 100, protein_g: 18, carbs_g: 1, fat_g: 2 },
    { name: 'Gambas (al ajillo)', calories_base: 180, protein_g: 18, carbs_g: 1, fat_g: 12 },
    { name: 'Gambas (a la gabardina)', calories_base: 250, protein_g: 16, carbs_g: 12, fat_g: 14 },
    { name: 'Langostinos (frescos, crudos)', calories_base: 99, protein_g: 24, carbs_g: 0, fat_g: 0.3 },
    { name: 'Langostinos (a la plancha)', calories_base: 115, protein_g: 24, carbs_g: 0, fat_g: 1.5 },
    { name: 'Langostinos (al ajillo)', calories_base: 200, protein_g: 23, carbs_g: 0, fat_g: 13 },
    { name: 'Cigalas (frescas, crudas)', calories_base: 90, protein_g: 20, carbs_g: 0, fat_g: 1 },
    { name: 'Cigalas (a la plancha)', calories_base: 105, protein_g: 20, carbs_g: 0, fat_g: 2 },
    { name: 'Bogavante (cocido)', calories_base: 97, protein_g: 20, carbs_g: 0.5, fat_g: 0.8 },
    { name: 'Bogavante (a la plancha)', calories_base: 120, protein_g: 20, carbs_g: 0.5, fat_g: 2 },
    { name: 'Centollo (cocido)', calories_base: 87, protein_g: 19, carbs_g: 0, fat_g: 1 },
    { name: 'Mejillones (frescos, crudos)', calories_base: 86, protein_g: 12, carbs_g: 4, fat_g: 2 },
    { name: 'Mejillones (al vapor)', calories_base: 86, protein_g: 12, carbs_g: 4, fat_g: 2 },
    { name: 'Mejillones (en escabeche)', calories_base: 150, protein_g: 11, carbs_g: 5, fat_g: 8 },
    { name: 'Mejillones (a la marinera)', calories_base: 120, protein_g: 12, carbs_g: 5, fat_g: 4 },
    { name: 'Almejas (frescas, crudas)', calories_base: 86, protein_g: 10, carbs_g: 2, fat_g: 1 },
    { name: 'Almejas (a la marinera)', calories_base: 120, protein_g: 10, carbs_g: 3, fat_g: 4 },
    { name: 'Berberechos (frescos, crudos)', calories_base: 79, protein_g: 13, carbs_g: 2, fat_g: 1 },
    { name: 'Berberechos (al vapor)', calories_base: 79, protein_g: 13, carbs_g: 2, fat_g: 1 },
    { name: 'Navajas (frescas, crudas)', calories_base: 72, protein_g: 14, carbs_g: 1, fat_g: 0.5 },
    { name: 'Navajas (a la plancha)', calories_base: 90, protein_g: 14, carbs_g: 1, fat_g: 2 },
    { name: 'Pulpo (fresco, crudo)', calories_base: 82, protein_g: 15, carbs_g: 2, fat_g: 1 },
    { name: 'Pulpo (a la gallega)', calories_base: 82, protein_g: 15, carbs_g: 2, fat_g: 1 },
    { name: 'Pulpo (a la plancha)', calories_base: 100, protein_g: 15, carbs_g: 2, fat_g: 3 },
    { name: 'Calamares (frescos, crudos)', calories_base: 92, protein_g: 16, carbs_g: 3, fat_g: 1 },
    { name: 'Calamares (a la romana)', calories_base: 250, protein_g: 14, carbs_g: 15, fat_g: 14 },
    { name: 'Calamares (a la plancha)', calories_base: 110, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Calamares (en su tinta)', calories_base: 120, protein_g: 15, carbs_g: 4, fat_g: 4 },
    { name: 'Chipirones (frescos, crudos)', calories_base: 92, protein_g: 16, carbs_g: 3, fat_g: 1 },
    { name: 'Chipirones (a la plancha)', calories_base: 110, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Chipirones (rellenos)', calories_base: 180, protein_g: 15, carbs_g: 8, fat_g: 10 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - ARROCES
    // ========================================
    { name: 'Paella valenciana', calories_base: 180, protein_g: 12, carbs_g: 22, fat_g: 5 },
    { name: 'Paella de marisco', calories_base: 160, protein_g: 14, carbs_g: 20, fat_g: 4 },
    { name: 'Paella mixta', calories_base: 170, protein_g: 13, carbs_g: 21, fat_g: 4.5 },
    { name: 'Arroz a banda', calories_base: 150, protein_g: 10, carbs_g: 22, fat_g: 3 },
    { name: 'Arroz negro', calories_base: 170, protein_g: 12, carbs_g: 22, fat_g: 4 },
    { name: 'Arroz con leche', calories_base: 120, protein_g: 3, carbs_g: 20, fat_g: 3 },
    { name: 'Arroz caldoso', calories_base: 140, protein_g: 8, carbs_g: 20, fat_g: 3 },
    { name: 'Arroz con bogavante', calories_base: 180, protein_g: 15, carbs_g: 20, fat_g: 5 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - TORTILLAS
    // ========================================
    { name: 'Tortilla española', calories_base: 180, protein_g: 8, carbs_g: 12, fat_g: 12 },
    { name: 'Tortilla de patatas', calories_base: 180, protein_g: 8, carbs_g: 12, fat_g: 12 },
    { name: 'Tortilla de patatas con cebolla', calories_base: 175, protein_g: 8, carbs_g: 13, fat_g: 11 },
    { name: 'Tortilla de patatas sin cebolla', calories_base: 180, protein_g: 8, carbs_g: 12, fat_g: 12 },
    { name: 'Tortilla francesa', calories_base: 196, protein_g: 14, carbs_g: 1, fat_g: 15 },
    { name: 'Tortilla de calabacín', calories_base: 120, protein_g: 6, carbs_g: 8, fat_g: 8 },
    { name: 'Tortilla de espinacas', calories_base: 110, protein_g: 7, carbs_g: 5, fat_g: 7 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - GUISOS
    // ========================================
    { name: 'Cocido madrileño', calories_base: 150, protein_g: 12, carbs_g: 15, fat_g: 5 },
    { name: 'Fabada asturiana', calories_base: 180, protein_g: 10, carbs_g: 20, fat_g: 6 },
    { name: 'Lentejas (guisadas)', calories_base: 130, protein_g: 9, carbs_g: 20, fat_g: 2 },
    { name: 'Potaje de garbanzos', calories_base: 170, protein_g: 9, carbs_g: 25, fat_g: 4 },
    { name: 'Garbanzos con espinacas', calories_base: 150, protein_g: 8, carbs_g: 22, fat_g: 3 },
    { name: 'Judías blancas (guisadas)', calories_base: 140, protein_g: 9, carbs_g: 23, fat_g: 2 },
    { name: 'Alubias rojas (guisadas)', calories_base: 140, protein_g: 9, carbs_g: 23, fat_g: 2 },
    { name: 'Estofado de ternera', calories_base: 220, protein_g: 24, carbs_g: 2, fat_g: 12 },
    { name: 'Estofado de pollo', calories_base: 180, protein_g: 28, carbs_g: 2, fat_g: 7 },
    { name: 'Estofado de cerdo', calories_base: 280, protein_g: 25, carbs_g: 2, fat_g: 18 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - SOPAS Y CREMAS
    // ========================================
    { name: 'Gazpacho', calories_base: 35, protein_g: 1, carbs_g: 6, fat_g: 1 },
    { name: 'Salmorejo', calories_base: 80, protein_g: 2, carbs_g: 10, fat_g: 3 },
    { name: 'Ajo blanco', calories_base: 120, protein_g: 3, carbs_g: 8, fat_g: 8 },
    { name: 'Sopa de ajo', calories_base: 90, protein_g: 3, carbs_g: 10, fat_g: 3 },
    { name: 'Crema de verduras', calories_base: 45, protein_g: 2, carbs_g: 6, fat_g: 1.5 },
    { name: 'Crema de calabacín', calories_base: 40, protein_g: 1.5, carbs_g: 5, fat_g: 1.5 },
    { name: 'Crema de espárragos', calories_base: 50, protein_g: 2, carbs_g: 6, fat_g: 2 },
    { name: 'Sopa de pescado', calories_base: 60, protein_g: 6, carbs_g: 4, fat_g: 2 },
    { name: 'Caldo gallego', calories_base: 45, protein_g: 3, carbs_g: 5, fat_g: 1 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - PESCADO
    // ========================================
    { name: 'Merluza en salsa verde', calories_base: 120, protein_g: 17, carbs_g: 2, fat_g: 4 },
    { name: 'Bacalao al pil-pil', calories_base: 280, protein_g: 20, carbs_g: 0, fat_g: 20 },
    { name: 'Bacalao a la vizcaína', calories_base: 180, protein_g: 18, carbs_g: 5, fat_g: 8 },
    { name: 'Pescado a la sal', calories_base: 120, protein_g: 20, carbs_g: 0, fat_g: 4 },
    { name: 'Rodaballo a la plancha', calories_base: 105, protein_g: 16, carbs_g: 0, fat_g: 3 },
    
    // ========================================
    // PLATOS TRADICIONALES ESPAÑOLES - CARNE
    // ========================================
    { name: 'Callos a la madrileña', calories_base: 180, protein_g: 20, carbs_g: 3, fat_g: 9 },
    { name: 'Rabo de toro', calories_base: 280, protein_g: 28, carbs_g: 0, fat_g: 18 },
    { name: 'Carrillada de ternera', calories_base: 240, protein_g: 22, carbs_g: 0, fat_g: 16 },
    { name: 'Cochinillo asado', calories_base: 320, protein_g: 25, carbs_g: 0, fat_g: 23 },
    { name: 'Cordero lechal asado', calories_base: 310, protein_g: 24, carbs_g: 0, fat_g: 22 },
    
    // ========================================
    // VERDURAS Y HORTALIZAS - TÉCNICAS ESPAÑOLAS
    // ========================================
    { name: 'Pimientos (asados)', calories_base: 35, protein_g: 1, carbs_g: 7, fat_g: 0.3 },
    { name: 'Pimientos del piquillo', calories_base: 35, protein_g: 1, carbs_g: 7, fat_g: 0.3 },
    { name: 'Tomates (asados)', calories_base: 32, protein_g: 1.3, carbs_g: 7, fat_g: 0.2 },
    { name: 'Tomate frito', calories_base: 80, protein_g: 1.5, carbs_g: 12, fat_g: 2.5 },
    { name: 'Berenjenas (a la plancha)', calories_base: 35, protein_g: 1, carbs_g: 9, fat_g: 0.2 },
    { name: 'Berenjenas (al horno)', calories_base: 35, protein_g: 1, carbs_g: 9, fat_g: 0.2 },
    { name: 'Calabacín (horneado)', calories_base: 17, protein_g: 1.1, carbs_g: 3.5, fat_g: 0.2 },
    { name: 'Calabacín (a la plancha)', calories_base: 17, protein_g: 1.1, carbs_g: 3.5, fat_g: 0.2 },
    { name: 'Patatas (asadas)', calories_base: 93, protein_g: 2.5, carbs_g: 21, fat_g: 0.1 },
    { name: 'Patatas (fritas)', calories_base: 319, protein_g: 3.8, carbs_g: 42, fat_g: 15 },
    { name: 'Patatas bravas', calories_base: 250, protein_g: 3, carbs_g: 35, fat_g: 10 },
    { name: 'Patatas alioli', calories_base: 280, protein_g: 3, carbs_g: 30, fat_g: 14 },
    { name: 'Cebollas (caramelizadas)', calories_base: 60, protein_g: 1.5, carbs_g: 12, fat_g: 0.5 },
    { name: 'Cebollas (asadas)', calories_base: 50, protein_g: 1.4, carbs_g: 11, fat_g: 0.3 },
    { name: 'Espárragos (verdes, a la plancha)', calories_base: 22, protein_g: 2.4, carbs_g: 4, fat_g: 0.1 },
    { name: 'Espárragos (verdes, al vapor)', calories_base: 22, protein_g: 2.4, carbs_g: 4, fat_g: 0.1 },
    { name: 'Espárragos (en conserva)', calories_base: 22, protein_g: 2.4, carbs_g: 4, fat_g: 0.1 },
    { name: 'Espárragos (trigueros, a la plancha)', calories_base: 25, protein_g: 2.5, carbs_g: 4.5, fat_g: 0.2 },
    { name: 'Judías verdes (cocidas)', calories_base: 31, protein_g: 1.9, carbs_g: 7, fat_g: 0.2 },
    { name: 'Judías verdes (salteadas)', calories_base: 50, protein_g: 1.9, carbs_g: 7, fat_g: 2 },
    { name: 'Acelgas (cocidas)', calories_base: 20, protein_g: 1.9, carbs_g: 4, fat_g: 0.2 },
    { name: 'Acelgas (con garbanzos)', calories_base: 90, protein_g: 4, carbs_g: 12, fat_g: 2 },
    { name: 'Espinacas (cocidas)', calories_base: 23, protein_g: 3, carbs_g: 3.8, fat_g: 0.3 },
    { name: 'Espinacas (salteadas)', calories_base: 40, protein_g: 3, carbs_g: 3.8, fat_g: 2 },
    { name: 'Brócoli (cocido)', calories_base: 35, protein_g: 2.8, carbs_g: 7, fat_g: 0.4 },
    { name: 'Brócoli (al vapor)', calories_base: 35, protein_g: 2.8, carbs_g: 7, fat_g: 0.4 },
    { name: 'Coliflor (cocida)', calories_base: 25, protein_g: 2, carbs_g: 5, fat_g: 0.3 },
    { name: 'Coliflor (al horno)', calories_base: 30, protein_g: 2, carbs_g: 5, fat_g: 1 },
    { name: 'Calabaza (asada)', calories_base: 30, protein_g: 1, carbs_g: 8, fat_g: 0.2 },
    { name: 'Calabaza (cocida)', calories_base: 26, protein_g: 1, carbs_g: 7, fat_g: 0.1 },
    { name: 'Zanahorias (asadas)', calories_base: 45, protein_g: 1, carbs_g: 10, fat_g: 0.3 },
    { name: 'Zanahorias (cocidas)', calories_base: 35, protein_g: 0.8, carbs_g: 8, fat_g: 0.2 },
    { name: 'Remolacha (cocida)', calories_base: 44, protein_g: 1.7, carbs_g: 10, fat_g: 0.2 },
    { name: 'Remolacha (asada)', calories_base: 50, protein_g: 1.7, carbs_g: 11, fat_g: 0.3 },
    { name: 'Puerro (cocido)', calories_base: 31, protein_g: 1, carbs_g: 7, fat_g: 0.2 },
    { name: 'Cardo (cocido)', calories_base: 20, protein_g: 0.8, carbs_g: 4, fat_g: 0.1 },
    { name: 'Alcachofas (cocidas)', calories_base: 47, protein_g: 3, carbs_g: 11, fat_g: 0.2 },
    { name: 'Alcachofas (a la plancha)', calories_base: 55, protein_g: 3, carbs_g: 11, fat_g: 1 },
    { name: 'Setas (salteadas)', calories_base: 35, protein_g: 3, carbs_g: 4, fat_g: 1.5 },
    { name: 'Champiñones (a la plancha)', calories_base: 25, protein_g: 3, carbs_g: 3, fat_g: 0.5 },
    { name: 'Champiñones (salteados)', calories_base: 40, protein_g: 3, carbs_g: 3, fat_g: 2 },
    
    // ========================================
    // LEGUMBRES - VARIEDADES ESPAÑOLAS
    // ========================================
    { name: 'Lentejas (cocidas)', calories_base: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4 },
    { name: 'Lenteja pardina (cocida)', calories_base: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4 },
    { name: 'Lentejas (en conserva)', calories_base: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4 },
    { name: 'Garbanzos (cocidos)', calories_base: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6 },
    { name: 'Garbanzo de Fuentesaúco (cocido)', calories_base: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6 },
    { name: 'Garbanzos (en conserva)', calories_base: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6 },
    { name: 'Judías blancas (cocidas)', calories_base: 127, protein_g: 9, carbs_g: 23, fat_g: 0.5 },
    { name: 'Judión de la Granja (cocido)', calories_base: 127, protein_g: 9, carbs_g: 23, fat_g: 0.5 },
    { name: 'Judías blancas (en conserva)', calories_base: 127, protein_g: 9, carbs_g: 23, fat_g: 0.5 },
    { name: 'Judías negras (cocidas)', calories_base: 132, protein_g: 8.9, carbs_g: 24, fat_g: 0.5 },
    { name: 'Judías pintas (cocidas)', calories_base: 143, protein_g: 9, carbs_g: 26, fat_g: 0.6 },
    { name: 'Alubias rojas (cocidas)', calories_base: 127, protein_g: 9, carbs_g: 23, fat_g: 0.5 },
    { name: 'Alubias pintas (cocidas)', calories_base: 143, protein_g: 9, carbs_g: 26, fat_g: 0.6 },
    { name: 'Habas (cocidas)', calories_base: 62, protein_g: 5, carbs_g: 12, fat_g: 0.2 },
    { name: 'Guisantes (cocidos)', calories_base: 81, protein_g: 5.4, carbs_g: 14, fat_g: 0.4 },
    { name: 'Guisantes (en conserva)', calories_base: 77, protein_g: 5.2, carbs_g: 14, fat_g: 0.4 },
    
    // ========================================
    // QUESOS ESPAÑOLES
    // ========================================
    { name: 'Queso Manchego (curado)', calories_base: 364, protein_g: 27, carbs_g: 1.5, fat_g: 28 },
    { name: 'Queso Manchego (semicurado)', calories_base: 340, protein_g: 26, carbs_g: 1.5, fat_g: 26 },
    { name: 'Queso Manchego (fresco)', calories_base: 300, protein_g: 22, carbs_g: 2, fat_g: 22 },
    { name: 'Queso Cabrales', calories_base: 380, protein_g: 21, carbs_g: 1, fat_g: 31 },
    { name: 'Queso Idiazábal', calories_base: 390, protein_g: 28, carbs_g: 1, fat_g: 30 },
    { name: 'Queso Mahón', calories_base: 350, protein_g: 25, carbs_g: 1, fat_g: 27 },
    { name: 'Queso Tetilla', calories_base: 320, protein_g: 23, carbs_g: 1, fat_g: 24 },
    { name: 'Queso Roncal', calories_base: 370, protein_g: 27, carbs_g: 1, fat_g: 29 },
    { name: 'Queso Zamorano', calories_base: 365, protein_g: 27, carbs_g: 1.5, fat_g: 28 },
    { name: 'Queso de Burgos', calories_base: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },
    { name: 'Queso de cabra (fresco)', calories_base: 280, protein_g: 20, carbs_g: 2, fat_g: 20 },
    { name: 'Queso de cabra (curado)', calories_base: 360, protein_g: 25, carbs_g: 1, fat_g: 28 },
    { name: 'Queso de oveja (fresco)', calories_base: 290, protein_g: 21, carbs_g: 2, fat_g: 21 },
    { name: 'Queso de oveja (curado)', calories_base: 370, protein_g: 27, carbs_g: 1, fat_g: 29 },
    { name: 'Queso de bola', calories_base: 360, protein_g: 26, carbs_g: 1, fat_g: 28 },
    { name: 'Queso tierno', calories_base: 300, protein_g: 22, carbs_g: 2, fat_g: 22 },
    { name: 'Queso semicurado', calories_base: 340, protein_g: 26, carbs_g: 1.5, fat_g: 26 },
    { name: 'Queso curado', calories_base: 364, protein_g: 27, carbs_g: 1.5, fat_g: 28 },
    { name: 'Queso para untar', calories_base: 250, protein_g: 15, carbs_g: 3, fat_g: 20 },
    { name: 'Queso crema', calories_base: 280, protein_g: 7, carbs_g: 3, fat_g: 25 },
    { name: 'Queso mozzarella', calories_base: 300, protein_g: 22, carbs_g: 2.2, fat_g: 22 },
    { name: 'Queso emmental', calories_base: 380, protein_g: 29, carbs_g: 1.5, fat_g: 28 },
    { name: 'Queso gouda', calories_base: 356, protein_g: 25, carbs_g: 2, fat_g: 27 },
    { name: 'Queso cheddar', calories_base: 402, protein_g: 25, carbs_g: 1.3, fat_g: 33 },
    { name: 'Queso parmesano', calories_base: 431, protein_g: 38, carbs_g: 4.1, fat_g: 29 },
    { name: 'Queso feta', calories_base: 264, protein_g: 14, carbs_g: 4, fat_g: 21 },
    { name: 'Queso ricotta', calories_base: 174, protein_g: 11, carbs_g: 3, fat_g: 13 },
    { name: 'Queso cottage', calories_base: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },
    { name: 'Requesón', calories_base: 98, protein_g: 11, carbs_g: 3.4, fat_g: 4.3 },
    
    // ========================================
    // PANES Y CEREALES ESPAÑOLES
    // ========================================
    { name: 'Barra de pan', calories_base: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2 },
    { name: 'Barra de pan integral', calories_base: 247, protein_g: 13, carbs_g: 41, fat_g: 4.2 },
    { name: 'Chapata', calories_base: 270, protein_g: 9, carbs_g: 50, fat_g: 3.5 },
    { name: 'Pan de pueblo', calories_base: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2 },
    { name: 'Pan de molde', calories_base: 265, protein_g: 9, carbs_g: 49, fat_g: 3.2 },
    { name: 'Pan de molde integral', calories_base: 240, protein_g: 13, carbs_g: 41, fat_g: 4 },
    { name: 'Pan de centeno', calories_base: 250, protein_g: 9, carbs_g: 48, fat_g: 3.3 },
    { name: 'Pan de avena', calories_base: 260, protein_g: 10, carbs_g: 48, fat_g: 3.5 },
    { name: 'Pan de semillas', calories_base: 280, protein_g: 12, carbs_g: 45, fat_g: 5 },
    { name: 'Pan tostado', calories_base: 280, protein_g: 9, carbs_g: 52, fat_g: 3.5 },
    { name: 'Pan tostado integral', calories_base: 260, protein_g: 13, carbs_g: 44, fat_g: 4.5 },
    { name: 'Arroz bomba (cocido)', calories_base: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
    { name: 'Arroz calasparra (cocido)', calories_base: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
    { name: 'Arroz blanco (cocido)', calories_base: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.3 },
    { name: 'Arroz integral (cocido)', calories_base: 111, protein_g: 2.6, carbs_g: 23, fat_g: 0.9 },
    { name: 'Avena (cocida)', calories_base: 68, protein_g: 2.4, carbs_g: 12, fat_g: 1.4 },
    { name: 'Avena (copos secos)', calories_base: 389, protein_g: 17, carbs_g: 66, fat_g: 7 },
    { name: 'Trigo (cocido)', calories_base: 130, protein_g: 5, carbs_g: 28, fat_g: 1 },
    { name: 'Couscous (cocido)', calories_base: 112, protein_g: 4, carbs_g: 23, fat_g: 0.2 },
    { name: 'Bulgur (cocido)', calories_base: 83, protein_g: 3, carbs_g: 19, fat_g: 0.2 },
    
    // ========================================
    // ACEITES Y GRASAS
    // ========================================
    { name: 'Aceite de oliva virgen extra', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Aceite de oliva', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Aceite de girasol', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Aceite de oliva suave', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Aceite de oliva intenso', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Mantequilla', calories_base: 717, protein_g: 0.9, carbs_g: 0.1, fat_g: 81 },
    { name: 'Margarina', calories_base: 717, protein_g: 0.2, carbs_g: 0.2, fat_g: 81 },
    { name: 'Manteca de cerdo', calories_base: 902, protein_g: 0, carbs_g: 0, fat_g: 100 },
    
    // ========================================
    // FRUTAS ESPAÑOLAS
    // ========================================
    { name: 'Manzana', calories_base: 52, protein_g: 0.3, carbs_g: 14, fat_g: 0.2 },
    { name: 'Plátano', calories_base: 89, protein_g: 1.1, carbs_g: 23, fat_g: 0.3 },
    { name: 'Naranja', calories_base: 47, protein_g: 0.9, carbs_g: 12, fat_g: 0.1 },
    { name: 'Mandarina', calories_base: 53, protein_g: 0.8, carbs_g: 13, fat_g: 0.3 },
    { name: 'Fresa', calories_base: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3 },
    { name: 'Arándanos', calories_base: 57, protein_g: 0.7, carbs_g: 14, fat_g: 0.3 },
    { name: 'Frambuesas', calories_base: 52, protein_g: 1.2, carbs_g: 12, fat_g: 0.7 },
    { name: 'Moras', calories_base: 43, protein_g: 1.4, carbs_g: 10, fat_g: 0.5 },
    { name: 'Uvas', calories_base: 69, protein_g: 0.7, carbs_g: 18, fat_g: 0.2 },
    { name: 'Pera', calories_base: 57, protein_g: 0.4, carbs_g: 15, fat_g: 0.1 },
    { name: 'Melocotón', calories_base: 39, protein_g: 0.9, carbs_g: 10, fat_g: 0.3 },
    { name: 'Albaricoque', calories_base: 48, protein_g: 1.4, carbs_g: 11, fat_g: 0.4 },
    { name: 'Ciruela', calories_base: 46, protein_g: 0.7, carbs_g: 11, fat_g: 0.3 },
    { name: 'Cereza', calories_base: 63, protein_g: 1, carbs_g: 16, fat_g: 0.2 },
    { name: 'Kiwi', calories_base: 61, protein_g: 1.1, carbs_g: 15, fat_g: 0.5 },
    { name: 'Piña', calories_base: 50, protein_g: 0.5, carbs_g: 13, fat_g: 0.1 },
    { name: 'Mango', calories_base: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4 },
    { name: 'Papaya', calories_base: 43, protein_g: 0.5, carbs_g: 11, fat_g: 0.3 },
    { name: 'Melón', calories_base: 34, protein_g: 0.8, carbs_g: 8, fat_g: 0.2 },
    { name: 'Sandía', calories_base: 30, protein_g: 0.6, carbs_g: 8, fat_g: 0.2 },
    { name: 'Limon', calories_base: 29, protein_g: 1.1, carbs_g: 9, fat_g: 0.3 },
    { name: 'Lima', calories_base: 30, protein_g: 0.7, carbs_g: 11, fat_g: 0.2 },
    { name: 'Pomelo', calories_base: 42, protein_g: 0.8, carbs_g: 11, fat_g: 0.1 },
    { name: 'Granada', calories_base: 83, protein_g: 1.7, carbs_g: 19, fat_g: 1.2 },
    { name: 'Higos', calories_base: 74, protein_g: 0.8, carbs_g: 19, fat_g: 0.3 },
    { name: 'Dátiles', calories_base: 282, protein_g: 2.5, carbs_g: 75, fat_g: 0.4 },
    { name: 'Aguacate', calories_base: 160, protein_g: 2, carbs_g: 9, fat_g: 15 },
    { name: 'Aceitunas verdes', calories_base: 145, protein_g: 1, carbs_g: 6, fat_g: 15 },
    { name: 'Aceitunas negras', calories_base: 116, protein_g: 0.8, carbs_g: 6, fat_g: 11 },
    { name: 'Aceitunas rellenas', calories_base: 150, protein_g: 1.2, carbs_g: 7, fat_g: 15 },
    
    // ========================================
    // FRUTOS SECOS Y SEMILLAS
    // ========================================
    { name: 'Almendras', calories_base: 579, protein_g: 21, carbs_g: 22, fat_g: 50 },
    { name: 'Nueces', calories_base: 654, protein_g: 15, carbs_g: 14, fat_g: 65 },
    { name: 'Avellanas', calories_base: 628, protein_g: 15, carbs_g: 17, fat_g: 61 },
    { name: 'Cacahuetes', calories_base: 567, protein_g: 26, carbs_g: 16, fat_g: 49 },
    { name: 'Pistachos', calories_base: 560, protein_g: 20, carbs_g: 28, fat_g: 45 },
    { name: 'Anacardos', calories_base: 553, protein_g: 18, carbs_g: 30, fat_g: 44 },
    { name: 'Piñones', calories_base: 673, protein_g: 14, carbs_g: 14, fat_g: 68 },
    { name: 'Semillas de chía', calories_base: 486, protein_g: 17, carbs_g: 42, fat_g: 31 },
    { name: 'Semillas de lino', calories_base: 534, protein_g: 18, carbs_g: 29, fat_g: 42 },
    { name: 'Semillas de girasol', calories_base: 584, protein_g: 21, carbs_g: 20, fat_g: 51 },
    { name: 'Semillas de calabaza', calories_base: 559, protein_g: 30, carbs_g: 11, fat_g: 49 },
    { name: 'Semillas de sésamo', calories_base: 573, protein_g: 18, carbs_g: 23, fat_g: 50 },
    { name: 'Pasas', calories_base: 299, protein_g: 3.1, carbs_g: 79, fat_g: 0.5 },
    { name: 'Orejones (albaricoques secos)', calories_base: 241, protein_g: 3.4, carbs_g: 63, fat_g: 0.5 },
    { name: 'Higos secos', calories_base: 249, protein_g: 3.3, carbs_g: 64, fat_g: 0.9 },
    { name: 'Ciruelas pasas', calories_base: 240, protein_g: 2.2, carbs_g: 64, fat_g: 0.4 },
    
    // ========================================
    // POSTRES Y DULCES ESPAÑOLES
    // ========================================
    { name: 'Flan', calories_base: 120, protein_g: 4, carbs_g: 20, fat_g: 3 },
    { name: 'Natillas', calories_base: 110, protein_g: 3.5, carbs_g: 18, fat_g: 3 },
    { name: 'Arroz con leche', calories_base: 120, protein_g: 3, carbs_g: 20, fat_g: 3 },
    { name: 'Torrijas', calories_base: 280, protein_g: 6, carbs_g: 35, fat_g: 12 },
    { name: 'Churros', calories_base: 350, protein_g: 4, carbs_g: 45, fat_g: 16 },
    { name: 'Buñuelos', calories_base: 320, protein_g: 5, carbs_g: 40, fat_g: 14 },
    { name: 'Polvorones', calories_base: 520, protein_g: 6, carbs_g: 55, fat_g: 28 },
    { name: 'Mantecados', calories_base: 520, protein_g: 6, carbs_g: 55, fat_g: 28 },
    { name: 'Turrón (blando)', calories_base: 520, protein_g: 10, carbs_g: 55, fat_g: 28 },
    { name: 'Turrón (duro)', calories_base: 530, protein_g: 12, carbs_g: 52, fat_g: 30 },
    { name: 'Mazapán', calories_base: 480, protein_g: 8, carbs_g: 60, fat_g: 22 },
    { name: 'Tarta de Santiago', calories_base: 450, protein_g: 12, carbs_g: 45, fat_g: 25 },
    { name: 'Tarta de queso', calories_base: 320, protein_g: 8, carbs_g: 30, fat_g: 18 },
    { name: 'Crema catalana', calories_base: 180, protein_g: 4, carbs_g: 25, fat_g: 7 },
    { name: 'Leche frita', calories_base: 250, protein_g: 5, carbs_g: 30, fat_g: 11 },
    { name: 'Tarta de manzana', calories_base: 250, protein_g: 3, carbs_g: 35, fat_g: 10 },
    { name: 'Tarta de chocolate', calories_base: 380, protein_g: 6, carbs_g: 45, fat_g: 18 },
    { name: 'Magdalenas', calories_base: 420, protein_g: 6, carbs_g: 50, fat_g: 20 },
    { name: 'Croissant', calories_base: 400, protein_g: 8, carbs_g: 45, fat_g: 20 },
    { name: 'Napolitana de chocolate', calories_base: 380, protein_g: 6, carbs_g: 42, fat_g: 20 },
    { name: 'Donuts', calories_base: 420, protein_g: 5, carbs_g: 50, fat_g: 22 },
    { name: 'Galletas María', calories_base: 450, protein_g: 7, carbs_g: 70, fat_g: 15 },
    { name: 'Galletas digestivas', calories_base: 470, protein_g: 7, carbs_g: 68, fat_g: 18 },
    { name: 'Galletas de chocolate', calories_base: 500, protein_g: 6, carbs_g: 65, fat_g: 24 },
    { name: 'Magdalenas caseras', calories_base: 420, protein_g: 6, carbs_g: 50, fat_g: 20 },
    { name: 'Rosquillas', calories_base: 380, protein_g: 6, carbs_g: 48, fat_g: 18 },
    { name: 'Ensaimada', calories_base: 350, protein_g: 7, carbs_g: 45, fat_g: 16 },
    { name: 'Sobao pasiego', calories_base: 420, protein_g: 6, carbs_g: 50, fat_g: 20 },
    { name: 'Tarta de queso (vasca)', calories_base: 320, protein_g: 8, carbs_g: 30, fat_g: 18 },
    
    // ========================================
    // CONSERVAS Y ENLATADOS ESPAÑOLES
    // ========================================
    { name: 'Atún en conserva (aceite)', calories_base: 198, protein_g: 26, carbs_g: 0, fat_g: 8 },
    { name: 'Atún en conserva (agua)', calories_base: 116, protein_g: 26, carbs_g: 0, fat_g: 1 },
    { name: 'Sardinas en conserva (aceite)', calories_base: 250, protein_g: 24, carbs_g: 0, fat_g: 15 },
    { name: 'Sardinas en conserva (tomate)', calories_base: 200, protein_g: 22, carbs_g: 3, fat_g: 10 },
    { name: 'Anchoas en conserva (aceite)', calories_base: 280, protein_g: 25, carbs_g: 0, fat_g: 18 },
    { name: 'Anchoas en salazón', calories_base: 210, protein_g: 28, carbs_g: 0, fat_g: 9 },
    { name: 'Mejillones en conserva (escabeche)', calories_base: 150, protein_g: 11, carbs_g: 5, fat_g: 8 },
    { name: 'Mejillones en conserva (aceite)', calories_base: 200, protein_g: 10, carbs_g: 4, fat_g: 14 },
    { name: 'Almejas en conserva', calories_base: 120, protein_g: 10, carbs_g: 3, fat_g: 4 },
    { name: 'Berberechos en conserva', calories_base: 100, protein_g: 13, carbs_g: 2, fat_g: 2 },
    { name: 'Pimientos del piquillo (conserva)', calories_base: 35, protein_g: 1, carbs_g: 7, fat_g: 0.3 },
    { name: 'Tomate frito (conserva)', calories_base: 80, protein_g: 1.5, carbs_g: 12, fat_g: 2.5 },
    { name: 'Tomate natural (conserva)', calories_base: 20, protein_g: 1, carbs_g: 4, fat_g: 0.2 },
    { name: 'Espárragos en conserva', calories_base: 22, protein_g: 2.4, carbs_g: 4, fat_g: 0.1 },
    { name: 'Aceitunas en conserva (verdes)', calories_base: 145, protein_g: 1, carbs_g: 6, fat_g: 15 },
    { name: 'Aceitunas en conserva (negras)', calories_base: 116, protein_g: 0.8, carbs_g: 6, fat_g: 11 },
    { name: 'Lentejas en conserva', calories_base: 116, protein_g: 9, carbs_g: 20, fat_g: 0.4 },
    { name: 'Garbanzos en conserva', calories_base: 164, protein_g: 8.9, carbs_g: 27, fat_g: 2.6 },
    { name: 'Judías blancas en conserva', calories_base: 127, protein_g: 9, carbs_g: 23, fat_g: 0.5 },
    { name: 'Guisantes en conserva', calories_base: 77, protein_g: 5.2, carbs_g: 14, fat_g: 0.4 },
    { name: 'Maíz en conserva', calories_base: 96, protein_g: 3.3, carbs_g: 21, fat_g: 1.2 },
    
    // ========================================
    // LÁCTEOS Y DERIVADOS
    // ========================================
    { name: 'Leche entera', calories_base: 61, protein_g: 3.3, carbs_g: 4.8, fat_g: 3.3 },
    { name: 'Leche semidesnatada', calories_base: 47, protein_g: 3.5, carbs_g: 5, fat_g: 1.5 },
    { name: 'Leche desnatada', calories_base: 34, protein_g: 3.4, carbs_g: 5, fat_g: 0.1 },
    { name: 'Yogur natural', calories_base: 59, protein_g: 10, carbs_g: 4, fat_g: 0.4 },
    { name: 'Yogur griego natural', calories_base: 59, protein_g: 10, carbs_g: 3.6, fat_g: 0.4 },
    { name: 'Yogur griego (cremoso)', calories_base: 130, protein_g: 10, carbs_g: 4, fat_g: 10 },
    { name: 'Yogur de fresa', calories_base: 90, protein_g: 3.5, carbs_g: 14, fat_g: 2.5 },
    { name: 'Yogur de limón', calories_base: 90, protein_g: 3.5, carbs_g: 14, fat_g: 2.5 },
    { name: 'Yogur de vainilla', calories_base: 90, protein_g: 3.5, carbs_g: 14, fat_g: 2.5 },
    { name: 'Leche de almendras', calories_base: 17, protein_g: 0.6, carbs_g: 1.5, fat_g: 1.2 },
    { name: 'Leche de avena', calories_base: 45, protein_g: 1, carbs_g: 7, fat_g: 1.5 },
    { name: 'Leche de soja', calories_base: 33, protein_g: 3, carbs_g: 2, fat_g: 2 },
    { name: 'Nata para cocinar', calories_base: 300, protein_g: 2, carbs_g: 3, fat_g: 30 },
    { name: 'Nata montada', calories_base: 320, protein_g: 2, carbs_g: 3, fat_g: 32 },
    { name: 'Mantequilla', calories_base: 717, protein_g: 0.9, carbs_g: 0.1, fat_g: 81 },
    
    // ========================================
    // HUEVOS Y DERIVADOS
    // ========================================
    { name: 'Huevos (enteros, crudos)', calories_base: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11 },
    { name: 'Huevos (enteros, cocidos)', calories_base: 155, protein_g: 13, carbs_g: 1.1, fat_g: 11 },
    { name: 'Huevos (claras)', calories_base: 52, protein_g: 11, carbs_g: 0.7, fat_g: 0.2 },
    { name: 'Huevos (yemas)', calories_base: 322, protein_g: 16, carbs_g: 1, fat_g: 27 },
    { name: 'Huevos fritos', calories_base: 196, protein_g: 14, carbs_g: 1, fat_g: 15 },
    { name: 'Huevos revueltos', calories_base: 180, protein_g: 13, carbs_g: 1, fat_g: 13 },
    { name: 'Huevos a la plancha', calories_base: 196, protein_g: 14, carbs_g: 1, fat_g: 15 },
    
    // ========================================
    // CONDIMENTOS Y SALSAS ESPAÑOLAS
    // ========================================
    { name: 'Salsa de tomate', calories_base: 80, protein_g: 1.5, carbs_g: 12, fat_g: 2.5 },
    { name: 'Salsa brava', calories_base: 120, protein_g: 1, carbs_g: 8, fat_g: 9 },
    { name: 'Salsa alioli', calories_base: 680, protein_g: 1, carbs_g: 2, fat_g: 72 },
    { name: 'Salsa mayonesa', calories_base: 680, protein_g: 1, carbs_g: 1, fat_g: 72 },
    { name: 'Salsa romesco', calories_base: 350, protein_g: 3, carbs_g: 8, fat_g: 32 },
    { name: 'Salsa verde', calories_base: 120, protein_g: 2, carbs_g: 3, fat_g: 10 },
    { name: 'Mojo picón', calories_base: 200, protein_g: 1, carbs_g: 5, fat_g: 18 },
    { name: 'Mojo verde', calories_base: 180, protein_g: 1, carbs_g: 4, fat_g: 16 },
    { name: 'Vinagre', calories_base: 18, protein_g: 0, carbs_g: 0.9, fat_g: 0 },
    { name: 'Aceite de oliva virgen extra', calories_base: 884, protein_g: 0, carbs_g: 0, fat_g: 100 },
    { name: 'Sal', calories_base: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Pimienta', calories_base: 251, protein_g: 10, carbs_g: 64, fat_g: 3.3 },
    { name: 'Ajo', calories_base: 149, protein_g: 6.4, carbs_g: 33, fat_g: 0.5 },
    { name: 'Perejil', calories_base: 36, protein_g: 3, carbs_g: 6, fat_g: 0.8 },
    { name: 'Cilantro', calories_base: 23, protein_g: 2.1, carbs_g: 4, fat_g: 0.5 },
    { name: 'Azafrán', calories_base: 310, protein_g: 11, carbs_g: 65, fat_g: 5.8 },
    { name: 'Pimentón dulce', calories_base: 282, protein_g: 14, carbs_g: 54, fat_g: 13 },
    { name: 'Pimentón picante', calories_base: 282, protein_g: 14, carbs_g: 54, fat_g: 13 },
    
    // ========================================
    // ENDULZANTES
    // ========================================
    { name: 'Azúcar blanco', calories_base: 387, protein_g: 0, carbs_g: 100, fat_g: 0 },
    { name: 'Azúcar moreno', calories_base: 380, protein_g: 0.1, carbs_g: 98, fat_g: 0 },
    { name: 'Miel', calories_base: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0 },
    { name: 'Miel de romero', calories_base: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0 },
    { name: 'Miel de azahar', calories_base: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0 },
    { name: 'Miel de eucalipto', calories_base: 304, protein_g: 0.3, carbs_g: 82, fat_g: 0 },
    { name: 'Stevia (polvo)', calories_base: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Sirope de ágave', calories_base: 310, protein_g: 0.1, carbs_g: 76, fat_g: 0.5 },
    
    // ========================================
    // BEBIDAS
    // ========================================
    { name: 'Agua', calories_base: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Café solo', calories_base: 2, protein_g: 0.1, carbs_g: 0, fat_g: 0 },
    { name: 'Café con leche', calories_base: 35, protein_g: 1.8, carbs_g: 3, fat_g: 1.5 },
    { name: 'Té', calories_base: 2, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Infusión de manzanilla', calories_base: 2, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Infusión de menta', calories_base: 2, protein_g: 0, carbs_g: 0, fat_g: 0 },
    { name: 'Zumo de naranja natural', calories_base: 45, protein_g: 0.7, carbs_g: 10, fat_g: 0.2 },
    { name: 'Zumo de tomate', calories_base: 18, protein_g: 0.9, carbs_g: 3.9, fat_g: 0.2 },
    { name: 'Batido de fresa', calories_base: 80, protein_g: 2, carbs_g: 15, fat_g: 1.5 },
    { name: 'Batido de chocolate', calories_base: 120, protein_g: 3, carbs_g: 20, fat_g: 3 },
    
    // ========================================
    // SNACKS Y APERITIVOS ESPAÑOLES
    // ========================================
    { name: 'Patatas fritas', calories_base: 540, protein_g: 6, carbs_g: 53, fat_g: 35 },
    { name: 'Patatas fritas (artesanas)', calories_base: 520, protein_g: 6, carbs_g: 50, fat_g: 33 },
    { name: 'Cacahuetes tostados', calories_base: 567, protein_g: 26, carbs_g: 16, fat_g: 49 },
    { name: 'Cacahuetes fritos', calories_base: 600, protein_g: 25, carbs_g: 16, fat_g: 52 },
    { name: 'Aceitunas rellenas de anchoa', calories_base: 160, protein_g: 1.5, carbs_g: 7, fat_g: 15 },
    { name: 'Aceitunas rellenas de pimiento', calories_base: 150, protein_g: 1.2, carbs_g: 7, fat_g: 15 },
    { name: 'Ensaladilla rusa', calories_base: 180, protein_g: 3, carbs_g: 15, fat_g: 12 },
    { name: 'Tortilla de patatas (porción)', calories_base: 180, protein_g: 8, carbs_g: 12, fat_g: 12 },
    { name: 'Croquetas', calories_base: 250, protein_g: 8, carbs_g: 20, fat_g: 15 },
    { name: 'Croquetas de jamón', calories_base: 260, protein_g: 10, carbs_g: 20, fat_g: 15 },
    { name: 'Croquetas de pollo', calories_base: 250, protein_g: 9, carbs_g: 20, fat_g: 14 },
    { name: 'Croquetas de bacalao', calories_base: 240, protein_g: 9, carbs_g: 20, fat_g: 13 },
    { name: 'Empanadillas', calories_base: 280, protein_g: 8, carbs_g: 30, fat_g: 14 },
    { name: 'Empanadillas de atún', calories_base: 270, protein_g: 10, carbs_g: 28, fat_g: 13 },
    { name: 'Empanadillas de carne', calories_base: 290, protein_g: 9, carbs_g: 30, fat_g: 15 },
    { name: 'Banderillas', calories_base: 200, protein_g: 12, carbs_g: 5, fat_g: 14 },
    { name: 'Pinchos morunos', calories_base: 220, protein_g: 20, carbs_g: 2, fat_g: 14 },
    { name: 'Albóndigas', calories_base: 200, protein_g: 15, carbs_g: 8, fat_g: 12 },
    { name: 'Albóndigas en salsa', calories_base: 180, protein_g: 14, carbs_g: 6, fat_g: 10 },
    
    // ========================================
    // PLATOS REGIONALES ESPAÑOLES ADICIONALES
    // ========================================
    { name: 'Pisto manchego', calories_base: 60, protein_g: 2, carbs_g: 8, fat_g: 2 },
    { name: 'Ratatouille', calories_base: 55, protein_g: 1.5, carbs_g: 7, fat_g: 2 },
    { name: 'Escalivada', calories_base: 50, protein_g: 1.5, carbs_g: 8, fat_g: 1.5 },
    { name: 'Samfaina', calories_base: 55, protein_g: 1.5, carbs_g: 7, fat_g: 2 },
    { name: 'Tumbet', calories_base: 120, protein_g: 2, carbs_g: 15, fat_g: 5 },
    { name: 'Marmitako', calories_base: 150, protein_g: 18, carbs_g: 8, fat_g: 5 },
    { name: 'Sopa de pescado (andaluza)', calories_base: 60, protein_g: 6, carbs_g: 4, fat_g: 2 },
    { name: 'Caldereta de langosta', calories_base: 180, protein_g: 20, carbs_g: 5, fat_g: 7 },
    { name: 'Suquet de peix', calories_base: 140, protein_g: 16, carbs_g: 6, fat_g: 5 },
    { name: 'Fideuà', calories_base: 200, protein_g: 12, carbs_g: 25, fat_g: 6 },
    { name: 'Arroz del senyoret', calories_base: 160, protein_g: 12, carbs_g: 20, fat_g: 4 },
    { name: 'Arroz a la cubana', calories_base: 180, protein_g: 6, carbs_g: 25, fat_g: 6 },
    { name: 'Arroz con pollo', calories_base: 170, protein_g: 14, carbs_g: 22, fat_g: 4 },
    { name: 'Arroz con verduras', calories_base: 130, protein_g: 3, carbs_g: 25, fat_g: 2 },
    { name: 'Risotto de setas', calories_base: 150, protein_g: 4, carbs_g: 22, fat_g: 4 },
    { name: 'Pulpo a feira', calories_base: 82, protein_g: 15, carbs_g: 2, fat_g: 1 },
    { name: 'Sepia a la plancha', calories_base: 100, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Sepia con guisantes', calories_base: 110, protein_g: 15, carbs_g: 6, fat_g: 3 },
    { name: 'Calamares rellenos', calories_base: 180, protein_g: 15, carbs_g: 8, fat_g: 10 },
    { name: 'Chipirones en su tinta', calories_base: 120, protein_g: 15, carbs_g: 4, fat_g: 4 },
    { name: 'Rape a la gallega', calories_base: 95, protein_g: 18, carbs_g: 0, fat_g: 2 },
    { name: 'Rape al ajillo', calories_base: 150, protein_g: 18, carbs_g: 1, fat_g: 7 },
    { name: 'Rodaballo a la gallega', calories_base: 105, protein_g: 16, carbs_g: 0, fat_g: 3 },
    { name: 'Besugo al horno', calories_base: 140, protein_g: 20, carbs_g: 0, fat_g: 6 },
    { name: 'Salmón a la naranja', calories_base: 200, protein_g: 20, carbs_g: 5, fat_g: 10 },
    { name: 'Trucha a la navarra', calories_base: 180, protein_g: 22, carbs_g: 1, fat_g: 9 },
    { name: 'Angulas a la bilbaína', calories_base: 85, protein_g: 16, carbs_g: 0, fat_g: 2 },
    { name: 'Txipirones en su tinta', calories_base: 120, protein_g: 15, carbs_g: 4, fat_g: 4 },
    { name: 'Kokotxas de merluza', calories_base: 90, protein_g: 17, carbs_g: 0, fat_g: 2 },
    { name: 'Ventresca de atún', calories_base: 220, protein_g: 28, carbs_g: 0, fat_g: 11 },
    { name: 'Bonito del norte (conserva)', calories_base: 200, protein_g: 25, carbs_g: 0, fat_g: 9 },
    { name: 'Caballa en conserva (aceite)', calories_base: 220, protein_g: 24, carbs_g: 0, fat_g: 12 },
    { name: 'Melva en conserva', calories_base: 190, protein_g: 23, carbs_g: 0, fat_g: 9 },
    { name: 'Cocochas de merluza', calories_base: 90, protein_g: 17, carbs_g: 0, fat_g: 2 },
    { name: 'Rape con patatas', calories_base: 130, protein_g: 16, carbs_g: 12, fat_g: 3 },
    { name: 'Merluza con patatas', calories_base: 120, protein_g: 16, carbs_g: 12, fat_g: 2 },
    { name: 'Bacalao con tomate', calories_base: 150, protein_g: 18, carbs_g: 5, fat_g: 5 },
    { name: 'Bacalao con pimientos', calories_base: 160, protein_g: 18, carbs_g: 6, fat_g: 5 },
    { name: 'Bacalao al horno con patatas', calories_base: 140, protein_g: 17, carbs_g: 12, fat_g: 4 },
    { name: 'Pescado frito (pescaíto frito)', calories_base: 250, protein_g: 18, carbs_g: 10, fat_g: 15 },
    { name: 'Boquerones en vinagre', calories_base: 150, protein_g: 20, carbs_g: 1, fat_g: 6 },
    { name: 'Boquerones fritos', calories_base: 280, protein_g: 18, carbs_g: 8, fat_g: 18 },
    { name: 'Sardinas a la plancha', calories_base: 220, protein_g: 25, carbs_g: 0, fat_g: 12 },
    { name: 'Sardinas en escabeche', calories_base: 250, protein_g: 24, carbs_g: 2, fat_g: 15 },
    { name: 'Anchoas del Cantábrico', calories_base: 210, protein_g: 28, carbs_g: 0, fat_g: 9 },
    { name: 'Anchoas en aceite de oliva', calories_base: 280, protein_g: 25, carbs_g: 0, fat_g: 18 },
    { name: 'Mejillones tigre', calories_base: 95, protein_g: 13, carbs_g: 4, fat_g: 2 },
    { name: 'Ostras', calories_base: 68, protein_g: 9, carbs_g: 4, fat_g: 2 },
    { name: 'Vieiras', calories_base: 88, protein_g: 14, carbs_g: 3, fat_g: 1 },
    { name: 'Vieiras a la gallega', calories_base: 120, protein_g: 14, carbs_g: 4, fat_g: 5 },
    { name: 'Zamburiñas', calories_base: 85, protein_g: 13, carbs_g: 2, fat_g: 1 },
    { name: 'Percebes', calories_base: 70, protein_g: 12, carbs_g: 0, fat_g: 1 },
    { name: 'Nécora', calories_base: 87, protein_g: 19, carbs_g: 0, fat_g: 1 },
    { name: 'Cangrejo de río', calories_base: 82, protein_g: 17, carbs_g: 0, fat_g: 1 },
    { name: 'Carabineros', calories_base: 105, protein_g: 22, carbs_g: 0, fat_g: 1.5 },
    { name: 'Gambas rojas', calories_base: 100, protein_g: 20, carbs_g: 1, fat_g: 1.5 },
    { name: 'Langosta a la plancha', calories_base: 120, protein_g: 22, carbs_g: 0.5, fat_g: 2 },
    { name: 'Bogavante a la plancha', calories_base: 120, protein_g: 20, carbs_g: 0.5, fat_g: 2 },
    { name: 'Centollo cocido', calories_base: 87, protein_g: 19, carbs_g: 0, fat_g: 1 },
    { name: 'Buey de mar', calories_base: 90, protein_g: 18, carbs_g: 0, fat_g: 1.5 },
    { name: 'Cigalas a la plancha', calories_base: 105, protein_g: 20, carbs_g: 0, fat_g: 2 },
    { name: 'Camarones', calories_base: 85, protein_g: 18, carbs_g: 1, fat_g: 1 },
    { name: 'Almejas a la marinera', calories_base: 120, protein_g: 10, carbs_g: 3, fat_g: 4 },
    { name: 'Almejas al vapor', calories_base: 86, protein_g: 10, carbs_g: 2, fat_g: 1 },
    { name: 'Berberechos al vapor', calories_base: 79, protein_g: 13, carbs_g: 2, fat_g: 1 },
    { name: 'Navajas a la plancha', calories_base: 90, protein_g: 14, carbs_g: 1, fat_g: 2 },
    { name: 'Coquinas', calories_base: 75, protein_g: 12, carbs_g: 2, fat_g: 1 },
    { name: 'Coquinas a la marinera', calories_base: 110, protein_g: 12, carbs_g: 3, fat_g: 3 },
    { name: 'Tellinas', calories_base: 78, protein_g: 13, carbs_g: 2, fat_g: 1 },
    { name: 'Tellinas a la plancha', calories_base: 95, protein_g: 13, carbs_g: 2, fat_g: 2 },
    { name: 'Pulpo a la gallega', calories_base: 82, protein_g: 15, carbs_g: 2, fat_g: 1 },
    { name: 'Pulpo a la plancha', calories_base: 100, protein_g: 15, carbs_g: 2, fat_g: 3 },
    { name: 'Calamares a la romana', calories_base: 250, protein_g: 14, carbs_g: 15, fat_g: 14 },
    { name: 'Calamares a la plancha', calories_base: 110, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Calamares en su tinta', calories_base: 120, protein_g: 15, carbs_g: 4, fat_g: 4 },
    { name: 'Chipirones a la plancha', calories_base: 110, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Chipirones rellenos', calories_base: 180, protein_g: 15, carbs_g: 8, fat_g: 10 },
    { name: 'Sepia a la plancha', calories_base: 100, protein_g: 16, carbs_g: 3, fat_g: 3 },
    { name: 'Sepia con guisantes', calories_base: 110, protein_g: 15, carbs_g: 6, fat_g: 3 },
    { name: 'Sepia rellena', calories_base: 170, protein_g: 15, carbs_g: 7, fat_g: 9 },
    { name: 'Rape a la gallega', calories_base: 95, protein_g: 18, carbs_g: 0, fat_g: 2 },
    { name: 'Rape al ajillo', calories_base: 150, protein_g: 18, carbs_g: 1, fat_g: 7 },
    { name: 'Rape con patatas', calories_base: 130, protein_g: 16, carbs_g: 12, fat_g: 3 },
    { name: 'Rodaballo a la gallega', calories_base: 105, protein_g: 16, carbs_g: 0, fat_g: 3 },
    { name: 'Rodaballo al horno', calories_base: 110, protein_g: 16, carbs_g: 0, fat_g: 3.5 },
    { name: 'Besugo al horno', calories_base: 140, protein_g: 20, carbs_g: 0, fat_g: 6 },
    { name: 'Salmón a la naranja', calories_base: 200, protein_g: 20, carbs_g: 5, fat_g: 10 },
    { name: 'Trucha a la navarra', calories_base: 180, protein_g: 22, carbs_g: 1, fat_g: 9 },
    { name: 'Angulas a la bilbaína', calories_base: 85, protein_g: 16, carbs_g: 0, fat_g: 2 },
    { name: 'Kokotxas de merluza', calories_base: 90, protein_g: 17, carbs_g: 0, fat_g: 2 },
    { name: 'Ventresca de atún', calories_base: 220, protein_g: 28, carbs_g: 0, fat_g: 11 },
    { name: 'Bonito del norte (conserva)', calories_base: 200, protein_g: 25, carbs_g: 0, fat_g: 9 },
    { name: 'Caballa en conserva (aceite)', calories_base: 220, protein_g: 24, carbs_g: 0, fat_g: 12 },
    { name: 'Melva en conserva', calories_base: 190, protein_g: 23, carbs_g: 0, fat_g: 9 },
    { name: 'Cocochas de merluza', calories_base: 90, protein_g: 17, carbs_g: 0, fat_g: 2 },
    { name: 'Merluza con patatas', calories_base: 120, protein_g: 16, carbs_g: 12, fat_g: 2 },
    { name: 'Bacalao con tomate', calories_base: 150, protein_g: 18, carbs_g: 5, fat_g: 5 },
    { name: 'Bacalao con pimientos', calories_base: 160, protein_g: 18, carbs_g: 6, fat_g: 5 },
    { name: 'Bacalao al horno con patatas', calories_base: 140, protein_g: 17, carbs_g: 12, fat_g: 4 },
    { name: 'Pescado frito (pescaíto frito)', calories_base: 250, protein_g: 18, carbs_g: 10, fat_g: 15 },
];

async function seedSpanishFoods() {
    console.log('🇪🇸 Iniciando poblamiento de alimentos españoles...\n');
    
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const food of spanishFoods) {
        try {
            // Verificar si ya existe
            const existing = await db.select()
                .from(foods)
                .where(eq(foods.name, food.name))
                .limit(1);

            if (existing.length > 0) {
                // Actualizar si existe pero con valores diferentes
                const existingFood = existing[0];
                const needsUpdate = 
                    parseFloat(existingFood.calories_base) !== food.calories_base ||
                    parseFloat(existingFood.protein_g || 0) !== food.protein_g ||
                    parseFloat(existingFood.carbs_g || 0) !== food.carbs_g ||
                    parseFloat(existingFood.fat_g || 0) !== food.fat_g;

                if (needsUpdate) {
                    await db.update(foods)
                        .set({
                            calories_base: food.calories_base.toFixed(2),
                            protein_g: food.protein_g.toFixed(2),
                            carbs_g: food.carbs_g.toFixed(2),
                            fat_g: food.fat_g.toFixed(2),
                        })
                        .where(eq(foods.food_id, existingFood.food_id));
                    totalUpdated++;
                    if (totalUpdated % 10 === 0) {
                        console.log(`   ✏️  ${totalUpdated} alimentos actualizados...`);
                    }
                } else {
                    totalSkipped++;
                }
            } else {
                // Insertar nuevo
                await db.insert(foods).values({
                    name: food.name,
                    calories_base: food.calories_base.toFixed(2),
                    protein_g: food.protein_g.toFixed(2),
                    carbs_g: food.carbs_g.toFixed(2),
                    fat_g: food.fat_g.toFixed(2),
                });
                totalInserted++;
                if (totalInserted % 10 === 0) {
                    console.log(`   ✅ ${totalInserted} alimentos agregados...`);
                }
            }
        } catch (error) {
            const errorCode = error.code || error.cause?.code;
            if (errorCode === '23505') {
                totalSkipped++;
            } else {
                console.error(`   ❌ Error con ${food.name}:`, error.message);
                totalErrors++;
            }
        }
    }

    console.log('\n✅ Poblamiento completado!');
    console.log(`📊 Resumen:`);
    console.log(`   - Nuevos alimentos: ${totalInserted}`);
    console.log(`   - Alimentos actualizados: ${totalUpdated}`);
    console.log(`   - Alimentos omitidos: ${totalSkipped}`);
    console.log(`   - Errores: ${totalErrors}`);
    console.log(`   - Total procesado: ${totalInserted + totalUpdated + totalSkipped} de ${spanishFoods.length}`);
    console.log(`\n💡 Base de datos de alimentos españoles ampliada con éxito!`);
    
    process.exit(0);
}

seedSpanishFoods().catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});

