

export default ({ strapi }: { strapi: any }) => {
  strapi.customFields.register({
    name: 'form-type',
    plugin: 'form-builder',
    type: 'string',
  });
};
