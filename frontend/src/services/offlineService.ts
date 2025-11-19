// IndexedDB service for offline data storage and synchronization

const DB_NAME = 'RealtimePM'
const DB_VERSION = 1

// Object stores
const STORES = {
  BOARDS: 'boards',
  CARDS: 'cards',
  SPRINTS: 'sprints',
  SYNC_QUEUE: 'syncQueue',
  PROJECTS: 'projects',
}

class OfflineService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.BOARDS)) {
          const boardStore = db.createObjectStore(STORES.BOARDS, { keyPath: '_id' })
          boardStore.createIndex('projectId', 'projectId', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.CARDS)) {
          const cardStore = db.createObjectStore(STORES.CARDS, { keyPath: '_id' })
          cardStore.createIndex('boardId', 'boardId', { unique: false })
          cardStore.createIndex('projectId', 'projectId', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.SPRINTS)) {
          const sprintStore = db.createObjectStore(STORES.SPRINTS, { keyPath: '_id' })
          sprintStore.createIndex('projectId', 'projectId', { unique: false })
        }

        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          db.createObjectStore(STORES.PROJECTS, { keyPath: '_id' })
        }

        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  // Generic CRUD operations
  async add(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async put(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName: string, key: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Sync queue operations
  async addToSyncQueue(request: {
    url: string
    method: string
    headers: Record<string, string>
    body?: any
  }): Promise<void> {
    const queueItem = {
      ...request,
      timestamp: Date.now(),
      retries: 0,
    }

    await this.add(STORES.SYNC_QUEUE, queueItem)
  }

  async getSyncQueue(): Promise<any[]> {
    return this.getAll(STORES.SYNC_QUEUE)
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite')
      const store = transaction.objectStore(STORES.SYNC_QUEUE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Board operations
  async saveBoard(board: any): Promise<void> {
    await this.put(STORES.BOARDS, { ...board, _synced: true, _updatedAt: Date.now() })
  }

  async getBoard(boardId: string): Promise<any> {
    return this.get(STORES.BOARDS, boardId)
  }

  async getAllBoards(): Promise<any[]> {
    return this.getAll(STORES.BOARDS)
  }

  // Card operations
  async saveCard(card: any): Promise<void> {
    await this.put(STORES.CARDS, { ...card, _synced: true, _updatedAt: Date.now() })
  }

  async getCard(cardId: string): Promise<any> {
    return this.get(STORES.CARDS, cardId)
  }

  async getCardsByBoard(boardId: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CARDS], 'readonly')
      const store = transaction.objectStore(STORES.CARDS)
      const index = store.index('boardId')
      const request = index.getAll(boardId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Sprint operations
  async saveSprint(sprint: any): Promise<void> {
    await this.put(STORES.SPRINTS, { ...sprint, _synced: true, _updatedAt: Date.now() })
  }

  async getSprint(sprintId: string): Promise<any> {
    return this.get(STORES.SPRINTS, sprintId)
  }

  async getSprintsByProject(projectId: string): Promise<any[]> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SPRINTS], 'readonly')
      const store = transaction.objectStore(STORES.SPRINTS)
      const index = store.index('projectId')
      const request = index.getAll(projectId)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // Project operations
  async saveProject(project: any): Promise<void> {
    await this.put(STORES.PROJECTS, { ...project, _synced: true, _updatedAt: Date.now() })
  }

  async getProject(projectId: string): Promise<any> {
    return this.get(STORES.PROJECTS, projectId)
  }

  async getAllProjects(): Promise<any[]> {
    return this.getAll(STORES.PROJECTS)
  }

  // Check if data exists offline
  async hasOfflineData(): Promise<boolean> {
    const boards = await this.getAllBoards()
    const cards = await this.getAll(STORES.CARDS)
    const sprints = await this.getAll(STORES.SPRINTS)

    return boards.length > 0 || cards.length > 0 || sprints.length > 0
  }

  // Sync status
  async getUnsyncedItems(): Promise<{
    boards: any[]
    cards: any[]
    sprints: any[]
  }> {
    const boards = (await this.getAllBoards()).filter((b) => !b._synced)
    const cards = (await this.getAll(STORES.CARDS)).filter((c) => !c._synced)
    const sprints = (await this.getAll(STORES.SPRINTS)).filter((s) => !s._synced)

    return { boards, cards, sprints }
  }
}

// Singleton instance
export const offlineService = new OfflineService()

// Service Worker registration
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('ServiceWorker registered:', registration)

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)

      return registration
    } catch (error) {
      console.error('ServiceWorker registration failed:', error)
      return null
    }
  }

  return null
}

// Handle messages from service worker
function handleServiceWorkerMessage(event: MessageEvent) {
  const { type, data } = event.data

  switch (type) {
    case 'QUEUE_SYNC':
      offlineService.addToSyncQueue(data)
      break

    case 'PROCESS_SYNC_QUEUE':
      processSyncQueue()
      break
  }
}

// Process sync queue when online
export async function processSyncQueue() {
  const queue = await offlineService.getSyncQueue()

  for (const item of queue) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body ? JSON.stringify(JSON.parse(item.body)) : undefined,
      })

      if (response.ok) {
        // Remove from queue if successful
        await offlineService.removeSyncQueueItem(item.id)
      }
    } catch (error) {
      console.error('Failed to sync item:', error)
      // Will retry on next sync
    }
  }
}

// Check online status
export function isOnline(): boolean {
  return navigator.onLine
}

// Listen for online/offline events
export function setupOnlineListeners() {
  window.addEventListener('online', () => {
    console.log('App is online')
    processSyncQueue()
  })

  window.addEventListener('offline', () => {
    console.log('App is offline')
  })
}
