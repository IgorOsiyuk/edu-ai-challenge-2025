/**
 * Robust Data Validation Library
 * A comprehensive JavaScript library for validating complex data structures
 * with performance optimization and extensible architecture.
 *
 * @version 1.0.0
 * @author Validation Library Team
 */

/**
 * ValidationError class for handling validation failures
 */
class ValidationError extends Error {
  constructor(message, path = "", value = null) {
    super(message);
    this.name = "ValidationError";
    this.path = path;
    this.value = value;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * ValidationResult class to encapsulate validation outcomes
 */
class ValidationResult {
  constructor(isValid, errors = [], value = null) {
    this.isValid = isValid;
    this.errors = errors;
    this.value = value;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Get the first error message
   * @returns {string|null} First error message or null if valid
   */
  getFirstError() {
    return this.errors.length > 0 ? this.errors[0].message : null;
  }

  /**
   * Get all error messages as an array
   * @returns {string[]} Array of error messages
   */
  getAllErrors() {
    return this.errors.map((error) => error.message);
  }
}

/**
 * Base Validator class - foundation for all validators
 */
class BaseValidator {
  constructor() {
    this.constraints = [];
    this.customMessage = null;
    this.isOptional = false;
    this.transformFn = null;
  }

  /**
   * Set a custom error message
   * @param {string} message - Custom error message
   * @returns {BaseValidator} Validator instance for chaining
   */
  withMessage(message) {
    this.customMessage = message;
    return this;
  }

  /**
   * Mark field as optional
   * @returns {BaseValidator} Validator instance for chaining
   */
  optional() {
    this.isOptional = true;
    return this;
  }

  /**
   * Transform value before validation
   * @param {Function} fn - Transform function
   * @returns {BaseValidator} Validator instance for chaining
   */
  transform(fn) {
    if (typeof fn !== "function") {
      throw new Error("Transform function must be a function");
    }
    this.transformFn = fn;
    return this;
  }

  /**
   * Validate a value against this validator
   * @param {*} value - Value to validate
   * @param {string} path - Path for error reporting
   * @returns {ValidationResult} Validation result
   */
  validate(value, path = "") {
    // Handle undefined/null for optional fields
    if ((value === undefined || value === null) && this.isOptional) {
      return new ValidationResult(true, [], value);
    }

    // Apply transformation if provided
    if (this.transformFn) {
      try {
        value = this.transformFn(value);
      } catch (error) {
        return new ValidationResult(
          false,
          [
            new ValidationError(
              `Transform error: ${error.message}`,
              path,
              value
            ),
          ],
          value
        );
      }
    }

    // Run type-specific validation
    const typeResult = this.validateType(value, path);
    if (!typeResult.isValid) {
      return typeResult;
    }

    // Run constraint validations
    const errors = [];
    for (const constraint of this.constraints) {
      try {
        const isValid = constraint.validate(value);
        if (!isValid) {
          // Use custom message if set, otherwise use individual constraint message
          const message =
            this.customMessage || constraint.message || "Validation failed";
          errors.push(new ValidationError(message, path, value));
        }
      } catch (error) {
        errors.push(
          new ValidationError(`Constraint error: ${error.message}`, path, value)
        );
      }
    }

    return new ValidationResult(
      errors.length === 0,
      errors,
      errors.length === 0 ? typeResult.value : value
    );
  }

  /**
   * Type-specific validation - to be implemented by subclasses
   * @param {*} value - Value to validate
   * @param {string} path - Path for error reporting
   * @returns {ValidationResult} Validation result
   */
  validateType(value, path) {
    throw new Error("validateType must be implemented by subclasses");
  }

  /**
   * Add a constraint to the validator
   * @param {Object} constraint - Constraint object with validate and message properties
   * @returns {BaseValidator} Validator instance for chaining
   */
  addConstraint(constraint) {
    this.constraints.push(constraint);
    return this;
  }
}

/**
 * String Validator - validates string values with various constraints
 */
class StringValidator extends BaseValidator {
  validateType(value, path) {
    if (typeof value !== "string") {
      const message =
        this.customMessage || `Expected string but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }
    return new ValidationResult(true, [], value);
  }

  /**
   * Set minimum length constraint
   * @param {number} min - Minimum length
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  minLength(min, message) {
    return this.addConstraint({
      validate: (value) => value.length >= min,
      message: message || `String must be at least ${min} characters long`,
    });
  }

  /**
   * Set maximum length constraint
   * @param {number} max - Maximum length
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  maxLength(max, message) {
    return this.addConstraint({
      validate: (value) => value.length <= max,
      message: message || `String must be at most ${max} characters long`,
    });
  }

  /**
   * Set pattern constraint using regex
   * @param {RegExp} regex - Regular expression pattern
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  pattern(regex, message) {
    if (!(regex instanceof RegExp)) {
      throw new Error("Pattern must be a RegExp instance");
    }
    return this.addConstraint({
      validate: (value) => regex.test(value),
      message: message || `String does not match required pattern`,
    });
  }

  /**
   * Email validation constraint
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  email(message) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.pattern(emailRegex, message || "Invalid email format");
  }

  /**
   * URL validation constraint
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  url(message) {
    return this.addConstraint({
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: message || "Invalid URL format",
    });
  }

  /**
   * Non-empty string constraint
   * @param {string} message - Custom error message
   * @returns {StringValidator} Validator instance for chaining
   */
  notEmpty(message) {
    return this.addConstraint({
      validate: (value) => value.trim().length > 0,
      message: message || "String cannot be empty",
    });
  }
}

/**
 * Number Validator - validates numeric values with various constraints
 */
class NumberValidator extends BaseValidator {
  validateType(value, path) {
    if (typeof value !== "number" || isNaN(value)) {
      const message =
        this.customMessage || `Expected number but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }
    return new ValidationResult(true, [], value);
  }

  /**
   * Set minimum value constraint
   * @param {number} min - Minimum value
   * @param {string} message - Custom error message
   * @returns {NumberValidator} Validator instance for chaining
   */
  min(min, message) {
    return this.addConstraint({
      validate: (value) => value >= min,
      message: message || `Number must be at least ${min}`,
    });
  }

  /**
   * Set maximum value constraint
   * @param {number} max - Maximum value
   * @param {string} message - Custom error message
   * @returns {NumberValidator} Validator instance for chaining
   */
  max(max, message) {
    return this.addConstraint({
      validate: (value) => value <= max,
      message: message || `Number must be at most ${max}`,
    });
  }

  /**
   * Integer constraint
   * @param {string} message - Custom error message
   * @returns {NumberValidator} Validator instance for chaining
   */
  integer(message) {
    return this.addConstraint({
      validate: (value) => Number.isInteger(value),
      message: message || "Number must be an integer",
    });
  }

  /**
   * Positive number constraint
   * @param {string} message - Custom error message
   * @returns {NumberValidator} Validator instance for chaining
   */
  positive(message) {
    return this.min(0, message || "Number must be positive");
  }

  /**
   * Negative number constraint
   * @param {string} message - Custom error message
   * @returns {NumberValidator} Validator instance for chaining
   */
  negative(message) {
    return this.max(0, message || "Number must be negative");
  }
}

/**
 * Boolean Validator - validates boolean values
 */
class BooleanValidator extends BaseValidator {
  validateType(value, path) {
    if (typeof value !== "boolean") {
      const message =
        this.customMessage || `Expected boolean but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }
    return new ValidationResult(true, [], value);
  }
}

/**
 * Date Validator - validates Date objects and date strings
 */
class DateValidator extends BaseValidator {
  validateType(value, path) {
    let dateValue = value;

    // Convert string to Date if necessary
    if (typeof value === "string") {
      dateValue = new Date(value);
    }

    if (!(dateValue instanceof Date) || isNaN(dateValue.getTime())) {
      const message =
        this.customMessage || `Expected valid date but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }

    // Return the converted Date object as the validated value
    return new ValidationResult(true, [], dateValue);
  }

  /**
   * Set minimum date constraint
   * @param {Date|string} minDate - Minimum date
   * @param {string} message - Custom error message
   * @returns {DateValidator} Validator instance for chaining
   */
  after(minDate, message) {
    const min = new Date(minDate);
    return this.addConstraint({
      validate: (value) => new Date(value) > min,
      message: message || `Date must be after ${min.toISOString()}`,
    });
  }

  /**
   * Set maximum date constraint
   * @param {Date|string} maxDate - Maximum date
   * @param {string} message - Custom error message
   * @returns {DateValidator} Validator instance for chaining
   */
  before(maxDate, message) {
    const max = new Date(maxDate);
    return this.addConstraint({
      validate: (value) => new Date(value) < max,
      message: message || `Date must be before ${max.toISOString()}`,
    });
  }
}

/**
 * Array Validator - validates arrays with item validation
 */
class ArrayValidator extends BaseValidator {
  constructor(itemValidator = null) {
    super();
    this.itemValidator = itemValidator;
  }

  validateType(value, path) {
    if (!Array.isArray(value)) {
      const message =
        this.customMessage || `Expected array but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }

    // Validate array items if itemValidator is provided
    if (this.itemValidator) {
      const errors = [];
      for (let i = 0; i < value.length; i++) {
        const itemResult = this.itemValidator.validate(
          value[i],
          `${path}[${i}]`
        );
        if (!itemResult.isValid) {
          errors.push(...itemResult.errors);
        }
      }

      if (errors.length > 0) {
        return new ValidationResult(false, errors, value);
      }
    }

    return new ValidationResult(true, [], value);
  }

  /**
   * Set minimum length constraint
   * @param {number} min - Minimum length
   * @param {string} message - Custom error message
   * @returns {ArrayValidator} Validator instance for chaining
   */
  minLength(min, message) {
    return this.addConstraint({
      validate: (value) => value.length >= min,
      message: message || `Array must have at least ${min} items`,
    });
  }

  /**
   * Set maximum length constraint
   * @param {number} max - Maximum length
   * @param {string} message - Custom error message
   * @returns {ArrayValidator} Validator instance for chaining
   */
  maxLength(max, message) {
    return this.addConstraint({
      validate: (value) => value.length <= max,
      message: message || `Array must have at most ${max} items`,
    });
  }

  /**
   * Non-empty array constraint
   * @param {string} message - Custom error message
   * @returns {ArrayValidator} Validator instance for chaining
   */
  notEmpty(message) {
    return this.minLength(1, message || "Array cannot be empty");
  }
}

/**
 * Object Validator - validates objects with schema validation
 */
class ObjectValidator extends BaseValidator {
  constructor(schema = {}) {
    super();
    this.schema = schema;
    this.allowUnknownKeys = false;
  }

  /**
   * Allow unknown keys in the object
   * @returns {ObjectValidator} Validator instance for chaining
   */
  allowUnknown() {
    this.allowUnknownKeys = true;
    return this;
  }

  validateType(value, path) {
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      const message =
        this.customMessage || `Expected object but got ${typeof value}`;
      return new ValidationResult(
        false,
        [new ValidationError(message, path, value)],
        value
      );
    }

    const errors = [];
    const validatedValue = {};

    // Validate known schema properties
    for (const [key, validator] of Object.entries(this.schema)) {
      const fieldPath = path ? `${path}.${key}` : key;
      const fieldValue = value[key];

      const result = validator.validate(fieldValue, fieldPath);
      if (!result.isValid) {
        errors.push(...result.errors);
      } else {
        validatedValue[key] = result.value;
      }
    }

    // Check for unknown keys if not allowed
    if (!this.allowUnknownKeys && Object.keys(this.schema).length > 0) {
      const schemaKeys = Object.keys(this.schema);
      const valueKeys = Object.keys(value);
      const unknownKeys = valueKeys.filter((key) => !schemaKeys.includes(key));

      for (const unknownKey of unknownKeys) {
        const fieldPath = path ? `${path}.${unknownKey}` : unknownKey;
        errors.push(
          new ValidationError(
            `Unknown property "${unknownKey}"`,
            fieldPath,
            value[unknownKey]
          )
        );
      }
    } else {
      // Include unknown keys in validated value
      for (const [key, val] of Object.entries(value)) {
        if (!(key in this.schema)) {
          validatedValue[key] = val;
        }
      }
    }

    // For empty schema objects, return the original value if no errors
    if (Object.keys(this.schema).length === 0 && errors.length === 0) {
      return new ValidationResult(true, [], value);
    }

    return new ValidationResult(errors.length === 0, errors, validatedValue);
  }
}

/**
 * Schema Builder - Factory class for creating validators
 */
class Schema {
  /**
   * Create a string validator
   * @returns {StringValidator} String validator instance
   */
  static string() {
    return new StringValidator();
  }

  /**
   * Create a number validator
   * @returns {NumberValidator} Number validator instance
   */
  static number() {
    return new NumberValidator();
  }

  /**
   * Create a boolean validator
   * @returns {BooleanValidator} Boolean validator instance
   */
  static boolean() {
    return new BooleanValidator();
  }

  /**
   * Create a date validator
   * @returns {DateValidator} Date validator instance
   */
  static date() {
    return new DateValidator();
  }

  /**
   * Create an object validator with schema
   * @param {Object} schema - Object schema with property validators
   * @returns {ObjectValidator} Object validator instance
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }

  /**
   * Create an array validator with optional item validator
   * @param {BaseValidator} itemValidator - Validator for array items
   * @returns {ArrayValidator} Array validator instance
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
}

// Export classes for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Schema,
    ValidationError,
    ValidationResult,
    StringValidator,
    NumberValidator,
    BooleanValidator,
    DateValidator,
    ArrayValidator,
    ObjectValidator,
  };
}

// Example usage and demonstration
if (typeof require === "undefined" || require.main === module) {
  // Define a complex schema
  const addressSchema = Schema.object({
    street: Schema.string().notEmpty(),
    city: Schema.string().notEmpty(),
    postalCode: Schema.string()
      .pattern(/^\d{5}(-\d{4})?$/)
      .withMessage("Postal code must be in format 12345 or 12345-6789"),
    country: Schema.string().notEmpty(),
  });

  const userSchema = Schema.object({
    id: Schema.string().withMessage("ID must be a string"),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().email(),
    age: Schema.number().min(0).max(120).optional(),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()).notEmpty(),
    address: addressSchema.optional(),
    metadata: Schema.object({}).allowUnknown().optional(),
  });

  // Validate data
  const userData = {
    id: "12345",
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    tags: ["developer", "designer"],
    address: {
      street: "123 Main St",
      city: "Anytown",
      postalCode: "12345",
      country: "USA",
    },
  };

  const result = userSchema.validate(userData);

  if (result.isValid) {
    console.log("✅ Validation successful!");
    console.log("Validated data:", JSON.stringify(result.value, null, 2));
  } else {
    console.log("❌ Validation failed:");
    result.errors.forEach((error) => {
      console.log(`- ${error.path}: ${error.message}`);
    });
  }
}
