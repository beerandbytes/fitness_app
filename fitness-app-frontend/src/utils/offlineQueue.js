/**
 * Offline Queue Utility
 * Manages API requests when offline and syncs them when back online
 */

const QUEUE_KEY = 'offline-queue';
const MAX_QUEUE_SIZE = 100;

class OfflineQueue {
  constructor() {
    this.queue = this.loadQueue();
    this.syncListeners = [];
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading offline queue:', error);
      return [];
    }
  }

  /**
   * Save queue to localStorage
   */
  saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }

  /**
   * Add request to queue
   */
  addRequest(request) {
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest request
      this.queue.shift();
    }

    const queueItem = {
      id: Date.now() + Math.random(),
      timestamp: Date.now(),
      ...request,
    };

    this.queue.push(queueItem);
    this.saveQueue();
    return queueItem.id;
  }

  /**
   * Remove request from queue
   */
  removeRequest(id) {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.saveQueue();
  }

  /**
   * Get all queued requests
   */
  getQueue() {
    return [...this.queue];
  }

  /**
   * Clear the queue
   */
  clear() {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Process queue when online
   */
  async processQueue(api) {
    if (!navigator.onLine || this.queue.length === 0) {
      return;
    }

    const requests = [...this.queue];
    const results = [];

    for (const request of requests) {
      try {
        let response;
        switch (request.method) {
          case 'POST':
            response = await api.post(request.url, request.data, request.config);
            break;
          case 'PUT':
            response = await api.put(request.url, request.data, request.config);
            break;
          case 'PATCH':
            response = await api.patch(request.url, request.data, request.config);
            break;
          case 'DELETE':
            response = await api.delete(request.url, request.config);
            break;
          default:
            console.warn(`Unsupported method: ${request.method}`);
            continue;
        }

        // Remove successful request from queue
        this.removeRequest(request.id);
        results.push({ success: true, request, response });
      } catch (error) {
        // Keep failed requests in queue for retry
        results.push({ success: false, request, error });
        console.error('Failed to process queued request:', error);
      }
    }

    // Notify listeners
    this.notifySyncListeners(results);

    return results;
  }

  /**
   * Setup listener for online event
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      // Process queue when back online
      // Note: api instance should be passed when calling processQueue
      console.log('Back online. Queue will be processed on next API call.');
    });
  }

  /**
   * Add sync listener
   */
  onSync(callback) {
    this.syncListeners.push(callback);
  }

  /**
   * Remove sync listener
   */
  offSync(callback) {
    this.syncListeners = this.syncListeners.filter((cb) => cb !== callback);
  }

  /**
   * Notify sync listeners
   */
  notifySyncListeners(results) {
    this.syncListeners.forEach((callback) => {
      try {
        callback(results);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();

// Export class for testing
export default OfflineQueue;

