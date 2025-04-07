export default {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'GET',
        path: '/forms',
        handler: 'form.findPopulated',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id',
        handler: 'form.findOne',
        config: {
          policies: [],
        },
      },
      {
        method: 'POST',
        path: '/forms',
        handler: 'form.create',
        config: {
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/forms/:id',
        handler: 'form.update',
        config: {
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/forms/:id',
        handler: 'form.delete',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id/submissions',
        handler: 'form.getSubmissions',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id/export',
        handler: 'form.exportSubmissions',
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
        handler: 'form.submit',
        config: {
          auth: false,
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms',
        handler: 'form.find',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/forms/:id',
        handler: 'form.findOne',
        config: {
          policies: [],
        },
      },
      {
        method: 'GET',
        path: '/submissions',
        handler: 'submission.find',
        config: {
          policies: [],
        },
      },
      {
        method: 'PUT',
        path: '/submissions/:id',
        handler: 'submission.update',
        config: {
          policies: [],
        },
      },
      {
        method: 'DELETE',
        path: '/submissions/:id',
        handler: 'submission.delete',
        config: {
          policies: [],
        },
      },
    ],
  },
};
