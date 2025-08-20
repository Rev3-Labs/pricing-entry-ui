# Invoice Detail Page

## Overview
The Invoice Detail Page is a comprehensive interface for viewing and editing invoice information, following the wireframe design with two main sections: Edit Invoice Detail Screen and Invoice Line Detail Screen & Form.

## Features

### 1. Edit Invoice Detail Screen
**Header Section:**
- Green banner with "Edit Invoice Detail Screen" title
- Action buttons: Edit Invoice, Download, Print, Send
- Sample invoice reference display

**Invoice Details Section:**
- Invoice # (System Generated, Searchable/filter)
- Invoice Amount (Total Amount)
- Invoice Status (Open/In Progress/On Hold/Finalized/Void)
- Invoice Date (Date first created)
- Finalize Date (Date finalized)
- Facility Name (Destination Facility)
- Purchase Order(s) (Purchase Orders)
- Invoice Discount (Discount % - Free form field)
- Rebill details (Indicator, Original Invoice#)

**Work Order Details Section:**
- Work Order # (System Generated, Searchable/filter)
- Work Order Status (Open/In Progress/On Hold/Finalized/Void)
- Work Order Type (Disposal/Transportation/T&D)
- Work Order Date (Date created)
- Assignment Status (Assigned/Available/Removed)
- Job# (Only displayed if SDM invoice type)
- Tax Rate (Tax %)
- Button to change the work order

**Customer Generator Details Section (Required Fields):**
- Customer Name*
- Generator Name*
- Generator Address*
- Facility*

**CSR Details Section:**
- Created By (Created by)
- Modified By (Modified by)
- Approved By (Approved by)
- CSR Notes (Open field)

**Payment Details Section:**
- Payment Term (NET30)
- Payment Due Date (Due date)
- Payment Method (Credit/Debit/Autopay)

**Disposal Info Section:**
- Disposal Category (Selection field with values)
- Transportation Category (Selection field with values)

**Fees/Taxes Section:**
- Environmental Assessment Fee (Checkbox - Default checked in)
- Economic Adjustment Fee (Checkbox - Default checked in)
- Tax Exempt (Checkbox - Default checked in)

**Credit Memo Details Section:**
- Credit Memo# (Credit memo#)
- Status (Credit Memo Status)
- Credit Amount (Total credit amount)

### 2. Invoice Line Detail Screen & Form
**Header Section:**
- Green banner with "Invoice Line Detail Screen & Form" title
- Invoice Details summary for context

**Disposal Lines DataGrid:**
- Work Order # (Clickable & opens work order page)
- Generator Name
- Date (Date of the line from manifest)
- Offspec Code (Offspec Notes from manifest record)
- Offspec Notes (Offspec Code from manifest record)
- Item Code (Item Code used on invoice line)
- Line Description (Description of invoice line)
- Quantity (Quantity of the invoice line)
- UOM (Unit of measure on invoice line)
- Disposal Price (Calculated based on Disposal rate at profile level)
- Trans Price (Calculated based on transportation Rate per container)
- Line Price (Calculated based on Disposal Price + Trans Price)
- Total Price (Calculated based on Line Price + Trans Price)
- Container Info (Hyperlink to Container page)
- Pricing Info (Hyperlink to Profile Pricing Page)

**Non Disposal Lines DataGrid:**
- Work Order # (Clickable & opens work order page)
- Generator Name
- Date (Date of the line from manifest)
- Main Category (Item Category)
- Item Code (Item Code used on invoice line)
- Description (Description of invoice line)
- Quantity (Quantity of the invoice line)
- UOM (Unit of measure on invoice line)
- Unit Price (Price set on disposal line creation)
- Line Price (Calculated based on Unit Price * Quantity)

## Technical Implementation

### Route Structure
- **Path:** `/invoice-detail/[invoiceId]`
- **File:** `app/invoice-detail/[invoiceId]/page.tsx`

### State Management
- **Edit Mode:** Toggle between view and edit modes
- **Loading States:** Save operations with loading indicators
- **Form Validation:** Required field indicators (*)

### UI Components
- **Material-UI:** TextField, Select, Checkbox, DataGrid, Paper, Grid
- **Custom Components:** PrimaryButton, SecondaryButton
- **Icons:** Lucide React icons for actions and status indicators

### Data Handling
- **Mock Data:** Comprehensive sample invoice with disposal and non-disposal lines
- **Real-time Updates:** Form state management with controlled inputs
- **Navigation:** Links to related pages (work orders, containers, pricing)

### Responsive Design
- **Grid Layout:** Responsive grid system for form fields
- **Mobile Friendly:** Optimized for various screen sizes
- **Consistent Spacing:** Uniform spacing and typography

## User Experience Features

### Edit Mode
- **Toggle Edit:** Switch between view and edit modes
- **Save Changes:** Save button with loading state
- **Cancel Edit:** Reset to original data
- **Field Validation:** Clear indication of required fields

### Navigation
- **Back Button:** Return to previous page
- **Related Links:** Clickable work order numbers and info links
- **Action Buttons:** Download, Print, Send functionality

### Status Indicators
- **Visual Badges:** Color-coded status indicators with icons
- **Progress Tracking:** Clear status progression
- **Required Fields:** Asterisk (*) indicators for mandatory fields

## Integration Points

### Related Pages
- **Work Order Detail:** Clickable work order numbers
- **Container Management:** Container info hyperlinks
- **Profile Pricing:** Pricing information links
- **Invoice Search:** Return to search results

### Data Sources
- **Invoice API:** Fetch invoice details by ID
- **Work Order API:** Related work order information
- **Customer API:** Customer and generator details
- **Pricing API:** Rate and pricing information

## Future Enhancements

### Planned Features
- **Real-time Collaboration:** Multi-user editing capabilities
- **Audit Trail:** Track all changes and approvals
- **Advanced Validation:** Business rule validation
- **Bulk Operations:** Multi-line editing capabilities
- **Export Options:** PDF, Excel, and custom formats

### Performance Optimizations
- **Lazy Loading:** Load line items on demand
- **Caching:** Cache frequently accessed data
- **Optimistic Updates:** Immediate UI feedback
- **Debounced Saving:** Auto-save with user confirmation
