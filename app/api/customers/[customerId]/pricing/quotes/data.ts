// In-memory singleton for price quotes and items
let quotes: any[] = [
  {
    priceHeaderId: "PH-001",
    customerId: "1",
    headerName: "Q-2025-07-10",
    description: "Standard pricing for Acme Corporation",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "active",
    assignedTeamMember: "Sarah Johnson",
    assignmentNotes: "High priority customer - needs quick turnaround",
    items: [
      {
        priceItemId: "PI-001-001",
        priceHeaderId: "PH-001",
        productName: "Hazardous Waste Disposal",
        region: "Northeast",
        unitPrice: 125.5,
        minimumPrice: 500.0,
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        status: "active",
        quoteName: "Q-2024-001",
        projectName: "Acme Corp Cleanup",
        uom: "Per Ton",
        contractId: "CON-001",
        generatorId: "GEN-001",
        vendorId: "VEND-001",
        containerSize: "55 Gallon",
        billingUom: "Per Container",
        pricingType: "Regional",
        pricePriority: "1",
      },
    ],
  },
  {
    priceHeaderId: "PH-002",
    customerId: "1",
    headerName: "Q-2025-07-11",
    description: "Additional pricing for Acme Corporation",
    effectiveDate: "2024-02-01",
    expirationDate: "2024-12-31",
    status: "active",
    assignedTeamMember: "David Brown",
    assignmentNotes: "Complex pricing structure - review carefully",
    items: [
      {
        priceItemId: "PI-002-001",
        priceHeaderId: "PH-002",
        productName: "Hazardous Waste Disposal",
        region: "Southeast",
        unitPrice: 135.0,
        minimumPrice: 600.0,
        effectiveDate: "2024-02-01",
        expirationDate: "2024-12-31",
        status: "active",
        quoteName: "Q-2024-002",
        projectName: "Acme Corp Expansion",
        uom: "Per Ton",
        contractId: "CON-002",
        generatorId: "GEN-002",
        vendorId: "VEND-002",
        containerSize: "55 Gallon",
        billingUom: "Per Container",
        pricingType: "Regional",
        pricePriority: "1",
      },
    ],
  },
];

export function getQuotes() {
  return quotes;
}

export function addQuote(quote: any) {
  quotes.push(quote);
}
