import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Keep user logged in anonymously behind the scenes to satisfy security rules (isSignedIn = true)
export async function initializeAnonymousSession() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
      console.log("Firebase Auth silently initialized with UID:", auth.currentUser?.uid);
    }
  } catch (error) {
    console.warn("Silent Firebase Auth failed:", error);
  }
}

// Ensure database connection is validated (requirement from SKILL.md)
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// ========================================================
// Error Handlers Section conforming strictly to SKILL.md
// ========================================================
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Detailed Object: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================================
// Robust Type-Safe Firestore Database Sync Helpers
// ==========================================================

export async function fetchCollectionData<T>(collectionPath: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionPath));
    const items: T[] = [];
    querySnapshot.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
    return [];
  }
}

export async function saveDocumentData<T extends { id: string }>(collectionPath: string, docData: T): Promise<void> {
  const docPath = `${collectionPath}/${docData.id}`;
  try {
    const docRef = doc(db, collectionPath, docData.id);
    await setDoc(docRef, { ...docData });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteDocumentData(collectionPath: string, docId: string): Promise<void> {
  const docPath = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
