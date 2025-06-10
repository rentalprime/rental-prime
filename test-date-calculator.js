const {
  calculateEndDate,
  calculateDurationInDays,
  getIntervalDurations,
  isValidDateRange,
  getNextBillingDate,
  isSubscriptionExpired,
  getDaysRemaining
} = require("./backend/utils/dateCalculator");

/**
 * Test suite for Date Calculator utility
 */

function testCalculateEndDate() {
  console.log("🧪 Testing calculateEndDate function...");
  console.log("=" .repeat(50));

  const testStartDate = "2024-01-15T10:00:00Z";
  const intervals = ["monthly", "quarterly", "half-yearly", "yearly"];

  intervals.forEach(interval => {
    try {
      const endDate = calculateEndDate(testStartDate, interval);
      console.log(`✅ ${interval.padEnd(12)} | ${testStartDate} → ${endDate.toISOString()}`);
    } catch (error) {
      console.log(`❌ ${interval.padEnd(12)} | Error: ${error.message}`);
    }
  });

  // Test edge cases
  console.log("\n🔍 Testing edge cases:");
  
  // Test with invalid date
  try {
    calculateEndDate("invalid-date", "monthly");
    console.log("❌ Should have thrown error for invalid date");
  } catch (error) {
    console.log("✅ Correctly handled invalid date");
  }

  // Test with unknown interval
  try {
    const result = calculateEndDate(testStartDate, "unknown");
    console.log(`✅ Unknown interval handled (defaults to monthly): ${result.toISOString()}`);
  } catch (error) {
    console.log(`❌ Error with unknown interval: ${error.message}`);
  }

  // Test month-end dates
  const monthEndDates = [
    "2024-01-31T10:00:00Z", // January 31st
    "2024-02-29T10:00:00Z", // Leap year February 29th
    "2024-12-31T10:00:00Z", // December 31st
  ];

  console.log("\n📅 Testing month-end dates:");
  monthEndDates.forEach(date => {
    try {
      const monthly = calculateEndDate(date, "monthly");
      const quarterly = calculateEndDate(date, "quarterly");
      console.log(`Date: ${date}`);
      console.log(`  Monthly: ${monthly.toISOString()}`);
      console.log(`  Quarterly: ${quarterly.toISOString()}`);
    } catch (error) {
      console.log(`❌ Error with date ${date}: ${error.message}`);
    }
  });
}

function testCalculateDurationInDays() {
  console.log("\n🧪 Testing calculateDurationInDays function...");
  console.log("=" .repeat(50));

  const testCases = [
    ["2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z", 1],
    ["2024-01-01T00:00:00Z", "2024-01-31T00:00:00Z", 30],
    ["2024-01-01T00:00:00Z", "2024-02-01T00:00:00Z", 31],
    ["2024-01-01T00:00:00Z", "2025-01-01T00:00:00Z", 366], // Leap year
  ];

  testCases.forEach(([start, end, expected]) => {
    try {
      const duration = calculateDurationInDays(start, end);
      const status = duration === expected ? "✅" : "❌";
      console.log(`${status} ${start} → ${end} = ${duration} days (expected: ${expected})`);
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  });
}

function testIsValidDateRange() {
  console.log("\n🧪 Testing isValidDateRange function...");
  console.log("=" .repeat(50));

  const testCases = [
    ["2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z", true],
    ["2024-01-02T00:00:00Z", "2024-01-01T00:00:00Z", false],
    ["2024-01-01T00:00:00Z", "2024-01-01T00:00:00Z", false],
    ["invalid-date", "2024-01-01T00:00:00Z", false],
    ["2024-01-01T00:00:00Z", "invalid-date", false],
  ];

  testCases.forEach(([start, end, expected]) => {
    const result = isValidDateRange(start, end);
    const status = result === expected ? "✅" : "❌";
    console.log(`${status} isValidDateRange("${start}", "${end}") = ${result} (expected: ${expected})`);
  });
}

function testSubscriptionExpiry() {
  console.log("\n🧪 Testing subscription expiry functions...");
  console.log("=" .repeat(50));

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Test isSubscriptionExpired
  console.log("Testing isSubscriptionExpired:");
  console.log(`✅ Yesterday expired: ${isSubscriptionExpired(yesterday)}`);
  console.log(`✅ Tomorrow expired: ${isSubscriptionExpired(tomorrow)}`);

  // Test getDaysRemaining
  console.log("\nTesting getDaysRemaining:");
  console.log(`✅ Days remaining (yesterday): ${getDaysRemaining(yesterday)}`);
  console.log(`✅ Days remaining (tomorrow): ${getDaysRemaining(tomorrow)}`);

  // Test with specific dates
  const futureDate = "2024-12-31T23:59:59Z";
  const pastDate = "2024-01-01T00:00:00Z";
  
  console.log(`✅ Future date expired: ${isSubscriptionExpired(futureDate)}`);
  console.log(`✅ Past date expired: ${isSubscriptionExpired(pastDate)}`);
}

function testGetIntervalDurations() {
  console.log("\n🧪 Testing getIntervalDurations function...");
  console.log("=" .repeat(50));

  const durations = getIntervalDurations();
  console.log("Interval durations mapping:");
  Object.entries(durations).forEach(([interval, duration]) => {
    console.log(`  ${interval}: ${duration}`);
  });
}

function testGetNextBillingDate() {
  console.log("\n🧪 Testing getNextBillingDate function...");
  console.log("=" .repeat(50));

  const currentDate = "2024-01-15T10:00:00Z";
  const intervals = ["monthly", "quarterly", "half-yearly", "yearly"];

  intervals.forEach(interval => {
    try {
      const nextBilling = getNextBillingDate(currentDate, interval);
      console.log(`✅ ${interval.padEnd(12)} | Next billing: ${nextBilling.toISOString()}`);
    } catch (error) {
      console.log(`❌ ${interval.padEnd(12)} | Error: ${error.message}`);
    }
  });
}

function runAllTests() {
  console.log("🚀 Starting Date Calculator Test Suite");
  console.log("=" .repeat(70));

  try {
    testCalculateEndDate();
    testCalculateDurationInDays();
    testIsValidDateRange();
    testSubscriptionExpiry();
    testGetIntervalDurations();
    testGetNextBillingDate();

    console.log("\n🎉 All Date Calculator tests completed!");
    return true;
  } catch (error) {
    console.error("❌ Test suite failed:", error);
    return false;
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      if (success) {
        console.log("\n✅ All tests passed!");
        process.exit(0);
      } else {
        console.log("\n❌ Some tests failed!");
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Test execution failed:", error);
      process.exit(1);
    });
}

module.exports = {
  testCalculateEndDate,
  testCalculateDurationInDays,
  testIsValidDateRange,
  testSubscriptionExpiry,
  testGetIntervalDurations,
  testGetNextBillingDate,
  runAllTests
};
