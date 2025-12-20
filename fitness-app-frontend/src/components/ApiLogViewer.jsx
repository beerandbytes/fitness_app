import React, { useState, useEffect, useMemo } from 'react';
import { X, Download, Trash2, Filter, Search, Play, Pause, BarChart3 } from 'lucide-react';
import { getLogs, clearLogs, exportLogs, getStatistics, setRecordingEnabled, isRecordingEnabled } from '../utils/apiRecorder';

/**
 * API Log Viewer Component
 * Displays recorded API calls for debugging
 */
const ApiLogViewer = ({ onClose }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [recording, setRecording] = useState(isRecordingEnabled());
  const [filter, setFilter] = useState({
    type: 'all', // all, request, response, error
    method: 'all', // all, GET, POST, PUT, DELETE, etc.
    status: 'all', // all, 2xx, 3xx, 4xx, 5xx
    search: '',
  });
  const [expandedLog, setExpandedLog] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Load logs and statistics
  useEffect(() => {
    loadLogs();
    loadStatistics();
    // Refresh every 2 seconds
    const interval = setInterval(() => {
      loadLogs();
      loadStatistics();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs when filter or logs change
  useEffect(() => {
    let filtered = [...logs];

    if (filter.type !== 'all') {
      filtered = filtered.filter(log => log.type === filter.type);
    }

    if (filter.method !== 'all') {
      filtered = filtered.filter(log => log.method === filter.method);
    }

    if (filter.status !== 'all') {
      const statusCode = parseInt(filter.status);
      filtered = filtered.filter(log => {
        const logStatus = log.status;
        if (!logStatus) return false;
        if (statusCode === 200) return logStatus >= 200 && logStatus < 300;
        if (statusCode === 300) return logStatus >= 300 && logStatus < 400;
        if (statusCode === 400) return logStatus >= 400 && logStatus < 500;
        if (statusCode === 500) return logStatus >= 500;
        return false;
      });
    }

    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.url?.toLowerCase().includes(searchLower) ||
        log.method?.toLowerCase().includes(searchLower) ||
        JSON.stringify(log.data || {}).toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    setFilteredLogs(filtered);
  }, [logs, filter]);

  const loadLogs = () => {
    const allLogs = getLogs();
    setLogs(allLogs);
  };

  const loadStatistics = () => {
    const stats = getStatistics();
    setStatistics(stats);
  };

  const handleClearLogs = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todos los logs?')) {
      clearLogs();
      loadLogs();
      loadStatistics();
    }
  };

  const handleExport = () => {
    exportLogs();
  };

  const handleToggleRecording = () => {
    const newRecording = !recording;
    setRecordingEnabled(newRecording);
    setRecording(newRecording);
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-yellow-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-500';
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'request': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'response': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                API Call Logs
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredLogs.length} de {logs.length} registros
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleRecording}
              className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                recording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {recording ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Reanudar
                </>
              )}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Total</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statistics.totalCalls}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Exitosos</div>
                <div className="text-lg font-semibold text-green-600">
                  {statistics.responses}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Errores</div>
                <div className="text-lg font-semibold text-red-600">
                  {statistics.errors}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Tiempo Promedio</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {statistics.avgDuration}ms
                </div>
              </div>
            </div>
            {statistics.duplicateCalls.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Llamadas duplicadas detectadas:
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statistics.duplicateCalls.map((dup, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs"
                    >
                      {dup.method} {dup.endpoint} ({dup.count}x)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo
              </label>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="request">Request</option>
                <option value="response">Response</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método
              </label>
              <select
                value={filter.method}
                onChange={(e) => setFilter({ ...filter, method: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
              >
                <option value="all">Todos</option>
                <option value="200">2xx (Éxito)</option>
                <option value="300">3xx (Redirección)</option>
                <option value="400">4xx (Cliente)</option>
                <option value="500">5xx (Servidor)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  placeholder="URL, método, datos..."
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No hay logs para mostrar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                          {log.type}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                          {log.method}
                        </span>
                        {log.status && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        )}
                        {log.duration && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                            {log.duration}ms
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-mono text-gray-900 dark:text-white truncate">
                        {log.fullURL || log.url}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="ml-4 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
                    >
                      {expandedLog === log.id ? 'Ocultar' : 'Detalles'}
                    </button>
                  </div>
                  {expandedLog === log.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="space-y-4">
                        {log.data && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Datos:
                            </div>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.headers && (
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Headers:
                            </div>
                            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-40">
                              {JSON.stringify(log.headers, null, 2)}
                            </pre>
                          </div>
                        )}
                        {log.errorMessage && (
                          <div>
                            <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                              Error:
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {log.errorMessage}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiLogViewer;

