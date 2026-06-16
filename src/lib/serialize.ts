import { Types } from "mongoose";

export function serializeDoc(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Types.ObjectId) return value.toString();

  if (Array.isArray(value)) {
    return value.map((item) => serializeDoc(item));
  }

  if (value && typeof value === "object") {
    const output: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      if (key === "__v") continue;
      if (key === "_id") {
        output.id = serializeDoc(item);
        continue;
      }
      output[key] = serializeDoc(item);
    }

    return output;
  }

  return value;
}

export function serializeDocs<T>(docs: T[]) {
  return docs.map((doc) => serializeDoc(doc));
}
