import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Button,
  IconButton,
  Link,
} from '@strapi/design-system';
import { Layouts, useAuth } from '@strapi/strapi/admin';
import { Plus, Download } from '@strapi/icons';
import { useIntl } from 'react-intl';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';
import { useNotification } from '@strapi/strapi/admin';

const HomePage: React.FC = () => {
  const { formatMessage } = useIntl();
  const push = useNavigate();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token=useAuth("plugin::form-builder.form", (value)=>value.token)

  useEffect(() => {
    console.log('App mounted');
    fetchForms();
  }, []);



  const fetchForms = async () => {
    try {
      const { data } = await get('/form-builder/forms');
      setForms(data);
      setIsLoading(false);
    } catch (err) {
      console.log(err)
      toggleNotification({
        type: 'warning',
        message: 'Failed to fetch forms',
      });
      setIsLoading(false);
    }
  };

  const handleExport = async (formId: string) => {
        try {
          const response = await fetch(`/form-builder/forms/${formId}/export`,{
            headers:{
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) {
            toggleNotification({
              type: 'warning',
              message: 'Failed to export submissions',
            });
            return
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
        link.setAttribute('download', `form-submissions-${formId}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove(); 
    } catch (err) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to export submissions',
      });
    }
  };

  return (
    <Layouts.Root>
      <Layouts.Header
        title={formatMessage({ id: 'form-builder.title', defaultMessage: 'Form Builder' })}
        subtitle={formatMessage({
          id: 'form-builder.description',
          defaultMessage: 'Manage your forms and submissions',
        })}
        primaryAction={
          <Button
            onClick={() => push('/plugins/form-builder/create')}
            startIcon={<Plus />}
          >
            {formatMessage({
              id: 'form-builder.create',
              defaultMessage: 'Create new form',
            })}
          </Button>
        }
      />
      <Layouts.Content>
        <Table colCount={5} rowCount={forms.length}>
          <Thead>
            <Tr>
              <Th>
                <Typography variant="sigma">Form Name</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Submissions</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Created At</Typography>
              </Th>
              <Th>
                <Typography variant="sigma">Actions</Typography>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {forms.map((form: any) => (
              <Tr key={form.id}>
                <Td>
                  <Typography> <Link as={NavLink} to={`/plugins/form-builder/forms/${form.documentId}`}>
                  {form.name}</Link></Typography>
                </Td>
                <Td>
                  <Typography>{form.submissions_count}</Typography>
                </Td>
                <Td>
                  <Typography>{new Date(form.createdAt).toLocaleDateString()}</Typography>
                </Td>
                <Td>
                  <Box>
                    <IconButton
                      onClick={() => handleExport(form.documentId)}
                      label="Export submissions"
                    >
                      <Download />
                    </IconButton>
                    <Link as={NavLink} to={`/plugins/form-builder/submissions/${form.documentId}`}>
                      View submissions
                    </Link>
                  </Box>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default HomePage;
