import { Customer } from "@/components/customer-search";

export interface CustomerSearchResponse {
  data: Customer[];
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PriceHeaderResponse {
  data: PriceHeader[];
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PriceItemResponse {
  data: PriceItem[];
  success: boolean;
  message?: string;
  errors?: string[];
}

// Customer entity
export interface CustomerInfo {
  customerId: string;
  customerName: string;
  oracleCustomerId?: string;
  customerCode?: string;
  contactEmail?: string;
  contactPhone?: string;
}

// PriceHeader entity (belongs to Customer)
export interface PriceHeader {
  priceHeaderId: string;
  customerId: string;
  headerName: string;
  description?: string;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "in-progress" | "new";
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

// PriceItem entity (belongs to PriceHeader)
export interface PriceItem {
  priceItemId: string;
  priceHeaderId: string;
  productName: string;
  region: string;
  unitPrice: number;
  minimumPrice: number;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "in-progress" | "new";
  quoteName?: string;
  projectName?: string;
  uom?: string;
  contractId?: string;
  generatorId?: string;
  vendorId?: string;
  containerSize?: string;
  billingUom?: string;
  // Additional fields from the original pricing system
  pricingType?: string;
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

export class CustomerService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  async searchCustomers(searchTerm: string): Promise<CustomerSearchResponse> {
    try {
      const response = await this.makeApiCall<CustomerSearchResponse>(
        `/customers/search?q=${encodeURIComponent(searchTerm)}`
      );
      return response;
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to search customers",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  async getCustomerInfo(customerId: string): Promise<CustomerInfo | null> {
    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockCustomer: CustomerInfo = {
        customerId: customerId,
        customerName: "Acme Corporation",
        oracleCustomerId: "ORC001",
        customerCode: "ACME",
        contactEmail: "pricing@acme.com",
        contactPhone: "(555) 123-4567",
      };

      return mockCustomer;
    } catch (error) {
      console.error("Failed to get customer info:", error);
      return null;
    }
  }

  // Get all price headers for a customer
  async getCustomerPriceHeaders(
    customerId: string
  ): Promise<PriceHeaderResponse> {
    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockPriceHeaders: PriceHeader[] = [
        {
          priceHeaderId: "PH-001",
          customerId: customerId,
          headerName: "Q-2024-001",
          description: "Standard pricing for Acme Corporation",
          effectiveDate: "2024-01-01",
          expirationDate: "2024-12-31",
          status: "active",
          invoiceMinimum: 500.0,
          container55gMinimum: 200.0,
          absoluteContainerMinimum: 100.0,
          priceItemCount: 5,
          totalValue: 1250.0,
        },
        {
          priceHeaderId: "PH-002",
          customerId: customerId,
          headerName: "Q-2024-101",
          description: "Special pricing for environmental cleanup project",
          effectiveDate: "2024-02-01",
          expirationDate: "2024-12-31",
          status: "active",
          invoiceMinimum: 750.0,
          container55gMinimum: 300.0,
          absoluteContainerMinimum: 150.0,
          priceItemCount: 3,
          totalValue: 850.0,
        },
        {
          priceHeaderId: "PH-003",
          customerId: customerId,
          headerName: "Q-2024-301",
          description: "Draft pricing for Q2 2024",
          effectiveDate: "2024-04-01",
          expirationDate: "2024-06-30",
          status: "in-progress",
          invoiceMinimum: 600.0,
          container55gMinimum: 250.0,
          absoluteContainerMinimum: 120.0,
          priceItemCount: 2,
          totalValue: 450.0,
        },
      ];

      return {
        data: mockPriceHeaders,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to get customer price headers",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  // Get all price items for a specific price header
  async getPriceHeaderItems(priceHeaderId: string): Promise<PriceItemResponse> {
    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Generate unique IDs based on the price header ID
      const headerSuffix = priceHeaderId.split("-")[1]; // Extract the number from PH-001, PH-002, etc.

      const mockPriceItems: PriceItem[] = [
        {
          priceItemId: `PI-${headerSuffix}-001`,
          priceHeaderId: priceHeaderId,
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
        {
          priceItemId: `PI-${headerSuffix}-002`,
          priceHeaderId: priceHeaderId,
          productName: "Recycling Services",
          region: "Northeast",
          unitPrice: 85.25,
          minimumPrice: 300.0,
          effectiveDate: "2024-01-01",
          expirationDate: "2024-12-31",
          status: "active",
          quoteName: "Q-2024-002",
          projectName: "Tech Solutions Recycling",
          uom: "Per Ton",
          contractId: "CON-002",
          generatorId: "GEN-002",
          vendorId: "VEND-002",
          containerSize: "30 Gallon",
          billingUom: "Per Container",
          pricingType: "Product-specific",
          pricePriority: "2",
        },
        {
          priceItemId: `PI-${headerSuffix}-003`,
          priceHeaderId: priceHeaderId,
          productName: "Waste Transportation",
          region: "Northeast",
          unitPrice: 45.75,
          minimumPrice: 200.0,
          effectiveDate: "2024-01-01",
          expirationDate: "2024-12-31",
          status: "active",
          quoteName: "Q-2024-003",
          projectName: "Global Industries Transport",
          uom: "Per Mile",
          contractId: "CON-003",
          generatorId: "GEN-003",
          vendorId: "VEND-003",
          containerSize: "20 Gallon",
          billingUom: "Per Trip",
          pricingType: "Regional",
          pricePriority: "3",
        },
        {
          priceItemId: `PI-${headerSuffix}-004`,
          priceHeaderId: priceHeaderId,
          productName: "Hazardous Waste Disposal",
          region: "Southeast",
          unitPrice: 135.0,
          minimumPrice: 550.0,
          effectiveDate: "2024-01-01",
          expirationDate: "2024-12-31",
          status: "in-progress",
          quoteName: "Q-2024-004",
          projectName: "Clean Earth Southeast",
          uom: "Per Ton",
          contractId: "CON-004",
          generatorId: "GEN-004",
          vendorId: "VEND-004",
          containerSize: "55 Gallon",
          billingUom: "Per Container",
          pricingType: "Regional",
          pricePriority: "1",
        },
        {
          priceItemId: `PI-${headerSuffix}-005`,
          priceHeaderId: priceHeaderId,
          productName: "Environmental Consulting",
          region: "Northeast",
          unitPrice: 150.0,
          minimumPrice: 750.0,
          effectiveDate: "2024-02-01",
          expirationDate: "2024-12-31",
          status: "active",
          quoteName: "Q-2024-005",
          projectName: "Eco Solutions Consulting",
          uom: "Per Hour",
          contractId: "CON-005",
          generatorId: "GEN-005",
          vendorId: "VEND-005",
          containerSize: "N/A",
          billingUom: "Per Hour",
          pricingType: "Profile-specific",
          pricePriority: "1",
        },
      ];

      return {
        data: mockPriceItems,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: "Failed to get price header items",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  // Get a specific price header with its items
  async getPriceHeaderWithItems(priceHeaderId: string): Promise<{
    header: PriceHeader | null;
    items: PriceItem[];
  }> {
    try {
      // Simulate API call - replace with actual implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock price header
      const mockHeader: PriceHeader = {
        priceHeaderId: priceHeaderId,
        customerId: "1", // This would come from the actual request
        headerName: "Standard Pricing 2024",
        description: "Standard pricing for Acme Corporation",
        effectiveDate: "2024-01-01",
        expirationDate: "2024-12-31",
        status: "new",
        invoiceMinimum: 500.0,
        container55gMinimum: 200.0,
        absoluteContainerMinimum: 100.0,
      };

      // Get items for this header
      const itemsResponse = await this.getPriceHeaderItems(priceHeaderId);

      return {
        header: mockHeader,
        items: itemsResponse.success ? itemsResponse.data : [],
      };
    } catch (error) {
      console.error("Failed to get price header with items:", error);
      return {
        header: null,
        items: [],
      };
    }
  }

  // Create a new price header (group) with line items
  async createPriceHeaderWithItems(
    customerId: string,
    headerName: string,
    headerTemplate: string,
    items: any[][]
  ): Promise<{ success: boolean; priceHeaderId?: string; message?: string }> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Generate a new mock priceHeaderId
    const newId = `PH-${Math.floor(Math.random() * 10000)}`;
    // In a real implementation, you would POST to the backend here
    return { success: true, priceHeaderId: newId };
  }

  // Helper method to make actual API calls when ready
  private async makeApiCall<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export a singleton instance
export const customerService = new CustomerService();
