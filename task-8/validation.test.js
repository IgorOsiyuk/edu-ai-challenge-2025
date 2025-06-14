/**
 * Comprehensive Test Suite for Validation Library
 * Tests all validator types, edge cases, and performance scenarios
 */

const {
  Schema,
  ValidationError,
  ValidationResult,
  StringValidator,
  NumberValidator,
  BooleanValidator,
  DateValidator,
  ArrayValidator,
  ObjectValidator,
} = require("./base-template.js");

describe("Validation Library", () => {
  describe("ValidationError", () => {
    test("should create error with message, path, and value", () => {
      const error = new ValidationError(
        "Test error",
        "test.path",
        "test value"
      );
      expect(error.message).toBe("Test error");
      expect(error.path).toBe("test.path");
      expect(error.value).toBe("test value");
      expect(error.name).toBe("ValidationError");
      expect(error.timestamp).toBeDefined();
    });

    test("should create error with default path and value", () => {
      const error = new ValidationError("Test error");
      expect(error.path).toBe("");
      expect(error.value).toBe(null);
    });
  });

  describe("ValidationResult", () => {
    test("should create successful result", () => {
      const result = new ValidationResult(true, [], "test value");
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.value).toBe("test value");
      expect(result.timestamp).toBeDefined();
    });

    test("should create failed result with errors", () => {
      const errors = [
        new ValidationError("Error 1"),
        new ValidationError("Error 2"),
      ];
      const result = new ValidationResult(false, errors, "test value");
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(errors);
      expect(result.value).toBe("test value");
    });

    test("should get first error message", () => {
      const errors = [
        new ValidationError("First error"),
        new ValidationError("Second error"),
      ];
      const result = new ValidationResult(false, errors);
      expect(result.getFirstError()).toBe("First error");
    });

    test("should return null for first error when valid", () => {
      const result = new ValidationResult(true, []);
      expect(result.getFirstError()).toBe(null);
    });

    test("should get all error messages", () => {
      const errors = [
        new ValidationError("Error 1"),
        new ValidationError("Error 2"),
      ];
      const result = new ValidationResult(false, errors);
      expect(result.getAllErrors()).toEqual(["Error 1", "Error 2"]);
    });
  });

  describe("StringValidator", () => {
    test("should validate string type", () => {
      const validator = new StringValidator();
      const result = validator.validate("test string");
      expect(result.isValid).toBe(true);
      expect(result.value).toBe("test string");
    });

    test("should reject non-string types", () => {
      const validator = new StringValidator();
      const result = validator.validate(123);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain(
        "Expected string but got number"
      );
    });

    test("should validate minimum length", () => {
      const validator = new StringValidator().minLength(5);

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("hi").isValid).toBe(false);
      expect(validator.validate("hi").errors[0].message).toContain(
        "at least 5 characters"
      );
    });

    test("should validate maximum length", () => {
      const validator = new StringValidator().maxLength(5);

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("hello world").isValid).toBe(false);
      expect(validator.validate("hello world").errors[0].message).toContain(
        "at most 5 characters"
      );
    });

    test("should validate pattern with regex", () => {
      const validator = new StringValidator().pattern(/^\d{3}-\d{2}-\d{4}$/);

      expect(validator.validate("123-45-6789").isValid).toBe(true);
      expect(validator.validate("invalid").isValid).toBe(false);
    });

    test("should throw error for invalid regex", () => {
      const validator = new StringValidator();
      expect(() => validator.pattern("not a regex")).toThrow(
        "Pattern must be a RegExp instance"
      );
    });

    test("should validate email format", () => {
      const validator = new StringValidator().email();

      expect(validator.validate("test@example.com").isValid).toBe(true);
      expect(validator.validate("invalid-email").isValid).toBe(false);
      expect(validator.validate("test@").isValid).toBe(false);
      expect(validator.validate("@example.com").isValid).toBe(false);
    });

    test("should validate URL format", () => {
      const validator = new StringValidator().url();

      expect(validator.validate("https://example.com").isValid).toBe(true);
      expect(validator.validate("http://localhost:3000").isValid).toBe(true);
      expect(validator.validate("invalid-url").isValid).toBe(false);
    });

    test("should validate non-empty strings", () => {
      const validator = new StringValidator().notEmpty();

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("").isValid).toBe(false);
      expect(validator.validate("   ").isValid).toBe(false);
    });

    test("should support custom error messages", () => {
      const validator = new StringValidator().minLength(5, "Custom message");
      const result = validator.validate("hi");
      expect(result.errors[0].message).toBe("Custom message");
    });

    test("should support method chaining", () => {
      const validator = new StringValidator()
        .minLength(3)
        .maxLength(10)
        .pattern(/^[a-zA-Z]+$/)
        .notEmpty();

      expect(validator.validate("hello").isValid).toBe(true);
      expect(validator.validate("hi").isValid).toBe(false);
      expect(validator.validate("hello world").isValid).toBe(false);
      expect(validator.validate("hello123").isValid).toBe(false);
    });

    test("should handle optional fields", () => {
      const validator = new StringValidator().optional();

      expect(validator.validate(undefined).isValid).toBe(true);
      expect(validator.validate(null).isValid).toBe(true);
      expect(validator.validate("test").isValid).toBe(true);
    });

    test("should transform values before validation", () => {
      const validator = new StringValidator().transform((value) =>
        value.toString().toUpperCase()
      );
      const result = validator.validate("hello");

      expect(result.isValid).toBe(true);
      expect(result.value).toBe("HELLO");
    });

    test("should handle transform errors", () => {
      const validator = new StringValidator().transform(() => {
        throw new Error("Transform failed");
      });
      const result = validator.validate("test");

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain(
        "Transform error: Transform failed"
      );
    });
  });

  describe("NumberValidator", () => {
    test("should validate number type", () => {
      const validator = new NumberValidator();
      expect(validator.validate(123).isValid).toBe(true);
      expect(validator.validate(3.14).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(-42).isValid).toBe(true);
    });

    test("should reject non-number types", () => {
      const validator = new NumberValidator();
      expect(validator.validate("123").isValid).toBe(false);
      expect(validator.validate(true).isValid).toBe(false);
      expect(validator.validate(null).isValid).toBe(false);
    });

    test("should reject NaN", () => {
      const validator = new NumberValidator();
      expect(validator.validate(NaN).isValid).toBe(false);
    });

    test("should validate minimum value", () => {
      const validator = new NumberValidator().min(0);

      expect(validator.validate(5).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(-1).isValid).toBe(false);
    });

    test("should validate maximum value", () => {
      const validator = new NumberValidator().max(100);

      expect(validator.validate(50).isValid).toBe(true);
      expect(validator.validate(100).isValid).toBe(true);
      expect(validator.validate(101).isValid).toBe(false);
    });

    test("should validate integer constraint", () => {
      const validator = new NumberValidator().integer();

      expect(validator.validate(42).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(-5).isValid).toBe(true);
      expect(validator.validate(3.14).isValid).toBe(false);
    });

    test("should validate positive numbers", () => {
      const validator = new NumberValidator().positive();

      expect(validator.validate(1).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(-1).isValid).toBe(false);
    });

    test("should validate negative numbers", () => {
      const validator = new NumberValidator().negative();

      expect(validator.validate(-1).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(1).isValid).toBe(false);
    });

    test("should support method chaining", () => {
      const validator = new NumberValidator().min(0).max(100).integer();

      expect(validator.validate(50).isValid).toBe(true);
      expect(validator.validate(-1).isValid).toBe(false);
      expect(validator.validate(101).isValid).toBe(false);
      expect(validator.validate(50.5).isValid).toBe(false);
    });
  });

  describe("BooleanValidator", () => {
    test("should validate boolean type", () => {
      const validator = new BooleanValidator();

      expect(validator.validate(true).isValid).toBe(true);
      expect(validator.validate(false).isValid).toBe(true);
    });

    test("should reject non-boolean types", () => {
      const validator = new BooleanValidator();

      expect(validator.validate(1).isValid).toBe(false);
      expect(validator.validate("true").isValid).toBe(false);
      expect(validator.validate(null).isValid).toBe(false);
      expect(validator.validate(undefined).isValid).toBe(false);
    });
  });

  describe("DateValidator", () => {
    test("should validate Date objects", () => {
      const validator = new DateValidator();
      const date = new Date("2023-01-01");

      expect(validator.validate(date).isValid).toBe(true);
      expect(validator.validate(date).value).toEqual(date);
    });

    test("should validate date strings", () => {
      const validator = new DateValidator();
      const result = validator.validate("2023-01-01");

      expect(result.isValid).toBe(true);
      expect(result.value).toBeInstanceOf(Date);
    });

    test("should reject invalid dates", () => {
      const validator = new DateValidator();

      expect(validator.validate("invalid-date").isValid).toBe(false);
      expect(validator.validate(123).isValid).toBe(false);
      expect(validator.validate(new Date("invalid")).isValid).toBe(false);
    });

    test("should validate date after constraint", () => {
      const validator = new DateValidator().after("2023-01-01");

      expect(validator.validate("2023-01-02").isValid).toBe(true);
      expect(validator.validate("2022-12-31").isValid).toBe(false);
    });

    test("should validate date before constraint", () => {
      const validator = new DateValidator().before("2023-01-01");

      expect(validator.validate("2022-12-31").isValid).toBe(true);
      expect(validator.validate("2023-01-02").isValid).toBe(false);
    });
  });

  describe("ArrayValidator", () => {
    test("should validate array type", () => {
      const validator = new ArrayValidator();

      expect(validator.validate([]).isValid).toBe(true);
      expect(validator.validate([1, 2, 3]).isValid).toBe(true);
    });

    test("should reject non-array types", () => {
      const validator = new ArrayValidator();

      expect(validator.validate("not array").isValid).toBe(false);
      expect(validator.validate(123).isValid).toBe(false);
      expect(validator.validate({}).isValid).toBe(false);
    });

    test("should validate array items with item validator", () => {
      const validator = new ArrayValidator(new StringValidator());

      expect(validator.validate(["a", "b", "c"]).isValid).toBe(true);
      expect(validator.validate(["a", 123, "c"]).isValid).toBe(false);
    });

    test("should validate minimum length", () => {
      const validator = new ArrayValidator().minLength(2);

      expect(validator.validate([1, 2]).isValid).toBe(true);
      expect(validator.validate([1]).isValid).toBe(false);
    });

    test("should validate maximum length", () => {
      const validator = new ArrayValidator().maxLength(2);

      expect(validator.validate([1, 2]).isValid).toBe(true);
      expect(validator.validate([1, 2, 3]).isValid).toBe(false);
    });

    test("should validate non-empty arrays", () => {
      const validator = new ArrayValidator().notEmpty();

      expect(validator.validate([1]).isValid).toBe(true);
      expect(validator.validate([]).isValid).toBe(false);
    });

    test("should provide path information for item validation errors", () => {
      const validator = new ArrayValidator(new StringValidator());
      const result = validator.validate(["valid", 123, "also valid"]);

      expect(result.isValid).toBe(false);
      expect(result.errors[0].path).toBe("[1]");
    });
  });

  describe("ObjectValidator", () => {
    test("should validate object type", () => {
      const validator = new ObjectValidator();

      expect(validator.validate({}).isValid).toBe(true);
      expect(validator.validate({ key: "value" }).isValid).toBe(true);
    });

    test("should reject non-object types", () => {
      const validator = new ObjectValidator();

      expect(validator.validate("not object").isValid).toBe(false);
      expect(validator.validate(123).isValid).toBe(false);
      expect(validator.validate([]).isValid).toBe(false);
      expect(validator.validate(null).isValid).toBe(false);
    });

    test("should validate object schema", () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator(),
      };
      const validator = new ObjectValidator(schema);

      expect(validator.validate({ name: "John", age: 30 }).isValid).toBe(true);
      expect(validator.validate({ name: "John", age: "thirty" }).isValid).toBe(
        false
      );
    });

    test("should validate optional properties", () => {
      const schema = {
        name: new StringValidator(),
        age: new NumberValidator().optional(),
      };
      const validator = new ObjectValidator(schema);

      expect(validator.validate({ name: "John" }).isValid).toBe(true);
      expect(validator.validate({ name: "John", age: 30 }).isValid).toBe(true);
    });

    test("should reject unknown properties by default", () => {
      const schema = {
        name: new StringValidator(),
      };
      const validator = new ObjectValidator(schema);
      const result = validator.validate({ name: "John", extra: "value" });

      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain('Unknown property "extra"');
    });

    test("should allow unknown properties when configured", () => {
      const schema = {
        name: new StringValidator(),
      };
      const validator = new ObjectValidator(schema).allowUnknown();
      const result = validator.validate({ name: "John", extra: "value" });

      expect(result.isValid).toBe(true);
      expect(result.value.extra).toBe("value");
    });

    test("should provide path information for nested validation errors", () => {
      const schema = {
        user: new ObjectValidator({
          name: new StringValidator(),
          email: new StringValidator().email(),
        }),
      };
      const validator = new ObjectValidator(schema);
      const result = validator.validate({
        user: {
          name: "John",
          email: "invalid-email",
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0].path).toBe("user.email");
    });
  });

  describe("Schema Factory", () => {
    test("should create string validator", () => {
      const validator = Schema.string();
      expect(validator).toBeInstanceOf(StringValidator);
    });

    test("should create number validator", () => {
      const validator = Schema.number();
      expect(validator).toBeInstanceOf(NumberValidator);
    });

    test("should create boolean validator", () => {
      const validator = Schema.boolean();
      expect(validator).toBeInstanceOf(BooleanValidator);
    });

    test("should create date validator", () => {
      const validator = Schema.date();
      expect(validator).toBeInstanceOf(DateValidator);
    });

    test("should create array validator", () => {
      const validator = Schema.array(Schema.string());
      expect(validator).toBeInstanceOf(ArrayValidator);
    });

    test("should create object validator", () => {
      const validator = Schema.object({ name: Schema.string() });
      expect(validator).toBeInstanceOf(ObjectValidator);
    });
  });

  describe("Complex Validation Scenarios", () => {
    test("should validate nested objects and arrays", () => {
      const addressSchema = Schema.object({
        street: Schema.string().notEmpty(),
        city: Schema.string().notEmpty(),
        postalCode: Schema.string().pattern(/^\d{5}$/),
        country: Schema.string().notEmpty(),
      });

      const userSchema = Schema.object({
        id: Schema.string(),
        name: Schema.string().minLength(2).maxLength(50),
        email: Schema.string().email(),
        age: Schema.number().min(0).max(120).optional(),
        isActive: Schema.boolean(),
        tags: Schema.array(Schema.string()).notEmpty(),
        addresses: Schema.array(addressSchema).optional(),
        metadata: Schema.object({}).allowUnknown().optional(),
      });

      const validUser = {
        id: "12345",
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        isActive: true,
        tags: ["developer", "designer"],
        addresses: [
          {
            street: "123 Main St",
            city: "Anytown",
            postalCode: "12345",
            country: "USA",
          },
        ],
        metadata: { source: "api", version: "1.0" },
      };

      const result = userSchema.validate(validUser);
      expect(result.isValid).toBe(true);
    });

    test("should handle deeply nested validation errors", () => {
      const schema = Schema.object({
        level1: Schema.object({
          level2: Schema.object({
            level3: Schema.string().minLength(10),
          }),
        }),
      });

      const result = schema.validate({
        level1: {
          level2: {
            level3: "short",
          },
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors[0].path).toBe("level1.level2.level3");
    });

    test("should validate multiple constraint violations", () => {
      const validator = Schema.string()
        .minLength(10)
        .maxLength(5)
        .pattern(/^[a-zA-Z]+$/);
      const result = validator.validate("hi123");

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe("Performance and Edge Cases", () => {
    test("should handle large arrays efficiently", () => {
      const largeArray = new Array(10000).fill("test");
      const validator = Schema.array(Schema.string());

      const startTime = Date.now();
      const result = validator.validate(largeArray);
      const endTime = Date.now();

      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    test("should handle deeply nested objects", () => {
      let schema = Schema.string();
      let testData = "test";

      // Create 100 levels of nesting
      for (let i = 0; i < 100; i++) {
        schema = Schema.object({ nested: schema });
        testData = { nested: testData };
      }

      const result = schema.validate(testData);
      expect(result.isValid).toBe(true);
    });

    test("should handle circular references gracefully", () => {
      const obj = { name: "test" };
      obj.self = obj; // Create circular reference

      const validator = Schema.object({
        name: Schema.string(),
      }).allowUnknown();

      // Should not throw an error or cause infinite recursion
      expect(() => validator.validate(obj)).not.toThrow();
    });

    test("should handle null and undefined values correctly", () => {
      const validator = Schema.string().optional();

      expect(validator.validate(null).isValid).toBe(true);
      expect(validator.validate(undefined).isValid).toBe(true);

      const requiredValidator = Schema.string();
      expect(requiredValidator.validate(null).isValid).toBe(false);
      expect(requiredValidator.validate(undefined).isValid).toBe(false);
    });

    test("should handle special number values", () => {
      const validator = Schema.number();

      expect(validator.validate(Infinity).isValid).toBe(true);
      expect(validator.validate(-Infinity).isValid).toBe(true);
      expect(validator.validate(0).isValid).toBe(true);
      expect(validator.validate(-0).isValid).toBe(true);
      expect(validator.validate(Number.MAX_SAFE_INTEGER).isValid).toBe(true);
      expect(validator.validate(Number.MIN_SAFE_INTEGER).isValid).toBe(true);
    });

    test("should handle empty strings and whitespace", () => {
      const validator = Schema.string().notEmpty();

      expect(validator.validate("").isValid).toBe(false);
      expect(validator.validate("   ").isValid).toBe(false);
      expect(validator.validate("\t\n").isValid).toBe(false);
      expect(validator.validate(" a ").isValid).toBe(true);
    });
  });

  describe("Error Handling and Custom Messages", () => {
    test("should use custom error messages", () => {
      const validator = Schema.string().withMessage("Custom string error");
      const result = validator.validate(123);

      expect(result.errors[0].message).toBe("Custom string error");
    });

    test("should prioritize custom messages over constraint messages", () => {
      const validator = Schema.string()
        .minLength(5)
        .withMessage("Custom error");
      const result = validator.validate("hi");

      expect(result.errors[0].message).toBe("Custom error");
    });

    test("should handle constraint errors gracefully", () => {
      const validator = new StringValidator();
      validator.addConstraint({
        validate: () => {
          throw new Error("Constraint failed");
        },
        message: "Constraint error",
      });

      const result = validator.validate("test");
      expect(result.isValid).toBe(false);
      expect(result.errors[0].message).toContain(
        "Constraint error: Constraint failed"
      );
    });
  });

  describe("Transform Function", () => {
    test("should transform string to uppercase", () => {
      const validator = Schema.string().transform((s) => s.toUpperCase());
      const result = validator.validate("hello");

      expect(result.isValid).toBe(true);
      expect(result.value).toBe("HELLO");
    });

    test("should transform number to string", () => {
      const validator = Schema.string().transform((n) => n.toString());
      const result = validator.validate(123);

      expect(result.isValid).toBe(true);
      expect(result.value).toBe("123");
    });

    test("should validate after transformation", () => {
      const validator = Schema.string()
        .transform((n) => n.toString())
        .minLength(2);

      expect(validator.validate(123).isValid).toBe(true);
      expect(validator.validate(1).isValid).toBe(false);
    });

    test("should handle transform function that is not a function", () => {
      const validator = new StringValidator();
      expect(() => validator.transform("not a function")).toThrow(
        "Transform function must be a function"
      );
    });
  });
});
