// In-memory singleton for price groups and items
let groups: any[] = [
  {
    priceHeaderId: "PH-001",
    customerId: "1",
    headerName: "Standard Pricing 2024",
    description: "Standard pricing for Acme Corporation",
    effectiveDate: "2024-01-01",
    expirationDate: "2024-12-31",
    status: "active",
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
];

export function getGroups() {
  return groups;
}

export function addGroup(group: any) {
  groups.push(group);
}
