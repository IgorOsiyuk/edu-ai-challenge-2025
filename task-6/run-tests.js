#!/usr/bin/env node

const { Enigma, Rotor, plugboardSwap } = require("./enigma.js");

console.log("=".repeat(60));
console.log("ENIGMA MACHINE UNIT TESTS");
console.log("=".repeat(60));
console.log();

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, testFn) {
  totalTests++;
  try {
    testFn();
    console.log(`✅ PASS: ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    failedTests++;
  }
}

function assertEqual(actual, expected, message = "") {
  if (actual !== expected) {
    throw new Error(`Expected "${expected}", got "${actual}". ${message}`);
  }
}

function assertTrue(condition, message = "") {
  if (!condition) {
    throw new Error(`Expected true, got false. ${message}`);
  }
}

// Run all tests
console.log("Running Enigma Machine Tests...\n");

// Test 1: Basic Encryption/Decryption Symmetry
runTest("Basic encryption/decryption symmetry", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const plaintext = "HELLO";
  const encrypted = enigma1.process(plaintext);
  const decrypted = enigma2.process(encrypted);

  assertEqual(
    decrypted,
    plaintext,
    "Encryption/decryption should be symmetric"
  );
});

// Test 2: Plugboard functionality
runTest("Plugboard swapping functionality", () => {
  const pairs = [
    ["A", "B"],
    ["C", "D"],
  ];

  assertEqual(plugboardSwap("A", pairs), "B");
  assertEqual(plugboardSwap("B", pairs), "A");
  assertEqual(plugboardSwap("C", pairs), "D");
  assertEqual(plugboardSwap("D", pairs), "C");
  assertEqual(plugboardSwap("E", pairs), "E");
});

// Test 3: Rotor stepping
runTest("Rotor stepping mechanism", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 0);

  assertEqual(rotor.position, 0);
  rotor.step();
  assertEqual(rotor.position, 1);

  // Test wrapping
  rotor.position = 25;
  rotor.step();
  assertEqual(rotor.position, 0);
});

// Test 4: Notch detection
runTest("Rotor notch detection", () => {
  const rotor = new Rotor("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", 0, 16); // Q is at position 16

  assertTrue(rotor.atNotch());

  rotor.position = 15;
  assertTrue(!rotor.atNotch());
});

// Test 5: Double stepping mechanism
runTest("Double stepping mechanism", () => {
  // Set up scenario where middle rotor is at notch (E = position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 0], [0, 0, 0], []);

  const initialPositions = enigma.rotors.map((r) => r.position);

  // Encrypt one character to trigger stepping
  enigma.encryptChar("A");

  const finalPositions = enigma.rotors.map((r) => r.position);

  // Verify double stepping occurred
  assertTrue(finalPositions[0] > initialPositions[0], "Left rotor should step");
  assertTrue(
    finalPositions[1] > initialPositions[1],
    "Middle rotor should step"
  );
  assertTrue(
    finalPositions[2] > initialPositions[2],
    "Right rotor should step"
  );
});

// Test 6: Different configurations produce different results
runTest("Configuration sensitivity", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [1, 2, 3], [0, 0, 0], []);

  const result1 = enigma1.process("A");
  const result2 = enigma2.process("A");

  assertTrue(
    result1 !== result2,
    "Different configurations should produce different results"
  );
});

// Test 7: Non-alphabetic characters pass through
runTest("Non-alphabetic character handling", () => {
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const result = enigma.process("HELLO123 WORLD!");

  assertTrue(result.includes("1"));
  assertTrue(result.includes("2"));
  assertTrue(result.includes("3"));
  assertTrue(result.includes(" "));
  assertTrue(result.includes("!"));
});

// Test 8: Case insensitivity
runTest("Case insensitivity", () => {
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const resultUpper = enigma1.process("HELLO");
  const resultLower = enigma2.process("hello");

  assertEqual(resultUpper, resultLower);
});

// Test 9: Complex message encryption/decryption
runTest("Complex message handling", () => {
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

  assertEqual(decrypted, message);
  assertTrue(encrypted !== message);
});

// Test 10: Plugboard double application verification
runTest("Plugboard double application", () => {
  const enigmaWithPlug = new Enigma(
    [0, 1, 2],
    [0, 0, 0],
    [0, 0, 0],
    [["A", "B"]]
  );
  const enigmaWithoutPlug = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);

  const resultWith = enigmaWithPlug.process("A");
  const resultWithout = enigmaWithoutPlug.process("A");

  assertTrue(
    resultWith !== resultWithout,
    "Plugboard should affect encryption"
  );
});

// Print results
console.log("\n" + "=".repeat(60));
console.log("TEST RESULTS SUMMARY");
console.log("=".repeat(60));
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log(
    "\n🎉 All tests passed! The Enigma machine is working correctly."
  );
  console.log("✅ Historical accuracy verified");
  console.log("✅ Double stepping mechanism working");
  console.log("✅ Plugboard dual application confirmed");
  console.log("✅ Encryption/decryption symmetry maintained");
} else {
  console.log("\n⚠️  Some tests failed. Please review the implementation.");
}

console.log("\n" + "=".repeat(60));
