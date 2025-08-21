import { getFirestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, DocumentData, CollectionReference, QueryConstraint, DocumentReference, WhereFilterOp, orderBy as orderByConstraint, limit as limitConstraint, startAfter } from 'firebase/firestore';
import firebaseApp from './firebase';

// Singleton Firestore instance
export const db = getFirestore(firebaseApp);

// Helper to get a typed collection reference
export function col<T = DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

// CRUD helpers
export async function fetchDoc<T = DocumentData>(path: string, id: string): Promise<T | null> {
  const ref = doc(db, path, id);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as T) : null;
}

type Where = { field: string; op: WhereFilterOp; value: unknown };
export type Filter = Where;
export type Order = { field: string; direction?: 'asc' | 'desc' };

export interface PageOptions {
  filters?: Filter[];
  order?: Order[]; // required if cursor provided
  limit?: number; // default 20
  cursor?: string; // document id to start after (forward pagination only)
}

export interface PageResult<T> {
  items: (T & { id: string })[];
  nextCursor?: string; // pass as cursor in next call
}

export async function fetchCollection<T = DocumentData>(path: string, wheres: Where[] = []): Promise<T[]> {
  let constraints: QueryConstraint[] = [];
  if (wheres.length) {
    constraints = wheres.map(w => where(w.field, w.op, w.value));
  }
  const qRef = constraints.length ? query(col<T>(path), ...constraints) : col<T>(path);
  const snap = await getDocs(qRef);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as T) } as T));
}

// Advanced querying with filters, ordering, limit & cursor-based forward pagination.
export async function fetchCollectionPage<T = DocumentData>(path: string, opts: PageOptions = {}): Promise<PageResult<T>> {
  const { filters = [], order = [], limit = 20, cursor } = opts;
  const parts: QueryConstraint[] = [];

  // Filters first
  if (filters.length) {
    for (const f of filters) {
      parts.push(where(f.field, f.op, f.value));
    }
  }

  // Ordering (required if cursor supplied)
  if (order.length) {
    for (const o of order) {
      parts.push(orderByConstraint(o.field, o.direction ?? 'asc'));
    }
  } else if (cursor) {
    throw new Error('fetchCollectionPage: order[] is required when using cursor pagination.');
  }

  // If cursor provided, fetch snapshot and append startAfter AFTER orderBy constraints.
  if (cursor) {
    const snap = await getDoc(doc(db, path, cursor));
    if (snap.exists()) {
      parts.push(startAfter(snap));
    }
  }

  // Limit last
  parts.push(limitConstraint(limit));

  const qRef = query(collection(db, path), ...parts);
  const snap = await getDocs(qRef);
  const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as T) } as T & { id: string }));

  const nextCursor = items.length === limit ? snap.docs[snap.docs.length - 1]?.id : undefined;

  return { items, nextCursor };
}

export async function createDoc<T extends Record<string, unknown>>(path: string, data: T) {
  const ref = await addDoc(col<T>(path), data);
  return ref.id;
}

export async function updateDocument<T extends Record<string, unknown>>(path: string, id: string, data: Partial<T>) {
  const ref: DocumentReference<DocumentData> = doc(db, path, id);
  await updateDoc(ref, data as unknown as DocumentData);
}

export async function deleteDocument(path: string, id: string) {
  const ref = doc(db, path, id);
  await deleteDoc(ref);
}
