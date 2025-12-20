/**
 * API Call Recorder Utility
 * Records all API calls for debugging purposes
 * Stores logs in localStorage with automatic cleanup
 */

const STORAGE_KEY = 'api_call_logs';
const MAX_ENTRIES = 1000;
const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'refreshToken', 'userToken'];

/**
 * Sanitize data by removing sensitive information
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Sanitize headers
 */
const sanitizeHeaders = (headers) => {
  if (!headers) return headers;
  const sanitized = { ...headers };
  if (sanitized.Authorization) {
    sanitized.Authorization = '[REDACTED]';
  }
  if (sanitized.authorization) {
    sanitized.authorization = '[REDACTED]';
  }
  return sanitized;
};

/**
 * Get all logs from localStorage
 */
export const getLogs = () => {
  try {
    const logs = localStorage.getItem(STORAGE_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch (error) {
    console.error('Error reading API logs:', error);
    return [];
  }
};

/**
 * Save logs to localStorage
 */
const saveLogs = (logs) => {
  try {
    // Keep only the most recent MAX_ENTRIES
    const trimmedLogs = logs.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('Error saving API logs:', error);
    // If storage is full, try to clear old entries
    if (error.name === 'QuotaExceededError') {
      try {
        const halfLogs = logs.slice(-Math.floor(MAX_ENTRIES / 2));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(halfLogs));
      } catch (e) {
        console.error('Failed to save logs even after cleanup:', e);
      }
    }
  }
};

/**
 * Record an API request
 */
export const recordRequest = (config) => {
  if (!shouldRecord()) return;

  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'request',
    timestamp: new Date().toISOString(),
    method: config.method?.toUpperCase() || 'GET',
    url: config.url || '',
    baseURL: config.baseURL || '',
    fullURL: (config.baseURL || '') + (config.url || ''),
    headers: sanitizeHeaders(config.headers),
    data: sanitizeData(config.data),
    params: sanitizeData(config.params),
  };

  const logs = getLogs();
  logs.push(logEntry);
  saveLogs(logs);
};

/**
 * Record an API response
 */
export const recordResponse = (config, response, duration) => {
  if (!shouldRecord()) return;

  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'response',
    timestamp: new Date().toISOString(),
    method: config.method?.toUpperCase() || 'GET',
    url: config.url || '',
    baseURL: config.baseURL || '',
    fullURL: (config.baseURL || '') + (config.url || ''),
    status: response?.status,
    statusText: response?.statusText,
    headers: sanitizeHeaders(response?.headers),
    data: sanitizeData(response?.data),
    duration: duration, // in milliseconds
  };

  const logs = getLogs();
  logs.push(logEntry);
  saveLogs(logs);
};

/**
 * Record an API error
 */
export const recordError = (config, error, duration) => {
  if (!shouldRecord()) return;

  const logEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'error',
    timestamp: new Date().toISOString(),
    method: config.method?.toUpperCase() || 'GET',
    url: config.url || '',
    baseURL: config.baseURL || '',
    fullURL: (config.baseURL || '') + (config.url || ''),
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    errorMessage: error?.message,
    errorData: sanitizeData(error?.response?.data),
    duration: duration, // in milliseconds
  };

  const logs = getLogs();
  logs.push(logEntry);
  saveLogs(logs);
};

/**
 * Check if recording should be enabled
 */
const shouldRecord = () => {
  // Check localStorage flag first
  const recordingEnabled = localStorage.getItem('api_recording_enabled');
  if (recordingEnabled !== null) {
    return recordingEnabled === 'true';
  }
  // Default: only record in development mode
  return import.meta.env.DEV;
};

/**
 * Enable or disable recording
 */
export const setRecordingEnabled = (enabled) => {
  localStorage.setItem('api_recording_enabled', enabled ? 'true' : 'false');
};

/**
 * Check if recording is enabled
 */
export const isRecordingEnabled = () => {
  return shouldRecord();
};

/**
 * Clear all logs
 */
export const clearLogs = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing API logs:', error);
    return false;
  }
};

/**
 * Export logs as JSON
 */
export const exportLogs = () => {
  const logs = getLogs();
  const dataStr = JSON.stringify(logs, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get statistics from logs
 */
export const getStatistics = () => {
  const logs = getLogs();
  const requests = logs.filter(log => log.type === 'request');
  const responses = logs.filter(log => log.type === 'response');
  const errors = logs.filter(log => log.type === 'error');
  
  const durations = responses
    .map(log => log.duration)
    .filter(d => d !== undefined && d !== null);
  
  const avgDuration = durations.length > 0
    ? durations.reduce((sum, d) => sum + d, 0) / durations.length
    : 0;

  const statusCounts = {};
  responses.forEach(log => {
    const status = log.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  const endpointCounts = {};
  logs.forEach(log => {
    const endpoint = log.url || 'unknown';
    endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + 1;
  });

  // Find duplicate calls (same endpoint within 1 second)
  const duplicateCalls = [];
  const callMap = new Map();
  logs.forEach(log => {
    const key = `${log.method}-${log.url}`;
    const timestamp = new Date(log.timestamp).getTime();
    const existing = callMap.get(key);
    if (existing && timestamp - existing < 1000) {
      duplicateCalls.push({
        endpoint: log.url,
        method: log.method,
        count: (duplicateCalls.find(d => d.endpoint === log.url && d.method === log.method)?.count || 1) + 1,
      });
    }
    callMap.set(key, timestamp);
  });

  return {
    totalCalls: logs.length,
    requests: requests.length,
    responses: responses.length,
    errors: errors.length,
    avgDuration: Math.round(avgDuration),
    statusCounts,
    endpointCounts,
    duplicateCalls: [...new Map(duplicateCalls.map(d => [`${d.method}-${d.endpoint}`, d])).values()],
  };
};

