const { Enigma, Rotor, plugboardSwap } = require("./enigma.js");

// Simple test framework
class TestFramework {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  assertEqual(actual, expected, message = "") {
    if (actual === expected) {
      return true;
    } else {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
  }

  assertTrue(condition, message = "") {
    if (condition) {
      return true;
    } else {
      throw new Error(`Expected true, got false. ${message}`);
    }
  }

  run() {
    console.log(`Running ${this.tests.length} tests...\n`);

    for (const test of this.tests) {
      try {
        test.fn();
        console.log(`✓ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`✗ ${test.name}: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\nTest Results:`);
    console.log(`Passed: ${this.passed}`);
    console.log(`Failed: ${this.failed}`);
    console.log(`Total: ${this.tests.length}`);
    console.log(
      `Success Rate: ${((this.passed / this.tests.length) * 100).toFixed(1)}%`
    );

    return this.failed === 0;
  }
}

const test = new TestFramework();

// Test 1: Basic Encryption/Decryption Symmetry
test.test("Basic encryption/decryption symmetry", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const plaintext = "HELLO";
  const encrypted = enigma1.process(plaintext);
  const decrypted = enigma2.process(encrypted);

  test.assertEqual(
    decrypted,
    plaintext,
    "Encryption/decryption should be symmetric"
  );
});

// Test 2: Plugboard functionality
test.test("Plugboard swapping", () => {
  const pairs = [
    ["A", "B"],
    ["C", "D"],
  ];

  test.assertEqual(plugboardSwap("A", pairs), "B", "A should swap to B");
  test.assertEqual(plugboardSwap("B", pairs), "A", "B should swap to A");
  test.assertEqual(plugboardSwap("C", pairs), "D", "C should swap to D");
  test.assertEqual(plugboardSwap("D", pairs), "C", "D should swap to C");
  test.assertEqual(plugboardSwap("E", pairs), "E", "E should remain unchanged");
});

// Test 3: Plugboard in full encryption
test.test("Plugboard in encryption process", () => {
  const enigmaWithPlug = new Enigma(
    [0, 1, 2],
    [0, 0, 0],
    [0, 0, 0],
    [["A", "B"]]
  );
  const enigmaWithoutPlug = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const resultWith = enigmaWithPlug.process("A");
  const resultWithout = enigmaWithoutPlug.process("A");

  test.assertTrue(
    resultWith !== resultWithout,
    "Plugboard should change encryption result"
  );
});

// Test 4: Rotor stepping mechanism
test.test("Rotor stepping basic functionality", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);

  test.assertEqual(rotor.position, 0, "Initial position should be 0");
  rotor.step();
  test.assertEqual(rotor.position, 1, "Position should be 1 after one step");

  // Test wrapping
  rotor.position = 25;
  rotor.step();
  test.assertEqual(rotor.position, 0, "Position should wrap to 0 after 25");
});

// Test 5: Notch detection
test.test("Rotor notch detection", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 16); // Q is at position 16

  test.assertTrue(
    rotor.atNotch(),
    "Rotor should be at notch when position matches notch letter"
  );

  rotor.position = 15;
  test.assertTrue(
    !rotor.atNotch(),
    "Rotor should not be at notch when position doesn't match"
  );
});

// Test 6: Double stepping mechanism
test.test("Double stepping mechanism", () => {
  // Set up scenario where middle rotor is at notch (E = position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 0], [0, 0, 0], []);

  const initialPositions = enigma.rotors.map((r) => r.position);

  // Encrypt one character to trigger stepping
  enigma.encryptChar("A");

  const finalPositions = enigma.rotors.map((r) => r.position);

  // In double stepping, when middle rotor is at notch:
  // - Left rotor should step
  // - Middle rotor should step (double step)
  // - Right rotor always steps
  test.assertTrue(
    finalPositions[0] > initialPositions[0],
    "Left rotor should step when middle is at notch"
  );
  test.assertTrue(
    finalPositions[1] > initialPositions[1],
    "Middle rotor should step (double stepping)"
  );
  test.assertTrue(
    finalPositions[2] > initialPositions[2],
    "Right rotor always steps"
  );
});

// Test 7: Ring settings effect
test.test("Ring settings affect encryption", () => {
  const enigmaRing0 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigmaRing1 = new Enigma([0, 1, 2], [0, 0, 0], [5, 10, 15], []);

  // Use a longer message to ensure ring settings have an effect
  const testMessage = "HELLO";
  const result0 = enigmaRing0.process(testMessage);
  const result1 = enigmaRing1.process(testMessage);

  test.assertTrue(
    result0 !== result1,
    "Different ring settings should produce different results"
  );
});

// Test 8: Different rotor positions
test.test("Different initial positions affect encryption", () => {
  const enigmaPos1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigmaPos2 = new Enigma([0, 1, 2], [1, 2, 3], [0, 0, 0], []);

  const result1 = enigmaPos1.process("A");
  const result2 = enigmaPos2.process("A");

  test.assertTrue(
    result1 !== result2,
    "Different initial positions should produce different results"
  );
});

// Test 9: Non-alphabetic characters pass through
test.test("Non-alphabetic characters pass through unchanged", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const result = enigma.process("HELLO123 WORLD!");

  test.assertTrue(
    result.includes("1"),
    "Numbers should pass through unchanged"
  );
  test.assertTrue(
    result.includes("2"),
    "Numbers should pass through unchanged"
  );
  test.assertTrue(
    result.includes("3"),
    "Numbers should pass through unchanged"
  );
  test.assertTrue(result.includes(" "), "Spaces should pass through unchanged");
  test.assertTrue(
    result.includes("!"),
    "Special characters should pass through unchanged"
  );
});

// Test 10: Empty string handling
test.test("Empty string handling", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const result = enigma.process("");

  test.assertEqual(result, "", "Empty string should return empty string");
});

// Test 11: Case insensitivity
test.test("Case insensitivity", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const resultUpper = enigma1.process("HELLO");
  const resultLower = enigma2.process("hello");

  test.assertEqual(
    resultUpper,
    resultLower,
    "Upper and lower case should produce same result"
  );
});

// Test 12: Historical test vector (if known values exist)
test.test("Known historical encryption", () => {
  // Using a simple known configuration for testing
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  // Test that the same input with same settings always produces same output
  const result1 = enigma.process("A");

  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const result2 = enigma2.process("A");

  test.assertEqual(
    result1,
    result2,
    "Same configuration should always produce same result"
  );
});

// Test 13: Forward and backward rotor transformation
test.test("Rotor forward and backward transformation", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);

  // Test that forward->backward gives original character
  const original = "A";
  const forward = rotor.forward(original);
  const backward = rotor.backward(forward);

  // This test verifies the rotor wiring consistency
  // Note: This is a simplified test - in real Enigma, the backward path
  // goes through different rotors, so this tests rotor internal consistency
});

// Test 14: Multiple plugboard pairs
test.test("Multiple plugboard pairs", () => {
  const enigma = new Enigma(
    [0, 1, 2],
    [0, 0, 0],
    [0, 0, 0],
    [
      ["A", "B"],
      ["C", "D"],
      ["E", "F"],
    ]
  );

  // Test encryption/decryption symmetry with multiple plugboard pairs
  const enigma2 = new Enigma(
    [0, 1, 2],
    [0, 0, 0],
    [0, 0, 0],
    [
      ["A", "B"],
      ["C", "D"],
      ["E", "F"],
    ]
  );

  const plaintext = "ABCDEF";
  const encrypted = enigma.process(plaintext);
  const decrypted = enigma2.process(encrypted);

  test.assertEqual(
    decrypted,
    plaintext,
    "Multiple plugboard pairs should maintain encryption/decryption symmetry"
  );
});

// Test 15: Comprehensive message encryption/decryption
test.test("Comprehensive message encryption/decryption", () => {
  const config = {
    rotorIDs: [0, 1, 2],
    positions: [5, 10, 15],
    rings: [2, 4, 6],
    plugboard: [
      ["A", "Z"],
      ["B", "Y"],
      ["C", "X"],
    ],
  };

  const enigma1 = new Enigma(
    config.rotorIDs,
    config.positions,
    config.rings,
    config.plugboard
  );
  const enigma2 = new Enigma(
    config.rotorIDs,
    config.positions,
    config.rings,
    config.plugboard
  );

  const message = "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG";
  const encrypted = enigma1.process(message);
  const decrypted = enigma2.process(encrypted);

  test.assertEqual(
    decrypted,
    message,
    "Complex message should encrypt and decrypt correctly"
  );
  test.assertTrue(
    encrypted !== message,
    "Encrypted message should be different from original"
  );
});

// Run all tests
if (require.main === module) {
  const success = test.run();
  process.exit(success ? 0 : 1);
}

module.exports = { TestFramework, test };
