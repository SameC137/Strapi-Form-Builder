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
  Badge,
  Flex,
  Card,
  CardHeader,
  CardBody,
  CardAction,
  CardContent,
  CardBadge,
  EmptyStateLayout,
  Loader,
} from '@strapi/design-system';
import { Layouts, useAuth } from '@strapi/strapi/admin';
import { Download, ExternalLink } from '@strapi/icons';
import { useParams } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';
import { useNotification } from '@strapi/strapi/admin';


interface Submission {
  id: string;
  createdAt: string;
  data: Record<string, any>;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    mime: string;
  }>;
}

const FormSubmissions: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { get } = useFetchClient();
  const { toggleNotification } = useNotification();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formName, setFormName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const token=useAuth("plugin::form-builder.form", (value)=>value.token)


  useEffect(() => {
    fetchSubmissions();
    fetchForm();
  }, []);

  const fetchForm = async () => {
    try {
      const { data } = await get(`/form-builder/forms/${formId}`);
      setForm(data);
    } catch (err) {
      console.error(err);
      toggleNotification({
        type: 'warning',
        message: 'Failed to fetch form details',
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const { data } = await get(`/form-builder/forms/${formId}/submissions`);
      setSubmissions(data.submissions);
      setFormName(data.formName);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      toggleNotification({
        type: 'warning',
        message: 'Failed to fetch submissions',
      });
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/form-builder/forms/${formId}/export`,{
        headers:{
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        toggleNotification({
            type: 'danger',
            message: 'Failed to export submissions',
          });
          return
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${formName}-submissions.xlsx`);
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

  const formatValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined) return '-';

    switch (fieldType) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'datetime':
        return new Date(value).toLocaleString();
      case 'time':
        return value;
      case 'json':
        return <pre>{JSON.stringify(value, null, 2)}</pre>;
      case 'upload':
        if (Array.isArray(value)) {
          return value.map((file, index) => (
            <Link key={index} href={file.url} >
              <Flex gap={2} alignItems="center">
                <Download /> {file.name}
              </Flex>
            </Link>
          ));
        }
        return(<Link  href={value.url} >
        <Flex gap={2} alignItems="center">
          <Download /> {value.name}
        </Flex>
      </Link>)
        return '-';
      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <Layouts.Root>
        <Layouts.Content>
          <Box padding={8} background="neutral100">
            <Loader>Loading submissions...</Loader>
          </Box>
        </Layouts.Content>
      </Layouts.Root>
    );
  }

  if (!submissions.length) {
    return (
      <Layouts.Root>
        <Layouts.Header
          title={formName}
          subtitle="Form Submissions"
          primaryAction={
            <Button
              onClick={handleExport}
              startIcon={<Download />}
              disabled={true}
            >
              Export All
            </Button>
          }
        />
        <Layouts.Content>
          <Box padding={8}>
            <EmptyStateLayout
              content="No submissions found for this form yet."
              shadow="tableShadow"
            />
          </Box>
        </Layouts.Content>
      </Layouts.Root>
    );
  }

  return (
    <Layouts.Root>
      <Layouts.Header
        title={formName}
        subtitle="Form Submissions"
        primaryAction={
          <Button onClick={handleExport} startIcon={<Download />}>
            Export All
          </Button>
        }
      />
      <Layouts.Content>
        <Box padding={4}>
          {submissions.map((submission) => (
            <Card key={submission.id} marginBottom={4}>
              <CardHeader>
                <Flex justifyContent="space-between" alignItems="center">
                  <Typography variant="delta">
                    Submitted on {new Date(submission.createdAt).toLocaleString()}
                  </Typography>
                  <CardBadge>#{submission.id}</CardBadge>
                </Flex>
              </CardHeader>
              <CardBody>
                <Box padding={4}>
                  {form?.fields?.map((field: any) => (
                    <Box key={field.id} paddingBottom={4}>
                      <Typography fontWeight="bold" variant="pi">
                        {field.label}
                      </Typography>
                      <Box paddingTop={2}>
                        {formatValue(submission.data[field.id], field.type)}
                      </Box>
                    </Box>
                  ))}
                  {submission.attachments?.length > 0 && (
                    <Box paddingTop={4}>
                      <Typography fontWeight="bold" variant="pi">
                        Attachments
                      </Typography>
                      <Box paddingTop={2}>
                        {submission.attachments.map((attachment) => (
                          <Link
                            key={attachment.id}
                            href={attachment.url}
                          >
                            <Flex gap={2} alignItems="center" paddingY={2}>
                              <Download />
                              {attachment.name}
                              <Badge>{attachment.mime}</Badge>
                            </Flex>
                          </Link>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </CardBody>
            </Card>
          ))}
        </Box>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default FormSubmissions;
