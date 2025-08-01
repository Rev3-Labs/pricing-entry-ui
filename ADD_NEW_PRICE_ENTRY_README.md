# Add New Price Entry Functionality

## Overview

This feature allows users to add new price entries directly in the grid while in edit mode. When the user clicks "Add New Price Entry", a new row is added to the top of the grid with inline editing capabilities.

## How It Works

### 1. Enabling Edit Mode

- Users must first enable "Edit Mode" using the toggle button
- This enables the "Add New Price Entry" button and other edit functionality

### 2. Adding a New Entry

- Click the "Add New Price Entry" button (green button with plus icon)
- A new row appears at the top of the grid with editable fields
- The row is highlighted with a blue background and border to indicate it's in edit mode

### 3. Inline Editing

The new row contains the following editable fields:

- **Customer Name**: Text input for customer name
- **Product Name**: Text input for product name (required)
- **Profile ID**: Text input for profile identifier
- **Generator ID**: Text input for generator identifier
- **Gov. Contract**: Text input for government contract number
- **Project Name**: Text input for project name
- **Facility Name**: Text input for facility name
- **Container Size**: Text input for container size (required)
- **UOM**: Dropdown selection for unit of measure (required)
  - Options: Each, Gallon, Pound, Container, Ton
- **Unit Price**: Number input for unit price (required)
- **Minimum Price**: Number input for minimum price (required)

### 4. Validation

The system validates:

- Required fields must be filled (Product Name, Container Size, UOM, Unit Price, Minimum Price)
- Unit Price and Minimum Price must be valid positive numbers
- The Save button is disabled until all validation passes

### 5. Saving the Entry

- Click the "Save" button to add the new entry to the grid
- The entry is added to the data and appears in the grid
- The new row is highlighted to indicate it was recently added
- Edit mode is reset and the user can add another entry if needed

### 6. Canceling

- Click the "Cancel" button to discard the new entry
- The row is removed from the grid
- Edit mode is reset

## Technical Implementation

### State Management

- `isAddingNewEntry`: Controls whether a new entry row is being added
- `editingNewRow`: Controls whether the new row is in edit mode
- `editingRowData`: Stores the current values of the new row fields

### DataGrid Configuration

- Custom `renderCell` functions for each column to show input fields when editing
- `isCellEditable` function to control which cells can be edited
- `getRowClassName` to apply special styling to the new entry row
- Custom styling for the new entry row with blue background and border

### Validation

- Client-side validation for required fields
- Numeric validation for price fields
- Real-time validation feedback with disabled Save button

## User Experience Features

### Visual Feedback

- New entry row is highlighted with blue background and border
- Save button is disabled until validation passes
- Clear error messages for validation failures
- Button text changes to "Adding New Entry..." when in edit mode

### Accessibility

- Proper form labels and placeholders
- Keyboard navigation support
- Clear visual indicators for edit state

## Future Enhancements

- Auto-save functionality
- Bulk add multiple entries
- Template-based entry creation
- Integration with external data sources
- Advanced validation rules
