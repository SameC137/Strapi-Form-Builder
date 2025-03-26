export default {
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
}; 