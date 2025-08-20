# Invoice Detail Lines Screen

## Overview

The Invoice Detail Lines Screen is a dedicated interface for viewing and editing detailed invoice line items. This screen provides comprehensive functionality for managing both disposal and non-disposal line items with full editing capabilities.

## Route

`/invoice-detail/[invoiceId]/detail-lines`

## Features

### 1. Invoice Summary Header

- **Context**: Shows key invoice information at the top for reference
- **Fields**: Invoice #, Customer, Facility, Status, Amount, Work Order, Purchase Orders, Invoice Date
- **Design**: Clean card layout with organized grid display

### 2. Billing Notes Section

- **Toggle Functionality**: Show/Hide billing notes with a button
- **Content**: Displays customer-specific billing notes and contact information
- **Styling**: Yellow-themed card for visibility

### 3. Disposal Lines Management

- **DataGrid**: Full-featured table with editable columns
- **Columns Include**:
  - Pricing Info (clickable link to profile pricing)
  - Container Info (clickable link to container details)
  - Work Order (clickable link to work order)
  - Generator Name
  - Date (editable date picker)
  - Line Description (editable text)
  - Offspec Code (editable text)
  - Offspec Notes (editable text)
  - Item Code (editable text)
  - Quantity (editable number)
  - UOM (editable text)
  - Disposal Price (editable number)
  - Trans Price (editable number)
  - Line Price (editable number)
  - Line Total (calculated)
  - Actions (delete button when in edit mode)

### 4. Non-Disposal Lines Management

- **DataGrid**: Similar structure to disposal lines but with different fields
- **Columns Include**:
  - Work Order (clickable link)
  - Generator Name
  - Date (editable date picker)
  - Main Category (editable text)
  - Item Code (editable text)
  - Description (editable text)
  - Quantity (editable number)
  - UOM (editable text)
  - Unit Price (editable number)
  - Line Price (calculated)
  - Actions (delete button when in edit mode)

### 5. Edit Mode Functionality

- **Toggle**: Switch between view and edit modes
- **Inline Editing**: Direct cell editing for most fields
- **Add Lines**: Add new disposal or non-disposal lines
- **Delete Lines**: Remove existing lines with confirmation
- **Save/Cancel**: Save changes or revert to original state

### 6. Summary and Totals

- **Disposal Lines Summary**: Total quantity and amount
- **Non-Disposal Lines Summary**: Total quantity and amount
- **Grand Total**: Combined total of all line items
- **Visual Design**: Color-coded summary cards for easy identification

### 7. Navigation

- **Back Button**: Return to previous page
- **Back to Invoice Details**: Return to main invoice detail page
- **Breadcrumb Context**: Clear indication of current location

## Technical Implementation

### State Management

- **Edit Mode**: Toggle between view and edit states
- **Data Handling**: Separate state for original and edited invoice data
- **Validation**: Real-time validation and error handling

### DataGrid Features

- **Editable Cells**: Inline editing for appropriate fields
- **Custom Renderers**: Clickable links for related entities
- **Responsive Design**: Adapts to different screen sizes
- **Performance**: Optimized for large datasets

### Styling

- **Consistent Design**: Follows application design patterns
- **Material-UI**: Uses Material-UI components for consistency
- **Color Coding**: Strategic use of colors for different data types
- **Responsive Layout**: Mobile-friendly design

## Usage Workflow

### 1. Accessing the Screen

- Navigate from main invoice detail page
- Click "View Invoice Line Details" button
- URL: `/invoice-detail/[invoiceId]/detail-lines`

### 2. Viewing Line Items

- Review disposal and non-disposal lines
- Click on linked items (pricing info, container info, work orders)
- Toggle billing notes visibility
- View summary totals

### 3. Editing Line Items

- Click "Edit Lines" button to enter edit mode
- Modify individual cell values directly
- Add new lines using "Add" buttons
- Delete lines using trash icon
- Save changes or cancel edits

### 4. Navigation

- Use back button to return to previous page
- Use "Back to Invoice Details" to return to main invoice view
- Maintain context throughout the workflow

## Benefits

### User Experience

- **Focused Interface**: Dedicated screen for line item management
- **Efficient Editing**: Inline editing reduces navigation
- **Clear Context**: Always know which invoice is being worked on
- **Quick Actions**: Easy access to add/remove/modify lines

### Business Value

- **Accurate Billing**: Detailed line item management
- **Audit Trail**: Track changes and modifications
- **Efficiency**: Streamlined workflow for invoice management
- **Compliance**: Proper categorization and documentation

### Technical Benefits

- **Separation of Concerns**: Dedicated component for line items
- **Reusability**: Can be used in other contexts
- **Maintainability**: Clean, focused code structure
- **Performance**: Optimized data handling and rendering

## Future Enhancements

### Potential Features

- **Bulk Operations**: Select multiple lines for batch editing
- **Advanced Filtering**: Filter lines by various criteria
- **Export Functionality**: Export line items to various formats
- **Audit Logging**: Track all changes with timestamps
- **Approval Workflow**: Multi-step approval process for changes
- **Integration**: Connect with external billing systems

### Technical Improvements

- **Real-time Collaboration**: Multiple users editing simultaneously
- **Offline Support**: Work without internet connection
- **Advanced Validation**: Complex business rule validation
- **Performance Optimization**: Virtual scrolling for large datasets
- **Accessibility**: Enhanced screen reader support
