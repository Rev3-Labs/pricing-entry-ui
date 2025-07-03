import { useState, useEffect, useCallback } from "react";

// Types matching the service interfaces
export interface Customer {
  customerId: number;
  customerName: string;
  customerCode: string;
}

export interface Product {
  productId: number;
  productName: string;
  productCode: string;
  wasteStream: string;
}

export interface Region {
  regionId: number;
  regionName: string;
  regionCode: string;
}

export interface ContainerSize {
  containerSizeId: number;
  sizeName: string;
  sizeCode: string;
}

export interface BillingUom {
  billingUomId: number;
  uomName: string;
  uomCode: string;
}

export interface TermsAndConditions {
  termsId: number;
  termsName: string;
  termsCode: string;
}

export interface BasePricingHeader {
  priceHeaderId?: number;
  customerId?: number;
  termsAndConditionsId?: number;
  invoiceMinimum?: number;
  container55gMinimum?: number;
  absoluteContainerMinimum?: number;
  regionalPricingId?: number;
  conversionRateId?: number;
  customerPricingTierId?: number;
  createdByUser?: number;
  createdTimestamp?: Date;
  updateByUser?: number;
  updateTimestamp?: Date;
}

export interface BasePricing {
  basePricingId?: number;
  statusCodeId: number;
  activeInd: number;
  regionId?: number;
  customerId?: number;
  productId?: number;
  profileId?: number;
  generatorId?: number;
  contractId?: number;
  generatorRegionId?: number;
  generatorState?: string;
  vendorRegionId?: number;
  vendorId?: number;
  containerSizeId?: number;
  price?: number;
  billingUomId?: number;
  minimumPrice?: number;
  effectiveDate?: Date;
  expirationDate?: Date;
  quoteNumber?: string;
  createdByUser?: number;
  createdTimestamp?: Date;
  updateByUser?: number;
  updateTimestamp?: Date;
}

export interface PricingEntryRequest {
  header: BasePricingHeader;
  lineItems: BasePricing[];
  facilities: string[];
  generators: string[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Mock API functions - replace with actual API calls
const mockApiCall = async <T>(
  data: T,
  delay: number = 500
): Promise<ApiResponse<T>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data,
        success: true,
        message: "Success",
      });
    }, delay);
  });
};

const mockCustomers: Customer[] = [
  { customerId: 1, customerName: "Acme Corp", customerCode: "ACME" },
  { customerId: 2, customerName: "Beta Industries", customerCode: "BETA" },
  { customerId: 3, customerName: "Gamma Solutions", customerCode: "GAMMA" },
  { customerId: 4, customerName: "Delta Enterprises", customerCode: "DELTA" },
];

const mockProducts: Product[] = [
  {
    productId: 1,
    productName: "Hazardous Waste",
    productCode: "HAZ",
    wasteStream: "Hazardous",
  },
  {
    productId: 2,
    productName: "Non-Hazardous Waste",
    productCode: "NONHAZ",
    wasteStream: "Non-Hazardous",
  },
  {
    productId: 3,
    productName: "Universal Waste",
    productCode: "UNIV",
    wasteStream: "Universal",
  },
];

const mockRegions: Region[] = [
  { regionId: 1, regionName: "Northeast", regionCode: "NE" },
  { regionId: 2, regionName: "Southeast", regionCode: "SE" },
  { regionId: 3, regionName: "Midwest", regionCode: "MW" },
  { regionId: 4, regionName: "Southwest", regionCode: "SW" },
  { regionId: 5, regionName: "West Coast", regionCode: "WC" },
];

const mockContainerSizes: ContainerSize[] = [
  { containerSizeId: 1, sizeName: "10 Yard", sizeCode: "10YD" },
  { containerSizeId: 2, sizeName: "20 Yard", sizeCode: "20YD" },
  { containerSizeId: 3, sizeName: "30 Yard", sizeCode: "30YD" },
  { containerSizeId: 4, sizeName: "40 Yard", sizeCode: "40YD" },
  { containerSizeId: 5, sizeName: "Roll-off", sizeCode: "ROLL" },
  { containerSizeId: 6, sizeName: "Compactor", sizeCode: "COMP" },
];

const mockBillingUoms: BillingUom[] = [
  { billingUomId: 1, uomName: "Per Ton", uomCode: "TON" },
  { billingUomId: 2, uomName: "Per Yard", uomCode: "YD" },
  { billingUomId: 3, uomName: "Per Haul", uomCode: "HAUL" },
  { billingUomId: 4, uomName: "Per Month", uomCode: "MONTH" },
  { billingUomId: 5, uomName: "Per Service", uomCode: "SERVICE" },
];

const mockTerms: TermsAndConditions[] = [
  { termsId: 1, termsName: "Net 30", termsCode: "NET30" },
  { termsId: 2, termsName: "Net 45", termsCode: "NET45" },
  { termsId: 3, termsName: "Net 60", termsCode: "NET60" },
  { termsId: 4, termsName: "Due on Receipt", termsCode: "DOR" },
];

const mockFacilities: string[] = [
  "Facility A",
  "Facility B",
  "Facility C",
  "Facility D",
  "Facility E",
];
const mockGenerators: string[] = [
  "Generator 1",
  "Generator 2",
  "Generator 3",
  "Generator 4",
  "Generator 5",
];

export const usePricingService = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [containerSizes, setContainerSizes] = useState<ContainerSize[]>([]);
  const [billingUoms, setBillingUoms] = useState<BillingUom[]>([]);
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [generators, setGenerators] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all reference data
  const loadReferenceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        customersResponse,
        productsResponse,
        regionsResponse,
        containerSizesResponse,
        billingUomsResponse,
        termsResponse,
        facilitiesResponse,
        generatorsResponse,
      ] = await Promise.all([
        mockApiCall(mockCustomers),
        mockApiCall(mockProducts),
        mockApiCall(mockRegions),
        mockApiCall(mockContainerSizes),
        mockApiCall(mockBillingUoms),
        mockApiCall(mockTerms),
        mockApiCall(mockFacilities),
        mockApiCall(mockGenerators),
      ]);

      setCustomers(customersResponse.data);
      setProducts(productsResponse.data);
      setRegions(regionsResponse.data);
      setContainerSizes(containerSizesResponse.data);
      setBillingUoms(billingUomsResponse.data);
      setTerms(termsResponse.data);
      setFacilities(facilitiesResponse.data);
      setGenerators(generatorsResponse.data);
    } catch (err) {
      setError("Failed to load reference data");
      console.error("Error loading reference data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save draft
  const saveDraft = useCallback(
    async (
      pricingData: PricingEntryRequest
    ): Promise<{ priceHeaderId: number }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await mockApiCall({
          priceHeaderId: Math.floor(Math.random() * 1000) + 1,
        });
        return response.data;
      } catch (err) {
        setError("Failed to save draft");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Submit pricing
  const submitPricing = useCallback(
    async (
      pricingData: PricingEntryRequest
    ): Promise<{ priceHeaderId: number }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await mockApiCall({
          priceHeaderId: Math.floor(Math.random() * 1000) + 1,
        });
        return response.data;
      } catch (err) {
        setError("Failed to submit pricing");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Validate pricing
  const validatePricing = useCallback(
    async (
      pricingData: PricingEntryRequest
    ): Promise<{ isValid: boolean; errors: string[] }> => {
      setLoading(true);
      setError(null);

      try {
        // Mock validation logic
        const errors: string[] = [];

        if (!pricingData.header.customerId) {
          errors.push("Customer is required");
        }

        if (pricingData.lineItems.length === 0) {
          errors.push("At least one line item is required");
        }

        pricingData.lineItems.forEach((item, index) => {
          if (!item.customerId) {
            errors.push(`Line ${index + 1}: Customer ID is required`);
          }
          if (!item.productId) {
            errors.push(`Line ${index + 1}: Product ID is required`);
          }
          if (!item.regionId) {
            errors.push(`Line ${index + 1}: Region ID is required`);
          }
          if (!item.containerSizeId) {
            errors.push(`Line ${index + 1}: Container Size is required`);
          }
          if (!item.billingUomId) {
            errors.push(`Line ${index + 1}: Billing UOM is required`);
          }
          if (!item.price || item.price <= 0) {
            errors.push(`Line ${index + 1}: Unit Price must be greater than 0`);
          }
        });

        const response = await mockApiCall({
          isValid: errors.length === 0,
          errors,
        });
        return response.data;
      } catch (err) {
        setError("Failed to validate pricing");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load data on mount
  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  return {
    // Data
    customers,
    products,
    regions,
    containerSizes,
    billingUoms,
    terms,
    facilities,
    generators,

    // State
    loading,
    error,

    // Actions
    saveDraft,
    submitPricing,
    validatePricing,
    loadReferenceData,
  };
};
