export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string }
