import React from 'react';
import { Routes, Route } from 'react-router-dom';
import pluginId from '../pluginId';
import HomePage from './HomePage';
import FormBuilder from './FormBuilder';
import FormSubmissions from '../components/FormSubmissions';
import * as Tooltip from '@radix-ui/react-tooltip';
import { DesignSystemProvider } from '@strapi/design-system';

const App: React.FC = () => {
  return (
    <DesignSystemProvider>
    <Routes>
      <Route path={`/`} element={<HomePage/>}  />
      <Route path={`/create`} element={<FormBuilder/>}  />
      <Route path={`/forms/:id`} element={<FormBuilder/>}  />
      <Route path={`/submissions/:formId`} element={<FormSubmissions/>} />
      {/* <Route component={NotFound} /> */}
    </Routes>
    </DesignSystemProvider>
  );
};

export default App;
