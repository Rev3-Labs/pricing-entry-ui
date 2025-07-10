# Customer Search UI Feature

This document describes the Customer Search UI component and related functionality that allows users to search for and select customers by name or Oracle Customer ID.

## Overview

The Customer Search feature provides:

- A searchable input field with auto-suggestions
- Keyboard navigation support
- Customer selection and navigation to pricing view
- Responsive design with modern UI components

## Components

### 1. CustomerSearch Component (`components/customer-search.tsx`)

A reusable search component with the following features:

**Props:**

- `onCustomerSelect: (customer: Customer) => void` - Callback when a customer is selected
- `placeholder?: string` - Custom placeholder text
- `className?: string` - Additional CSS classes

**Features:**

- Real-time search with debouncing (300ms delay)
- Auto-suggestions dropdown
- Keyboard navigation (Arrow keys, Enter, Escape)
- Loading states with spinner
- Error handling
- Responsive design

**Usage:**

```tsx
import { CustomerSearch } from "@/components/customer-search";

<CustomerSearch
  onCustomerSelect={(customer) => {
    console.log("Selected:", customer);
    // Navigate to customer pricing
  }}
  placeholder="Search customers..."
/>;
```

### 2. Customer Search Page (`app/customer-search/page.tsx`)

A dedicated page for customer search with:

- Search interface
- Selected customer display
- Navigation to customer pricing view
- Help section with usage instructions

**Route:** `/customer-search`

### 3. Customer Pricing View (`app/customer-pricing/[customerId]/page.tsx`)

Displays customer pricing information with:

- Customer details
- Pricing table with status indicators
- Tabbed interface (Pricing, History, Documents)
- Edit pricing navigation

**Route:** `/customer-pricing/[customerId]`

## Services

### CustomerService (`services/customer.service.ts`)

Handles API calls for customer data:

**Methods:**

- `searchCustomers(searchTerm: string)` - Search customers by name or ID
- `getCustomerInfo(customerId: string)` - Get customer details
- `getCustomerPricing(customerId: string)` - Get customer pricing data

**API Endpoints:**

- `GET /api/customers/search?q={query}` - Search customers
- Additional endpoints for customer info and pricing (to be implemented)

## Data Models

### Customer Interface

```typescript
interface Customer {
  customerId: string;
  customerName: string;
  oracleCustomerId?: string;
  customerCode?: string;
}
```

### CustomerPricing Interface

```typescript
interface CustomerPricing {
  id: string;
  productName: string;
  region: string;
  unitPrice: number;
  minimumPrice: number;
  effectiveDate: string;
  expirationDate: string;
  status: "active" | "inactive" | "pending";
}
```

## API Routes

### Customer Search API (`app/api/customers/search/route.ts`)

**Endpoint:** `GET /api/customers/search?q={query}`

**Response:**

```json
{
  "data": [
    {
      "customerId": "1",
      "customerName": "Acme Corporation",
      "oracleCustomerId": "ORC001",
      "customerCode": "ACME"
    }
  ],
  "success": true,
  "message": "Found 1 customers"
}
```

## Integration

### Navigation from Pricing Entry

The main pricing entry page (`pricing-entry.tsx`) includes a "Search Customers" button in the header that navigates to the customer search page.

### URL Parameters

- Customer search page: `/customer-search`
- Customer pricing view: `/customer-pricing/{customerId}`
- Pricing entry with customer: `/pricing-entry?customerId={customerId}`

## Features

### Search Functionality

- **Real-time search** with 300ms debouncing
- **Multi-field search** (name, Oracle ID, customer code)
- **Case-insensitive** matching
- **Partial matching** support

### User Experience

- **Keyboard navigation** (Arrow keys, Enter, Escape)
- **Loading states** with visual feedback
- **Error handling** with user-friendly messages
- **Responsive design** for mobile and desktop
- **Accessibility** with proper ARIA labels

### Visual Design

- **Modern UI** using shadcn/ui components
- **Consistent styling** with the existing application
- **Status indicators** for pricing items
- **Badge system** for customer codes and IDs

## Future Enhancements

1. **Advanced Search Filters**

   - Region-based filtering
   - Status-based filtering
   - Date range filtering

2. **Search History**

   - Recent searches
   - Favorite customers

3. **Bulk Operations**

   - Multi-select customers
   - Bulk pricing updates

4. **Export Functionality**

   - Export customer lists
   - Export pricing data

5. **Real-time Updates**
   - WebSocket integration for live data
   - Push notifications for pricing changes

## Technical Notes

### Performance Considerations

- Debounced search to reduce API calls
- Lazy loading of customer data
- Optimistic UI updates

### Error Handling

- Network error recovery
- Graceful degradation
- User-friendly error messages

### Security

- Input sanitization
- API rate limiting (to be implemented)
- Authentication/authorization (to be implemented)

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Access Customer Search**

   - Navigate to `/customer-search`
   - Or click "Search Customers" button from the main pricing page

4. **Test Search Functionality**
   - Type customer names or Oracle IDs
   - Use keyboard navigation
   - Select customers and view pricing

## Mock Data

The current implementation uses mock data for demonstration. To integrate with a real backend:

1. Update the API endpoints in `services/customer.service.ts`
2. Replace mock data in API routes with database queries
3. Add proper error handling and validation
4. Implement authentication and authorization

## Contributing

When adding new features to the Customer Search:

1. Follow the existing component patterns
2. Add proper TypeScript types
3. Include error handling
4. Test keyboard navigation
5. Ensure responsive design
6. Update this documentation
