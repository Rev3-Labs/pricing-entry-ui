import { saveSampleDataToLocalStorage } from "./generate-sample-data";

// Generate and save sample data
console.log("Generating and saving sample data...");
try {
  const data = saveSampleDataToLocalStorage();
  console.log("✅ Sample data generated and saved successfully!");
  console.log(`📊 Generated ${data.customers.length} customers`);
  console.log(`📊 Generated ${data.priceHeaders.length} price headers`);
  console.log(`📊 Generated ${data.priceItems.length} price items`);

  // Show some examples of the price headers
  console.log("\n📋 Sample Price Headers:");
  data.priceHeaders.slice(0, 5).forEach((header, index) => {
    console.log(`${index + 1}. ${header.headerName} (${header.status})`);
    console.log(`   Invoice Min: $${header.invoiceMinimum}`);
    console.log(`   Created: ${header.createdAt}`);
  });
} catch (error) {
  console.error("❌ Error generating sample data:", error);
}
