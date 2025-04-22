export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Validator {
  static isString(value: unknown): boolean {
    return typeof value === 'string';
  }

  static isNumber(value: unknown): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  static isBoolean(value: unknown): boolean {
    return typeof value === 'boolean';
  }

  static isObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isArray(value: unknown): boolean {
    return Array.isArray(value);
  }

  static isNonEmptyString(value: unknown): boolean {
    return this.isString(value) && (value as string).trim().length > 0;
  }

  static isWithinLength(value: string, minLength: number, maxLength: number): boolean {
    return value.length >= minLength && value.length <= maxLength;
  }

  static isValidEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  static validateObject<T extends object>(
    value: unknown,
    requiredFields: (keyof T)[],
    optionalFields: (keyof T)[] = []
  ): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    };

    if (!this.isObject(value)) {
      result.isValid = false;
      result.errors.push('El valor debe ser un objeto');
      return result;
    }

    const obj = value as T;
    const allFields = [...requiredFields, ...optionalFields];

    // Verificar campos requeridos
    for (const field of requiredFields) {
      if (!(field in obj)) {
        result.isValid = false;
        result.errors.push(`Campo requerido faltante: ${String(field)}`);
      }
    }

    // Verificar campos no permitidos
    for (const field in obj) {
      if (!allFields.includes(field as keyof T)) {
        result.isValid = false;
        result.errors.push(`Campo no permitido: ${field}`);
      }
    }

    return result;
  }
} 