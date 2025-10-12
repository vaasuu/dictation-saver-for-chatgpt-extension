import { RecordingMetadata, RecordingData, Message, MessageResponse } from './types';

let db: IDBDatabase | null = null;
const DB_NAME = "ChatGPTDictationDB";
const DB_VERSION = 1;
const RECORDINGS_STORE = "recordings";
const METADATA_STORE = "metadata";
const MAX_RECORDINGS = 3;

/**
 * Opens IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Failed to open IndexedDB:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log("IndexedDB opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create recordings store for audio blobs
      if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
        const recordingsStore = db.createObjectStore(RECORDINGS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        recordingsStore.createIndex("timestamp", "timestamp", {
          unique: false,
        });
      }

      // Create metadata store for recording info
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const metadataStore = db.createObjectStore(METADATA_STORE, {
          keyPath: "id",
        });
        metadataStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
}

/**
 * Loads recordings metadata from IndexedDB
 */
async function loadRecordings(): Promise<RecordingMetadata[]> {
  try {
    if (!db) await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([METADATA_STORE], "readonly");
      const store = transaction.objectStore(METADATA_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const recordings = request.result || [];
        console.log(`Loaded ${recordings.length} recordings from IndexedDB`);
        resolve(recordings);
      };

      request.onerror = () => {
        console.error(
          "Failed to load recordings from IndexedDB:",
          request.error
        );
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to load recordings:", error);
    return [];
  }
}

/**
 * Saves a new recording to IndexedDB
 */
async function saveRecording(recording: RecordingData): Promise<void> {
  try {
    if (!db) await openDB();

    // Convert Uint8Array to Blob
    const blob = new Blob([recording.data], { type: recording.mime });

    // Start transaction
    const transaction = db.transaction(
      [RECORDINGS_STORE, METADATA_STORE],
      "readwrite"
    );

    return new Promise((resolve, reject) => {
      // First, check current count and remove oldest if needed
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const countRequest = metadataStore.count();

      countRequest.onsuccess = () => {
        const currentCount = countRequest.result;

        if (currentCount >= MAX_RECORDINGS) {
          // Get oldest recording to remove
          const index = metadataStore.index("timestamp");
          const oldestRequest = index.openCursor(null, "next");

          oldestRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
              const oldestId = cursor.value.id;

              // Remove from both stores
              const recordingsStore = transaction.objectStore(RECORDINGS_STORE);
              recordingsStore.delete(oldestId);
              metadataStore.delete(oldestId);

              console.log(`Removed oldest recording (id: ${oldestId})`);
            }
          };
        }
      };

      // Add new recording
      const recordingsStore = transaction.objectStore(RECORDINGS_STORE);
      const blobRequest = recordingsStore.add({
        data: blob,
        timestamp: recording.timestamp,
      });

      blobRequest.onsuccess = () => {
        const recordingId = blobRequest.result;

        // Add metadata
        const metadataRequest = metadataStore.add({
          id: recordingId,
          timestamp: recording.timestamp,
          duration: recording.duration,
          mime: recording.mime,
        });

        metadataRequest.onsuccess = () => {
          console.log(`Saved recording with id: ${recordingId}`);
          resolve();
        };

        metadataRequest.onerror = () => {
          console.error(
            "Failed to save recording metadata:",
            metadataRequest.error
          );
          reject(metadataRequest.error);
        };
      };

      blobRequest.onerror = () => {
        console.error("Failed to save recording blob:", blobRequest.error);
        reject(blobRequest.error);
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Failed to save recording:", error);
    throw error;
  }
}

/**
 * Gets a specific recording by index
 */
async function getRecording(index: number): Promise<{ data: Blob; mime: string; timestamp: number; duration: number } | null> {
  try {
    if (!db) await openDB();

    const recordings = await loadRecordings();
    if (index >= recordings.length) return null;

    // Sort by timestamp descending (newest first)
    recordings.sort((a, b) => b.timestamp - a.timestamp);
    const recording = recordings[index];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([RECORDINGS_STORE], "readonly");
      const store = transaction.objectStore(RECORDINGS_STORE);
      const request = store.get(recording.id);

      request.onsuccess = () => {
        if (request.result) {
          resolve({
            data: request.result.data,
            mime: recording.mime,
            timestamp: recording.timestamp,
            duration: recording.duration,
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error("Failed to get recording:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Failed to get recording:", error);
    return null;
  }
}

/**
 * Clears all recordings from IndexedDB
 */
async function clearRecordings(): Promise<void> {
  try {
    if (!db) await openDB();

    const transaction = db.transaction(
      [RECORDINGS_STORE, METADATA_STORE],
      "readwrite"
    );
    const recordingsStore = transaction.objectStore(RECORDINGS_STORE);
    const metadataStore = transaction.objectStore(METADATA_STORE);

    recordingsStore.clear();
    metadataStore.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log("Cleared all recordings from IndexedDB");
        resolve();
      };
      transaction.onerror = () => {
        console.error("Failed to clear recordings:", transaction.error);
        reject(transaction.error);
      };
    });
  } catch (error) {
    console.error("Failed to clear recordings:", error);
    throw error;
  }
}

// Initialize database on startup
openDB().catch((error) =>
  console.error("Failed to initialize database:", error)
);

chrome.runtime.onMessage.addListener((msg: Message, sender, sendResponse) => {
  (async () => {
    try {
      if (msg.type === "SAVE_RECORDING") {
        await saveRecording({
          data: new Uint8Array(msg.data),
          mime: msg.mime,
          timestamp: msg.timestamp,
          duration: msg.duration || 0,
        });
        sendResponse({ ok: true } as MessageResponse);
      } else if (msg.type === "CLEAR_RECORDINGS") {
        await clearRecordings();
        sendResponse({ ok: true } as MessageResponse);
      } else if (msg.type === "GET_RECORDINGS") {
        const recordings = await loadRecordings();
        // Sort by timestamp descending (newest first)
        recordings.sort((a, b) => b.timestamp - a.timestamp);
        sendResponse({
          ok: true,
          recordings: recordings,
        } as MessageResponse);
      } else if (msg.type === "GET_RECORDING") {
        const index = msg.index || 0;
        const recording = await getRecording(index);
        if (recording) {
          // Convert blob back to array for compatibility
          const buffer = await recording.data.arrayBuffer();
          const uint8 = new Uint8Array(buffer);
          sendResponse({
            ok: true,
            data: Array.from(uint8),
            mime: recording.mime,
            timestamp: recording.timestamp,
            duration: recording.duration,
          } as MessageResponse);
        } else {
          sendResponse({ ok: false } as MessageResponse);
        }
      }
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ ok: false, error: (error as Error).message } as MessageResponse);
    }
  })();

  return true;
});
