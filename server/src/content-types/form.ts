export default {
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
}; 