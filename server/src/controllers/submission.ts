import { errors, sanitize } from '@strapi/utils';

const { ApplicationError, ValidationError } = errors;

const find = async (ctx) => {
  try {
    const contentType = strapi.contentType('plugin::form-builder.submission');

    const sanitizedQueryParams =  await strapi.contentAPI.sanitize.query(ctx.query, contentType, { auth: ctx.state.auth });
    const documents = await strapi.documents(contentType.uid).findMany(sanitizedQueryParams);

    return await strapi.contentAPI.sanitize.output(documents, contentType, { auth: ctx.state.auth });
    
  } catch (err) {
    console.log('err', err);
    throw new ApplicationError('Failed to fetch submissions');
  }
};



const update = async (ctx) => {
    const { id } = ctx.params;
    const { body } = ctx.request;
    try {
      const form = await strapi.documents('plugin::form-builder.submission').update({
        documentId: id,
        data: body,
      });
      return form;
    } catch (err) {
      throw new ApplicationError('Failed to update submission');
    }
  };

  const deleteForm = async (ctx) => {
    const { id } = ctx.params;
    try {
      const form = await strapi.documents('plugin::form-builder.submission').delete({
        documentId: id,
      });
      return form;
    } catch (err) {
      throw new ApplicationError('Failed to delete submission');
    }
  };

export default {
    find, 
    update,
    delete:deleteForm
  };