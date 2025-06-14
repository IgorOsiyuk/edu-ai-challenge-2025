/**
 * Validation Library Usage Examples
 * Comprehensive examples demonstrating how to use the validation library
 *
 * @version 1.0.0
 * @author Validation Library Team
 */

import { Schema } from "./index.js";

console.log("🚀 Validation Library Examples");
console.log("=".repeat(50));

// Example 1: Basic String Validation
console.log("\n📝 Example 1: Basic String Validation");
const nameValidator = Schema.string().minLength(2).maxLength(50);
const names = [
  "John",
  "J",
  "A very long name that exceeds the maximum length allowed",
];

names.forEach((name) => {
  const result = nameValidator.validate(name);
  console.log(
    `"${name}": ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 2: Email Validation
console.log("\n📧 Example 2: Email Validation");
const emailValidator = Schema.string().email();
const emails = [
  "john@example.com",
  "invalid-email",
  "test@domain",
  "@invalid.com",
];

emails.forEach((email) => {
  const result = emailValidator.validate(email);
  console.log(
    `"${email}": ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 3: Number Validation with Constraints
console.log("\n🔢 Example 3: Number Validation");
const ageValidator = Schema.number().min(0).max(120).integer();
const ages = [25, -5, 150, 25.5, "not a number"];

ages.forEach((age) => {
  const result = ageValidator.validate(age);
  console.log(
    `${age}: ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 4: Array Validation
console.log("\n📋 Example 4: Array Validation");
const tagsValidator = Schema.array(Schema.string()).minLength(1).maxLength(5);
const tagArrays = [
  ["javascript", "nodejs"],
  [],
  ["a", "b", "c", "d", "e", "f"], // too many
  ["valid", 123, "invalid"], // invalid item type
];

tagArrays.forEach((tags, index) => {
  const result = tagsValidator.validate(tags);
  console.log(
    `Array ${index + 1}: ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 5: Complex Object Validation
console.log("\n🏗️ Example 5: Complex Object Validation");

// Define address schema
const addressSchema = Schema.object({
  street: Schema.string().notEmpty(),
  city: Schema.string().notEmpty(),
  postalCode: Schema.string().pattern(/^\d{5}(-\d{4})?$/),
  country: Schema.string().notEmpty(),
});

// Define user schema
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

// Test with valid data
const validUser = {
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

console.log("\n✅ Valid User Data:");
const validResult = userSchema.validate(validUser);
if (validResult.isValid) {
  console.log("✅ Validation successful!");
  console.log("Validated data:", JSON.stringify(validResult.value, null, 2));
} else {
  console.log("❌ Validation failed:");
  validResult.errors.forEach((error) => {
    console.log(`- ${error.path}: ${error.message}`);
  });
}

// Test with invalid data
const invalidUser = {
  id: 12345, // Should be string
  name: "J", // Too short
  email: "invalid-email", // Invalid format
  age: -5, // Negative age
  isActive: "yes", // Should be boolean
  tags: [], // Empty array not allowed
  address: {
    street: "", // Empty string not allowed
    city: "Anytown",
    postalCode: "invalid", // Invalid format
    country: "USA",
  },
};

console.log("\n❌ Invalid User Data:");
const invalidResult = userSchema.validate(invalidUser);
if (invalidResult.isValid) {
  console.log("✅ Validation successful!");
} else {
  console.log("❌ Validation failed with errors:");
  invalidResult.errors.forEach((error) => {
    console.log(`- ${error.path}: ${error.message}`);
  });
}

// Example 6: Data Transformation
console.log("\n🔄 Example 6: Data Transformation");
const transformValidator = Schema.string()
  .transform((value) => value.trim().toLowerCase())
  .minLength(3)
  .pattern(/^[a-z]+$/);

const inputs = ["  HELLO  ", "  World123  ", "  OK  "];
inputs.forEach((input) => {
  const result = transformValidator.validate(input);
  console.log(
    `"${input}" -> ${
      result.isValid ? `"${result.value}" ✅` : "❌ " + result.getFirstError()
    }`
  );
});

// Example 7: Optional Fields
console.log("\n🔍 Example 7: Optional Fields");
const profileSchema = Schema.object({
  username: Schema.string().minLength(3),
  bio: Schema.string().maxLength(500).optional(),
  website: Schema.string().url().optional(),
});

const profiles = [
  { username: "john_doe" },
  { username: "jane", bio: "Software developer" },
  { username: "bob", website: "https://example.com" },
  { username: "alice", bio: "Designer", website: "invalid-url" },
];

profiles.forEach((profile, index) => {
  const result = profileSchema.validate(profile);
  console.log(
    `Profile ${index + 1}: ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 8: Custom Error Messages
console.log("\n💬 Example 8: Custom Error Messages");
const passwordValidator = Schema.string()
  .minLength(8, "Password must be at least 8 characters long")
  .pattern(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .pattern(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .pattern(/(?=.*[0-9])/, "Password must contain at least one number")
  .pattern(
    /(?=.*[!@#$%^&*])/,
    "Password must contain at least one special character"
  );

const passwords = ["weak", "StrongPass1!", "onlylowercase", "ONLYUPPERCASE"];
passwords.forEach((password) => {
  const result = passwordValidator.validate(password);
  if (result.isValid) {
    console.log(`"${password}": ✅ Strong password!`);
  } else {
    console.log(`"${password}": ❌ Weak password:`);
    result.errors.forEach((error) => {
      console.log(`  - ${error.message}`);
    });
  }
});

// Example 9: Date Validation
console.log("\n📅 Example 9: Date Validation");
const eventDateValidator = Schema.date()
  .after("2024-01-01")
  .before("2025-12-31");

const dates = [
  new Date("2024-06-15"),
  "2024-12-25",
  "2023-12-31", // too early
  "2026-01-01", // too late
  "invalid-date",
];

dates.forEach((date) => {
  const result = eventDateValidator.validate(date);
  console.log(
    `${date}: ${
      result.isValid ? "✅ Valid" : "❌ Invalid - " + result.getFirstError()
    }`
  );
});

// Example 10: Performance Test
console.log("\n⚡ Example 10: Performance Test");
const simpleValidator = Schema.string().minLength(1);
const testData = Array.from({ length: 1000 }, (_, i) => `test${i}`);

const startTime = Date.now();
let validCount = 0;
testData.forEach((item) => {
  const result = simpleValidator.validate(item);
  if (result.isValid) validCount++;
});
const endTime = Date.now();

console.log(`Validated ${testData.length} items in ${endTime - startTime}ms`);
console.log(`${validCount} items were valid`);
console.log(
  `Average: ${((endTime - startTime) / testData.length).toFixed(
    4
  )}ms per validation`
);

console.log(
  "\n🎉 Examples completed! Check the documentation for more advanced usage patterns."
);
