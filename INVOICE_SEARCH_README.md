# Invoice Search & Summary Screen

## Overview

The Invoice Search & Summary Screen is a comprehensive search interface that allows users to filter and view invoices based on multiple criteria. This screen is designed to be loaded from the dashboard when users apply specific filters.

## Features

### 1. Informational Header

- **Context**: Explains when this screen is displayed (when filters are applied from dashboard)
- **Green Banner**: Prominent title "Invoice Search & Summary Screen"
- **Description**: Clarifies default loading behavior from dashboard

### 2. Search Bar Header

The search interface includes 10 searchable fields:

- **Invoice #**: Searchable invoice number field
- **Date Range**: Start and end date pickers for invoice date filtering
- **Customer**: Customer name search field
- **Generator**: Generator name search field
- **Work Order #**: Work order number search field
- **Facility Name**: Destination facility search field
- **CXR**: CXR name search field
- **Project #**: SDM-only project number field
- **Profile #**: Profile number field
- **Item Code**: Item code from Item Master search field

### 3. Data Display Grid

The results table displays invoices with the following columns:

- **Invoice #**: Clickable invoice ID (navigates to detail view)
- **Invoice Date**: Invoice creation date
- **Invoice Status**: Status badge (Ready, Open, In Review, On Hold)
- **Customer**: Customer name with filter capability
- **Generator**: Generator name with filter capability
- **Work Order**: Work order with filter capability
- **Project**: Project with filter capability
- **Item Code**: Item code with filter capability
- **Rebill**: Rebill indicator with filter capability

## Functionality

### Search & Filtering

- **Real-time Filtering**: Apply multiple filters simultaneously
- **Date Range Support**: Filter by invoice date ranges
- **Text Search**: Case-insensitive search across text fields
- **Clear Filters**: Reset all search criteria
- **Export Results**: Export filtered results (placeholder for future implementation)

### Navigation

- **Back Button**: Return to previous page
- **Invoice Click**: Click on invoice ID to view details
- **Dashboard Integration**: Seamless navigation to/from invoice dashboard

### Status Management

- **Status Badges**: Visual indicators for invoice status
- **Rebill Indicators**: Clear marking for rebill invoices
- **Interactive Elements**: Hover effects and clickable rows

## Technical Implementation

### Components Used

- **UI Components**: Card, Button, Input, Table, Badge
- **Icons**: Lucide React icons for consistent visual language
- **State Management**: React hooks for filter state and data management
- **Routing**: Next.js navigation for seamless page transitions

### Data Structure

```typescript
interface Invoice {
  id: string;
  invoiceDate: string;
  status: string;
  customer: string;
  generator: string;
  workOrder: string;
  project: string;
  itemCode: string;
  rebill: boolean;
  amount: number;
  facility: string;
  cxr: string;
  profile: string;
}
```

### Filter Interface

```typescript
interface SearchFilters {
  invoiceNumber: string;
  startDate: string;
  endDate: string;
  customer: string;
  generator: string;
  workOrder: string;
  facility: string;
  cxr: string;
  project: string;
  profile: string;
  itemCode: string;
}
```

## Usage

### From Dashboard

1. Navigate to Invoice Dashboard
2. Click "Search Invoices" button
3. Apply desired filters
4. View filtered results

### Direct Access

1. Navigate to `/invoice-search` route
2. Use search filters to find specific invoices
3. Click on invoice IDs to view details

### URL Parameters

The screen supports URL parameters for pre-filtering:

- `?customer=CustomerName`
- `?generator=GeneratorName`
- `?workOrder=WO-Number`
- `?invoiceNumber=INV-Number`
- `?cxr=CXR-Name`

## Future Enhancements

### Planned Features

- **Export Functionality**: CSV/Excel export of filtered results
- **Advanced Filtering**: Date picker components, dropdown selections
- **Pagination**: Handle large result sets
- **Saved Searches**: Save and reuse common filter combinations
- **Real-time Updates**: Live data refresh capabilities

### API Integration

- **Search Endpoints**: Replace mock data with real API calls
- **Filter Validation**: Server-side filter validation
- **Performance Optimization**: Debounced search, lazy loading

## Accessibility

### Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Clear visual indicators and status badges
- **Responsive Design**: Mobile-friendly layout and touch interactions

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design for tablet and mobile devices
- **JavaScript**: Requires JavaScript enabled for full functionality

## Dependencies

- **React**: 18+ for hooks and modern React patterns
- **Next.js**: 13+ for routing and app directory support
- **Tailwind CSS**: For styling and responsive design
- **Lucide React**: For consistent iconography
- **Sonner**: For toast notifications
