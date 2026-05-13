/**
 * Recursively removes keys with `undefined` values from an object.
 * Firestore throws an error if `undefined` is passed as a field value.
 * null is allowed and preserved.
 */
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) return undefined as any;
  if (obj === null) return null as any;
  
  if (Array.isArray(obj)) {
    return obj
      .map(sanitizeForFirestore)
      .filter(v => v !== undefined) as any;
  }
  
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj as any)) {
      const sv = sanitizeForFirestore(v);
      if (sv !== undefined) {
        out[k] = sv;
      }
    }
    return out;
  }
  
  return obj;
}