/**
 * Helpers para testing del backend
 * Utilidades reutilizables para tests
 */

const jwt = require('jsonwebtoken');

/**
 * Crear un token JWT de prueba
 */
const createTestToken = (userId = 1, role = 'CLIENT') => {
  return jwt.sign(
    { id: userId, role, isAdmin: role === 'ADMIN' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

/**
 * Crear headers de autenticación para tests
 */
const createAuthHeaders = (userId = 1, role = 'CLIENT') => {
  const token = createTestToken(userId, role);
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Mock de request con usuario autenticado
 */
const createMockRequest = (userId = 1, role = 'CLIENT', body = {}) => {
  return {
    user: { id: userId, role },
    body,
    params: {},
    query: {},
    headers: createAuthHeaders(userId, role),
  };
};

/**
 * Mock de response
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Mock de next function
 */
const createMockNext = () => {
  return jest.fn();
};

/**
 * Helper para limpiar datos de prueba de la base de datos
 * Limpia en orden correcto respetando las dependencias de foreign keys
 */
const { db } = require('../../db/db_config');
const {
  users,
  dailyLogs,
  foods,
  mealItems,
  exercises,
  routines,
  routineExercises,
  dailyExercises,
  userGoals,
  scheduledRoutines,
  notifications,
  userAchievements,
  inviteTokens,
  routineTemplates,
  dietTemplates,
  clientRoutineAssignments,
  checkIns,
  messages,
  userFollows,
  sharedWorkouts,
  workoutLikes,
  workoutComments,
  bodyMeasurements,
  progressPhotos,
} = require('../../db/schema');
const { eq, and } = require('drizzle-orm');

/**
 * Limpiar todos los datos relacionados con un usuario
 */
const cleanupUserData = async (userId) => {
  if (!userId) return;

  try {
    // Limpiar en orden inverso de dependencias
    
    // 1. Eliminar datos relacionados con rutinas
    const userRoutines = await db.select().from(routines).where(eq(routines.user_id, userId));
    for (const routine of userRoutines) {
      await db.delete(routineExercises).where(eq(routineExercises.routine_id, routine.routine_id));
      await db.delete(scheduledRoutines).where(eq(scheduledRoutines.routine_id, routine.routine_id));
      await db.delete(sharedWorkouts).where(eq(sharedWorkouts.routine_id, routine.routine_id));
    }
    await db.delete(routines).where(eq(routines.user_id, userId));
    
    // 2. Eliminar datos relacionados con logs diarios
    const userLogs = await db.select().from(dailyLogs).where(eq(dailyLogs.user_id, userId));
    for (const log of userLogs) {
      await db.delete(mealItems).where(eq(mealItems.log_id, log.log_id));
      await db.delete(dailyExercises).where(eq(dailyExercises.log_id, log.log_id));
    }
    await db.delete(dailyLogs).where(eq(dailyLogs.user_id, userId));
    
    // 3. Eliminar otros datos relacionados
    await db.delete(userGoals).where(eq(userGoals.user_id, userId));
    await db.delete(notifications).where(eq(notifications.user_id, userId));
    await db.delete(userAchievements).where(eq(userAchievements.user_id, userId));
    await db.delete(inviteTokens).where(eq(inviteTokens.coach_id, userId));
    await db.delete(routineTemplates).where(eq(routineTemplates.coach_id, userId));
    await db.delete(dietTemplates).where(eq(dietTemplates.coach_id, userId));
    await db.delete(clientRoutineAssignments).where(eq(clientRoutineAssignments.client_id, userId));
    await db.delete(checkIns).where(eq(checkIns.client_id, userId));
    await db.delete(messages).where(eq(messages.sender_id, userId));
    await db.delete(messages).where(eq(messages.receiver_id, userId));
    await db.delete(userFollows).where(eq(userFollows.follower_id, userId));
    await db.delete(userFollows).where(eq(userFollows.following_id, userId));
    await db.delete(bodyMeasurements).where(eq(bodyMeasurements.user_id, userId));
    await db.delete(progressPhotos).where(eq(progressPhotos.user_id, userId));
    
    // 4. Eliminar likes y comentarios de workouts compartidos
    const sharedWorkoutsList = await db.select().from(sharedWorkouts).where(eq(sharedWorkouts.user_id, userId));
    for (const shared of sharedWorkoutsList) {
      await db.delete(workoutLikes).where(eq(workoutLikes.share_id, shared.share_id));
      await db.delete(workoutComments).where(eq(workoutComments.share_id, shared.share_id));
    }
    
    // 5. Finalmente eliminar el usuario
    await db.delete(users).where(eq(users.user_id, userId));
  } catch (error) {
    console.error(`Error limpiando datos del usuario ${userId}:`, error);
    throw error;
  }
};

/**
 * Limpiar usuario por email (útil para limpiar antes de crear)
 */
const cleanupUserByEmail = async (email) => {
  try {
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    for (const user of existingUsers) {
      await cleanupUserData(user.user_id);
    }
  } catch (error) {
    console.error(`Error limpiando usuario por email ${email}:`, error);
    throw error;
  }
};

/**
 * Limpiar ejercicio por nombre
 */
const cleanupExerciseByName = async (name) => {
  try {
    await db.delete(exercises).where(eq(exercises.name, name));
  } catch (error) {
    console.error(`Error limpiando ejercicio ${name}:`, error);
    throw error;
  }
};

/**
 * Limpiar alimento por nombre
 */
const cleanupFoodByName = async (name) => {
  try {
    await db.delete(foods).where(eq(foods.name, name));
  } catch (error) {
    console.error(`Error limpiando alimento ${name}:`, error);
    throw error;
  }
};

/**
 * Limpiar múltiples alimentos por nombres
 */
const cleanupFoodsByNames = async (names) => {
  try {
    for (const name of names) {
      await cleanupFoodByName(name);
    }
  } catch (error) {
    console.error(`Error limpiando alimentos:`, error);
    throw error;
  }
};

/**
 * Limpiar rutina y todos sus datos relacionados
 */
const cleanupRoutineData = async (routineId) => {
  if (!routineId) return;
  
  try {
    await db.delete(routineExercises).where(eq(routineExercises.routine_id, routineId));
    await db.delete(scheduledRoutines).where(eq(scheduledRoutines.routine_id, routineId));
    await db.delete(routines).where(eq(routines.routine_id, routineId));
  } catch (error) {
    console.error(`Error limpiando rutina ${routineId}:`, error);
    throw error;
  }
};

module.exports = {
  createTestToken,
  createAuthHeaders,
  createMockRequest,
  createMockResponse,
  createMockNext,
  cleanupUserData,
  cleanupUserByEmail,
  cleanupExerciseByName,
  cleanupFoodByName,
  cleanupFoodsByNames,
  cleanupRoutineData,
};

