let database
async function db() {
  if (!database) database = new Promise((resolve, reject) => {
    // Keep the original storage key so the app rename preserves existing drafts.
    const request = indexedDB.open('inkpost-local', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('workspace')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return database
}

export async function loadWorkspace() {
  const database = await db()
  return new Promise((resolve, reject) => {
    const request = database.transaction('workspace').objectStore('workspace').get('state')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveWorkspace(state) {
  const database = await db()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('workspace', 'readwrite')
    transaction.objectStore('workspace').put(state, 'state')
    transaction.oncomplete = resolve
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error || new Error('本地存储事务中断'))
  })
}
