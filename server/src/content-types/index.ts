export default {
  'form': {
    schema: {
      kind: 'collectionType',
      collectionName: 'form_builder_forms',
      info: {
        singularName: 'form',
        pluralName: 'forms',
        displayName: 'Form',
      },
      options: {
        draftAndPublish: false,
      },
      attributes: {
        name: {
          type: 'string',
          required: true,
        },
        fields: {
          type: 'json',
          required: true,
        },
        submissions: {
          type: 'relation',
          relation: 'oneToMany',
          target: 'plugin::form-builder.submission',
          mappedBy: 'form',
        },
      },
    },
  },
  'submission': {
    schema: {
      kind: 'collectionType',
      collectionName: 'form_builder_submissions',
      info: {
        singularName: 'submission',
        pluralName: 'submissions',
        displayName: 'Form Submission',
      },
      options: {
        draftAndPublish: false,
      },
      attributes: {
        form: {
          type: 'relation',
          relation: 'manyToOne',
          target: 'plugin::form-builder.form',
          inversedBy: 'submissions',
        },
        data: {
          type: 'json',
          required: true,
        },
        attachments: {
          type: 'media',
          multiple: true,
          allowedTypes: ['images', 'files', 'videos', 'audios'],
        },
      },
    },
  },
};
