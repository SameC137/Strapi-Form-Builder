import { errors } from '@strapi/utils';
import * as xlsx from 'xlsx';

const { ApplicationError, ValidationError } = errors;

const find = async (ctx) => {
  try {
    const forms = await strapi.documents('plugin::form-builder.form').findMany({
      populate: ['submissions'],
    });
    
    return forms.map(form => ({
      ...form,
      submissions_count: form.submissions?.length || 0,
    }));
  } catch (err) {
    throw new ApplicationError('Failed to fetch forms');
  }
};

const findOne = async (ctx) => {
  const { id } = ctx.params;
  try {
    console.log('id', id);
    
    const form = await strapi.documents('plugin::form-builder.form').findOne({
      documentId: id,
    });
    
    if (!form) {
      return ctx.notFound('Form not found');
    }
    
    return form;
  } catch (err) {
    throw new ApplicationError('Failed to fetch form');
  }
};

const create = async (ctx) => {
  const { body } = ctx.request;
  try {
    const form = await strapi.documents('plugin::form-builder.form').create({
      data: body,
    });
    return form;
  } catch (err) {
    throw new ApplicationError('Failed to create form');
  }
};

const update = async (ctx) => {
  const { id } = ctx.params;
  const { body } = ctx.request;
  try {
    const form = await strapi.documents('plugin::form-builder.form').update({
      documentId: id,
      data: body,
    });
    return form;
  } catch (err) {
    throw new ApplicationError('Failed to update form');
  }
};

const deleteForm = async (ctx) => {
  const { id } = ctx.params;
  try {
    const form = await strapi.documents('plugin::form-builder.form').delete({
      documentId: id,
    });
    return form;
  } catch (err) {
    throw new ApplicationError('Failed to delete form');
  }
};

const validateField = (value: any, field: any) => {
  if (field.required && (value === undefined || value === null || value === '')) {
    throw new ValidationError(`${field.label} is required`);
  }

  if (value) {
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new ValidationError(`${field.label} must be a valid email`);
        }
        break;
      case 'number':
        if (isNaN(value)) {
          throw new ValidationError(`${field.label} must be a number`);
        }
        if (field.validation?.min !== undefined && value < field.validation.min) {
          throw new ValidationError(`${field.label} must be at least ${field.validation.min}`);
        }
        if (field.validation?.max !== undefined && value > field.validation.max) {
          throw new ValidationError(`${field.label} must be at most ${field.validation.max}`);
        }
        break;
      case 'tel':
        const phoneRegex = /^\+?[\d\s-]+$/;
        if (!phoneRegex.test(value)) {
          throw new ValidationError(`${field.label} must be a valid phone number`);
        }
        break;
      case 'url':
        try {
          new URL(value);
        } catch {
          throw new ValidationError(`${field.label} must be a valid URL`);
        }
        break;
      case 'file':
        // File validation happens during upload
        break;
    }

    if (field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        throw new ValidationError(`${field.label} does not match the required pattern`);
      }
    }
  }
};

const submit = async (ctx) => {
  const { id } = ctx.params;
  const { body } = ctx.request;
  const files = ctx.request.files;

  try {
    const form = await strapi.documents('plugin::form-builder.form').findOne({
      documentId: id,
    });
    
    if (!form) {
      return ctx.notFound('Form not found');
    }

    // Validate all fields
    form.fields.forEach(field => {
      const value = body[field.id];
      validateField(value, field);
    });

    // Handle file uploads
    const attachments = {};
    if (files) {
      const fileFields = form.fields.filter(f => f.type === 'upload');
      
      for (const field of fileFields) {
        const fieldFiles = files[field.id];
        if (!fieldFiles) continue;

        if (field.validation?.allowedTypes) {
          const allowedMimes = field.validation.allowedTypes.map(type => `${type}/*`);
          const files = Array.isArray(fieldFiles) ? fieldFiles : [fieldFiles];
          
          files.forEach(file => {
            if (!allowedMimes.some(mime => file.mimetype.match(mime))) {
              throw new ValidationError(
                `File type not allowed for ${field.label}. Allowed types: ${field.validation.allowedTypes.join(', ')}`
              );
            }
          });
        }

        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
          data: {
            ref: 'plugin::form-builder.submission',
            field: field.id,
          },
          files: fieldFiles,
        });

        attachments[field.id] = uploadedFiles;
      }
    }

    // Create submission with validated data and files
    const submission = await strapi.documents('plugin::form-builder.submission').create({
      data: {
        form: {connect:[id]},
        data: {
          ...body,
          ...attachments,
        },
      },
    });

    return {
      success: true,
      submission: {
        id: submission.id,
        createdAt: submission.createdAt,
      },
    };

  } catch (err) {
    if (err instanceof ValidationError) {
      return ctx.badRequest(err.message);
    }
    throw new ApplicationError('Failed to submit form');
  }
};

const getSubmissions = async (ctx) => {
  const { id } = ctx.params;
  try {
    const submissions = await strapi.documents('plugin::form-builder.submission').findMany({
      filters: { form: {documentId:id} },
      populate: ['attachments',"form"], 
      sort: { createdAt: 'desc' },
    });

    const form = await strapi.documents('plugin::form-builder.form').findOne({
      documentId: id,
    });

    return {
      formName: form.name,
      submissions,
    };
  } catch (err) {
    throw new ApplicationError('Failed to fetch submissions');
  }
};

const formatExcelValue = (value: any, fieldType: string) => {
  if (value === null || value === undefined) return '';

  switch (fieldType) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'datetime':
      return new Date(value).toLocaleString();
    case 'upload':
      if (Array.isArray(value)) {
        return value.map(file => file.name).join(', ');
      }
      return value.name || '';
    case 'json':
      return JSON.stringify(value);
    default:
      return String(value);
  }
};

const exportSubmissions = async (ctx) => {
  const { id } = ctx.params;
  try {
    const submissions = await strapi.documents('plugin::form-builder.submission').findMany({
      filters: { form: { documentId: id } },
      populate: ['attachments'],
      sort: { createdAt: 'desc' },
    });

    const form = await strapi.documents('plugin::form-builder.form').findOne({
      documentId: id,
    });

    // Prepare headers and data
    const headers = [
      'Submission ID',
      'Submission Date',
      ...form.fields.map(field => field.label),
    ];

    const data = submissions.map(submission => {
      const row = {
        'Submission ID': submission.id,
        'Submission Date': new Date(submission.createdAt).toLocaleString(),
      };

      // Add field values
      form.fields.forEach(field => {
        const value = submission.data[field.id];
        row[field.label] = formatExcelValue(value, field.type);
      });

      return row;
    });

    // Create workbook and add styles
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data, {
      header: headers,
    });

    // Set column widths
    const colWidths = headers.map(header => ({
      wch: Math.max(header.length, 20),  // minimum width of 20 characters
    }));
    worksheet['!cols'] = colWidths;

    // Style the header row
    const headerRange = xlsx.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellRef = xlsx.utils.encode_cell({ r: 0, c: col });
      worksheet[cellRef].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "EFEFEF" } },
        alignment: { horizontal: 'center' },
      };
    }

    // Add the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Submissions');

    // Add a summary sheet
    const summaryData = [
      ['Form Name', form.name],
      ['Total Submissions', submissions.length],
      ['Export Date', new Date().toLocaleString()],
      ['Fields', form.fields.length],
    ];

    const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Generate the Excel file
    const buffer = xlsx.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      bookSST: false,
      compression: true,
    });

    // Set response headers
    ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    ctx.set('Content-Disposition', `attachment; filename="${form.name}-submissions-${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    return buffer;
  } catch (err) {
    console.error('Export error:', err);
    throw new ApplicationError('Failed to export submissions');
  }
};

export default {
  find,
  findOne,
  create,
  update,
  delete: deleteForm,
  submit,
  getSubmissions,
  exportSubmissions,
};
