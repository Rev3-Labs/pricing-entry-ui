// Define types locally to avoid circular dependencies
export interface CustomerInfo {
  customerId: string;
  customerName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  oracleCustomerId?: string;
  customerCode?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface PriceHeader {
  priceHeaderId: string;
  customerId: string;
  headerName: string;
  description?: string;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "inactive" | "in-progress" | "new";
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  termsAndConditionsId?: string;
  invoiceMinimum?: number;
  container55gMinimum?: number;
  absoluteContainerMinimum?: number;
  regionalPricingId?: number;
  conversionRateId?: number;
  customerPricingTierId?: number;
  createdByUser?: number;
  createdTimestamp?: string;
  updateByUser?: number;
  updateTimestamp?: string;
  // Computed fields for display
  priceItemCount?: number;
  totalValue?: number;
}

export interface PriceItem {
  priceItemId: string;
  priceHeaderId: string;
  productName: string;
  region: string;
  unitPrice: number;
  minimumPrice: number;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "inactive" | "in-progress" | "new";
  quoteName?: string;
  projectName?: string;
  uom?: string;
  contractId?: string;
  generatorId?: string;
  vendorId?: string;
  containerSize?: string;
  billingUom?: string;
  pricingType?: string;
  facilityName?: string;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  pricePriority?: string;
  productId?: string;
  regionId?: string;
  profileId?: string;
  generatorRegionId?: string;
  createdByUser?: number;
  createdTimestamp?: string;
  updateByUser?: number;
  updateTimestamp?: string;
}

// Sample data arrays for generating realistic data
const customerNames = [
  "Industrial Manufacturing Co",
  "Chemical Processing Plant",
  "Automotive Assembly Facility",
  "Pharmaceutical Manufacturing",
  "Oil & Gas Refinery",
  "Electronics Manufacturing",
  "Paint & Coatings Factory",
  "Metal Processing Plant",
  "Textile Manufacturing",
  "Food Processing Facility",
];

const productNames = [
  "FB-L-10",
  "LF-01",
  "SOL-05",
  "ACID-02",
  "ALK-03",
  "OIL-15",
  "PAINT-08",
  "CHEM-12",
  "BAT-20",
  "ELEC-25",
  "METAL-30",
  "PLASTIC-35",
  "FIBER-40",
  "SLUDGE-45",
  "ASH-50",
  "SOIL-55",
  "WATER-60",
  "GAS-65",
  "LIQUID-70",
  "SOLID-75",
  "HAZ-80",
  "NON-HAZ-85",
  "UNIVERSAL-90",
  "RCRA-95",
  "TSCA-100",
];

const regions = ["North", "South", "East", "West", "Central"];
const statuses = ["active", "inactive", "in-progress", "new"];
const uomOptions = ["Each", "Gallon", "Pound", "Container", "Ton"];
const containerSizes = ["5G", "15G", "20G", "30G", "55G", "Tri-Wall", "275G"];
const pricingTypes = ["Standard", "Premium", "Bulk", "Contract", "Spot"];
const facilityNames = [
  "Baltimore",
  "Philadelphia",
  "Pittsburgh",
  "Richmond",
  "Norfolk",
  "Charlotte",
  "Atlanta",
  "Jacksonville",
  "Tampa",
  "Miami",
  "Orlando",
  "Houston",
  "Dallas",
  "Austin",
  "San Antonio",
  "Phoenix",
  "Los Angeles",
  "San Francisco",
  "Seattle",
  "Portland",
  "Denver",
  "Chicago",
  "Detroit",
  "Cleveland",
  "Cincinnati",
  "Indianapolis",
  "Nashville",
  "Memphis",
  "New Orleans",
  "Kansas City",
  "St. Louis",
  "Minneapolis",
  "Milwaukee",
  "Boston",
  "New York",
  "Newark",
  "Washington",
];

const contractPrefixes = ["CTR", "CON", "AGR", "PUR"];
const profilePrefixes = ["PROF", "PRF", "CUST", "ACC"];

// Generate random data helpers
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): string {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return date.toISOString().split("T")[0];
}

function generateCustomerId(index: number): string {
  return `CUST${String(index + 1).padStart(3, "0")}`;
}

function generatePriceHeaderId(
  customerIndex: number,
  headerIndex: number
): string {
  return `PH${String(customerIndex + 1).padStart(2, "0")}${String(
    headerIndex + 1
  ).padStart(3, "0")}`;
}

function generatePriceItemId(headerIndex: number, itemIndex: number): string {
  return `PI${String(headerIndex + 1).padStart(3, "0")}${String(
    itemIndex + 1
  ).padStart(4, "0")}`;
}

function generateContractId(): string {
  const prefix = randomElement(contractPrefixes);
  const number = randomInt(1000, 9999);
  const year = randomInt(2020, 2024);
  return `${prefix}-${number}-${year}`;
}

function generateProfileId(): string {
  const prefix = randomElement(profilePrefixes);
  const number = randomInt(100, 999);
  return `${prefix}${number}`;
}

function generateGeneratorId(): string {
  const types = ["GEN", "TURB", "ENG"];
  const type = randomElement(types);
  const number = randomInt(1, 50);
  return `${type}${String(number).padStart(2, "0")}`;
}

function generateQuoteName(customerName: string, index: number): string {
  const types = ["Annual", "Quarterly", "Project", "Contract", "Bulk"];
  const type = randomElement(types);
  const year = randomInt(2023, 2025);
  return `${customerName} ${type} Quote ${year}-${String(index + 1).padStart(
    2,
    "0"
  )}`;
}

function generateProjectName(): string {
  const projects = [
    "Site Remediation Project",
    "Waste Stream Management",
    "Environmental Cleanup",
    "Hazardous Waste Disposal",
    "Recycling Initiative",
    "Compliance Program",
    "Waste Reduction Project",
    "Environmental Assessment",
    "Treatment Facility Upgrade",
    "Waste Processing Optimization",
    "Contamination Cleanup",
    "Waste Transportation Project",
    "Environmental Monitoring",
    "Waste Minimization Program",
    "Treatment Process Improvement",
  ];
  return randomElement(projects);
}

// Generate sample data
export function generateSampleData() {
  const customers: CustomerInfo[] = [];
  const priceHeaders: PriceHeader[] = [];
  const priceItems: PriceItem[] = [];

  // Generate customers (using all available customer names)
  for (let i = 0; i < customerNames.length; i++) {
    const customer: CustomerInfo = {
      customerId: generateCustomerId(i),
      customerName: customerNames[i],
      contactName: `Contact ${i + 1}`,
      email: `contact${i + 1}@${customerNames[i]
        .toLowerCase()
        .replace(/\s+/g, "")}.com`,
      phone: `555-${String(randomInt(100, 999)).padStart(3, "0")}-${String(
        randomInt(1000, 9999)
      ).padStart(4, "0")}`,
      address: `${randomInt(100, 9999)} Main St, City ${
        i + 1
      }, ST ${String.fromCharCode(65 + i)}${String.fromCharCode(65 + i)}`,
      status: randomElement(statuses),
      createdAt: randomDate(new Date("2020-01-01"), new Date("2024-01-01")),
      updatedAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
    };
    customers.push(customer);

    // Generate 8-12 price headers per customer (40-60 total headers)
    const numHeaders = randomInt(8, 12);
    for (let j = 0; j < numHeaders; j++) {
      const header: PriceHeader = {
        priceHeaderId: generatePriceHeaderId(i, j),
        customerId: customer.customerId,
        headerName: generateQuoteName(customer.customerName, j),
        description: `Pricing header for ${
          customer.customerName
        } - ${generateProjectName()}`,
        status: randomElement(statuses) as
          | "active"
          | "inactive"
          | "in-progress"
          | "new",
        effectiveDate: randomDate(
          new Date("2023-01-01"),
          new Date("2025-12-31")
        ),
        expirationDate: randomDate(
          new Date("2024-01-01"),
          new Date("2026-12-31")
        ),
        createdAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
        updatedAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
      };
      priceHeaders.push(header);

      // Generate 30-50 price items per header (1200-3000 total items, targeting ~2000)
      const numItems = randomInt(30, 50);
      for (let k = 0; k < numItems; k++) {
        const productName = randomElement(productNames);
        const unitPrice = randomNumber(10, 5000);
        const minimumPrice = unitPrice * randomNumber(0.8, 0.95);

        const item: PriceItem = {
          priceItemId: generatePriceItemId(priceHeaders.length - 1, k),
          priceHeaderId: header.priceHeaderId,
          productName: productName,
          region: randomElement(regions),
          unitPrice: Math.round(unitPrice * 100) / 100,
          minimumPrice: Math.round(minimumPrice * 100) / 100,
          effectiveDate: randomDate(
            new Date("2023-01-01"),
            new Date("2025-12-31")
          ),
          expirationDate: randomDate(
            new Date("2024-01-01"),
            new Date("2026-12-31")
          ),
          status: randomElement(statuses) as
            | "active"
            | "inactive"
            | "in-progress"
            | "new",
          contractId: Math.random() > 0.3 ? generateContractId() : undefined,
          profileId: Math.random() > 0.3 ? generateProfileId() : undefined,
          generatorId: Math.random() > 0.5 ? generateGeneratorId() : undefined,
          containerSize: randomElement(containerSizes),
          uom: randomElement(uomOptions),
          pricingType: randomElement(pricingTypes),
          quoteName: header.headerName,
          projectName: Math.random() > 0.4 ? generateProjectName() : undefined,
          facilityName:
            Math.random() > 0.5 ? randomElement(facilityNames) : undefined,
          createdAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
          updatedAt: randomDate(new Date("2023-01-01"), new Date("2024-12-31")),
        };
        priceItems.push(item);
      }
    }
  }

  return {
    customers,
    priceHeaders,
    priceItems,
  };
}

// Function to save data to localStorage for demo purposes
export function saveSampleDataToLocalStorage() {
  console.log("saveSampleDataToLocalStorage called");

  try {
    const data = generateSampleData();
    console.log("Sample data generated:", {
      customers: data.customers.length,
      priceHeaders: data.priceHeaders.length,
      priceItems: data.priceItems.length,
    });

    // Save to localStorage
    const customersJson = JSON.stringify(data.customers);
    const headersJson = JSON.stringify(data.priceHeaders);
    const itemsJson = JSON.stringify(data.priceItems);

    console.log("JSON stringified data sizes:", {
      customers: customersJson.length,
      headers: headersJson.length,
      items: itemsJson.length,
    });

    localStorage.setItem("sampleCustomers", customersJson);
    localStorage.setItem("samplePriceHeaders", headersJson);
    localStorage.setItem("samplePriceItems", itemsJson);

    console.log("Sample data saved to localStorage successfully");
    console.log(`- ${data.customers.length} customers`);
    console.log(`- ${data.priceHeaders.length} price headers`);
    console.log(`- ${data.priceItems.length} price items`);

    // Verify the data was saved
    const savedCustomers = localStorage.getItem("sampleCustomers");
    const savedHeaders = localStorage.getItem("samplePriceHeaders");
    const savedItems = localStorage.getItem("samplePriceItems");

    console.log("Verification - saved data found:", {
      customers: savedCustomers ? "yes" : "no",
      headers: savedHeaders ? "yes" : "no",
      items: savedItems ? "yes" : "no",
    });

    return data;
  } catch (error) {
    console.error("Error in saveSampleDataToLocalStorage:", error);
    throw error;
  }
}

// Function to load sample data from localStorage
export function loadSampleDataFromLocalStorage() {
  console.log("loadSampleDataFromLocalStorage called");

  try {
    const customersRaw = localStorage.getItem("sampleCustomers");
    const priceHeadersRaw = localStorage.getItem("samplePriceHeaders");
    const priceItemsRaw = localStorage.getItem("samplePriceItems");

    console.log("Raw localStorage data found:", {
      customers: customersRaw ? "yes" : "no",
      headers: priceHeadersRaw ? "yes" : "no",
      items: priceItemsRaw ? "yes" : "no",
    });

    const customers = JSON.parse(customersRaw || "[]");
    const priceHeaders = JSON.parse(priceHeadersRaw || "[]");
    const priceItems = JSON.parse(priceItemsRaw || "[]");

    // Ensure numeric values are properly converted
    const processedPriceItems = priceItems.map((item: any) => ({
      ...item,
      unitPrice:
        typeof item.unitPrice === "string"
          ? parseFloat(item.unitPrice)
          : item.unitPrice,
      minimumPrice:
        typeof item.minimumPrice === "string"
          ? parseFloat(item.minimumPrice)
          : item.minimumPrice,
    }));

    console.log("Parsed data:", {
      customers: customers.length,
      priceHeaders: priceHeaders.length,
      priceItems: processedPriceItems.length,
    });

    return {
      customers,
      priceHeaders,
      priceItems: processedPriceItems,
    };
  } catch (error) {
    console.error("Error in loadSampleDataFromLocalStorage:", error);
    return {
      customers: [],
      priceHeaders: [],
      priceItems: [],
    };
  }
}

// Function to clear sample data
export function clearSampleData() {
  localStorage.removeItem("sampleCustomers");
  localStorage.removeItem("samplePriceHeaders");
  localStorage.removeItem("samplePriceItems");
  console.log("Sample data cleared from localStorage");
}

// Export for use in components
export default {
  generateSampleData,
  saveSampleDataToLocalStorage,
  loadSampleDataFromLocalStorage,
  clearSampleData,
};
