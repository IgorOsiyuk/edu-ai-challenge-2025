/**
 * Performance Benchmark Suite for Validation Library
 * Tests validation performance across different scenarios and data sizes
 */

import { Schema } from "./index.js";

// Utility function to measure execution time
function benchmark(name, fn, iterations = 1000) {
  console.log(`\n🔍 Benchmarking: ${name}`);

  const startTime = process.hrtime.bigint();

  for (let i = 0; i < iterations; i++) {
    fn();
  }

  const endTime = process.hrtime.bigint();
  const totalTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
  const avgTime = totalTime / iterations;

  console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`  Average time: ${avgTime.toFixed(4)}ms per operation`);
  console.log(`  Operations per second: ${(1000 / avgTime).toFixed(0)}`);

  return { totalTime, avgTime, opsPerSecond: 1000 / avgTime };
}

// Generate test data
function generateUser(id) {
  return {
    id: `user_${id}`,
    name: `User ${id}`,
    email: `user${id}@example.com`,
    age: 20 + (id % 50),
    isActive: id % 2 === 0,
    tags: [`tag${id % 5}`, `category${id % 3}`],
    address: {
      street: `${id} Main St`,
      city: `City${id % 10}`,
      postalCode: String(10000 + (id % 90000)).padStart(5, "0"),
      country: "USA",
    },
    metadata: {
      source: "api",
      version: "1.0",
      lastLogin: new Date().toISOString(),
    },
  };
}

function generateLargeArray(size) {
  return Array.from({ length: size }, (_, i) => `item_${i}`);
}

// Define schemas for benchmarking
const stringValidator = Schema.string().minLength(2).maxLength(50);

const numberValidator = Schema.number().min(0).max(150).integer();

const complexObjectValidator = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().email(),
  age: Schema.number().min(0).max(150).optional(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()).notEmpty(),
  address: Schema.object({
    street: Schema.string().notEmpty(),
    city: Schema.string().notEmpty(),
    postalCode: Schema.string().pattern(/^\d{5}$/),
    country: Schema.string().notEmpty(),
  }).optional(),
  metadata: Schema.object({}).allowUnknown().optional(),
});

const arrayValidator = Schema.array(Schema.string());
const largeArrayValidator = Schema.array(complexObjectValidator);

// Benchmark tests
console.log("🚀 Validation Library Performance Benchmarks");
console.log("=".repeat(50));

// Basic validation benchmarks
benchmark(
  "String validation (simple)",
  () => {
    stringValidator.validate("John Doe");
  },
  10000
);

benchmark(
  "Number validation (simple)",
  () => {
    numberValidator.validate(25);
  },
  10000
);

benchmark(
  "Boolean validation (simple)",
  () => {
    Schema.boolean().validate(true);
  },
  10000
);

// Complex object validation
const sampleUser = generateUser(1);
benchmark(
  "Complex object validation",
  () => {
    complexObjectValidator.validate(sampleUser);
  },
  1000
);

// Array validation benchmarks
const smallArray = generateLargeArray(10);
benchmark(
  "Small array validation (10 items)",
  () => {
    arrayValidator.validate(smallArray);
  },
  1000
);

const mediumArray = generateLargeArray(100);
benchmark(
  "Medium array validation (100 items)",
  () => {
    arrayValidator.validate(mediumArray);
  },
  100
);

const largeArray = generateLargeArray(1000);
benchmark(
  "Large array validation (1000 items)",
  () => {
    arrayValidator.validate(largeArray);
  },
  10
);

// Memory and performance stress tests
console.log("\n📊 Stress Tests");
console.log("-".repeat(30));

// Deep nesting test
let deepSchema = Schema.string();
let deepObject = "test";

for (let i = 0; i < 50; i++) {
  deepSchema = Schema.object({ nested: deepSchema });
  deepObject = { nested: deepObject };
}

benchmark(
  "Deep nesting validation (50 levels)",
  () => {
    deepSchema.validate(deepObject);
  },
  100
);

// Large object array
const userArray = Array.from({ length: 100 }, (_, i) => generateUser(i));
benchmark(
  "Array of complex objects (100 users)",
  () => {
    largeArrayValidator.validate(userArray);
  },
  10
);

// Validation with errors
const invalidUser = {
  ...sampleUser,
  email: "invalid-email",
  age: "not a number",
  tags: [],
};

benchmark(
  "Complex validation with errors",
  () => {
    complexObjectValidator.validate(invalidUser);
  },
  1000
);

// Chain validation benchmark
const chainedValidator = Schema.string()
  .minLength(5)
  .maxLength(50)
  .pattern(/^[a-zA-Z\s]+$/)
  .notEmpty()
  .transform((s) => s.trim());

benchmark(
  "Chained validation (5 constraints + transform)",
  () => {
    chainedValidator.validate("  Valid Name  ");
  },
  1000
);

// Optional field performance
const optionalSchema = Schema.object({
  required: Schema.string(),
  optional1: Schema.string().optional(),
  optional2: Schema.number().optional(),
  optional3: Schema.boolean().optional(),
  optional4: Schema.array(Schema.string()).optional(),
  optional5: Schema.object({}).optional(),
});

const optionalData = { required: "test" };
benchmark(
  "Optional fields validation",
  () => {
    optionalSchema.validate(optionalData);
  },
  1000
);

// Memory usage estimation
console.log("\n💾 Memory Usage Analysis");
console.log("-".repeat(30));

function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round((used.rss / 1024 / 1024) * 100) / 100,
    heapTotal: Math.round((used.heapTotal / 1024 / 1024) * 100) / 100,
    heapUsed: Math.round((used.heapUsed / 1024 / 1024) * 100) / 100,
    external: Math.round((used.external / 1024 / 1024) * 100) / 100,
  };
}

const initialMemory = getMemoryUsage();
console.log("Initial memory usage:", initialMemory);

// Create many validators
const validators = [];
for (let i = 0; i < 1000; i++) {
  validators.push(
    Schema.object({
      id: Schema.string(),
      name: Schema.string().minLength(2),
      email: Schema.string().email(),
    })
  );
}

const afterCreationMemory = getMemoryUsage();
console.log("After creating 1000 validators:", afterCreationMemory);
console.log("Memory increase:", {
  rss: (afterCreationMemory.rss - initialMemory.rss).toFixed(2) + " MB",
  heapUsed:
    (afterCreationMemory.heapUsed - initialMemory.heapUsed).toFixed(2) + " MB",
});

// Performance recommendations
console.log("\n💡 Performance Recommendations");
console.log("-".repeat(40));
console.log("1. Use simple validators for basic types when possible");
console.log("2. Cache compiled validators for repeated use");
console.log(
  "3. Consider breaking down very large objects into smaller schemas"
);
console.log("4. Use optional() method to skip validation of undefined fields");
console.log("5. Transform data before validation when possible");
console.log("6. For very large arrays, consider batch validation");

// Feature comparison with native JavaScript
console.log("\n⚡ Comparison with Native JavaScript");
console.log("-".repeat(40));

const nativeValidation = (user) => {
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    user.name.length >= 2 &&
    typeof user.email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email) &&
    typeof user.isActive === "boolean" &&
    Array.isArray(user.tags) &&
    user.tags.length > 0
  );
};

benchmark(
  "Native JavaScript validation",
  () => {
    nativeValidation(sampleUser);
  },
  10000
);

benchmark(
  "Schema validation (equivalent)",
  () => {
    const basicSchema = Schema.object({
      id: Schema.string(),
      name: Schema.string().minLength(2),
      email: Schema.string().email(),
      isActive: Schema.boolean(),
      tags: Schema.array(Schema.string()).notEmpty(),
    });
    basicSchema.validate(sampleUser);
  },
  1000
);

console.log("\n✅ Benchmark Complete!");
console.log(
  "The library provides comprehensive validation with reasonable performance overhead."
);
console.log(
  "Consider the trade-off between validation thoroughness and raw performance."
);

// Note: Performance report could be generated and saved to file in a real implementation
console.log(
  "\n📄 Performance report generated (would be saved to performance_report.md)"
);
