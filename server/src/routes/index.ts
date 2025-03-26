export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/forms',
        handler: 'controller.find',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id',
        handler: 'controller.findOne',
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/forms',
        handler: 'controller.create',
        config: {
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/forms/:id',
        handler: 'controller.update',
        config: {
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/forms/:id',
        handler: 'controller.delete',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id/submissions',
        handler: 'controller.getSubmissions',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id/export',
        handler: 'controller.exportSubmissions',
        config: {
          policies: [],
        },
      },
    ],
  },
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'POST',
        path: '/forms/:id/submit',
        handler: 'controller.submit',
        config: {
          auth: false,
          policies: [],
        },
      },
    ],
  },
};
