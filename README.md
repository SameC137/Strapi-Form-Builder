# Form Builder Plugin for Strapi

A powerful and flexible form builder plugin for Strapi CMS that allows you to create, manage, and handle form submissions with ease. This plugin is compatible with strapi v5

## Features

- **Dynamic Form Creation**: Create forms with various field types:
  - Text
  - Number
  - Email
  - Text Area
  - Select
  - File Upload
  - Date
  - Date Time
  - Time
  - Checkbox
  - Radio
  - Phone
  - Multi Select

- **Field Validation**: Built-in validation for all field types:
  - Required field validation
  - Email format validation
  - Phone number format validation
  - URL format validation
  - Number range validation
  - Date and time format validation
  - File type validation

- **Form Submissions**:
  - Store form submissions in the database
  - Export submissions to Excel
  - View submission history
  - File attachment support

## Installation

1. Install the plugin in your Strapi project:
```bash
npm install @samemichaeltadele/plugin-form-builder
```

2. Enable the plugin in your Strapi configuration:
```javascript
// config/plugins.js
module.exports = {
  'form-builder': {
    enabled: true,
  }
};
```

## Usage

### Creating Forms

1. Access the Form Builder from your Strapi admin panel
![Form Builder Home Page](demo/form-builder_forms_page.png?raw=true )
2. Click "Create new form"
3. Add fields by selecting the field type and configuring:
   - Label
   - Field ID
   - Required/Optional
   - Validation rules
   - Options (for select, radio, multiselect)
   
![Form Builder Home Page](demo/form-builder_form__build_page.png?raw=true)

### Form Submission

Forms can be submitted via API endpoint:

POST /api/form-builder/forms/:id/submit
Submissions are through a form-data to handle both files and other types.  Use the field id as the key and the content as the value.

```
field_1743000638542:First Name
field_1743000660368:Last Name
field_1743000670177:16-25
field_1743000724300:2025/12/05
field_1743000750507:15
field_1743000783200:Male
field_1743000834979:true
field_1743000853004:+1555555555
field_1743000867275:test@mail.com
```


### Retrieving Submissions
Submissions can be seen in the /admin/plugins/form-builder/submissions/:id route on the admin panel. It can be navigated to from the forms page(/admin/plugins/form-builder). It is possible to export all submissions in the forms page as well as the submissions page.

![Form Builder Home Page](demo/form-builder_submission_page.png?raw=true)

## API Endpoints

### Content API Routes
- `GET /api/form-builder/forms` - List all forms
- `GET /api/form-builder/forms/:id` - Get form details
- `POST /api/form-builder/forms/:id/submit` - Submit form
- `GET /api/form-builder/submissions` - List all submissions
- `PUT /api/form-builder/submissions/:id` - Update submission
- `DELETE /api/form-builder/submissions/:id` - Delete submission

### Admin API Routes
- `GET /admin/form-builder/forms` - List all forms with submission counts
- `GET /admin/form-builder/forms/:id` - Get form details
- `POST /admin/form-builder/forms` - Create new form
- `PUT /admin/form-builder/forms/:id` - Update form
- `DELETE /admin/form-builder/forms/:id` - Delete form
- `GET /admin/form-builder/forms/:id/submissions` - Get form submissions
- `GET /admin/form-builder/forms/:id/export` - Export submissions to Excel

## Field Types and Validation

### Text
- Required/Optional
- Pattern validation (regex)
- Min/Max length

### Number
- Required/Optional
- Min/Max value
- Pattern validation

### Email
- Required/Optional
- Email format validation

### Phone
- Required/Optional
- Phone number format validation

### Date/DateTime
- Required/Optional
- Date format validation

### File Upload
- Required/Optional
- File type validation
- File size limits

### Select/Radio
- Required/Optional
- Options validation

### Multi Select
- Required/Optional
- Options validation
- Min/Max selections

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
