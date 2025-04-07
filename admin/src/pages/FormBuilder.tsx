import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextInput,
  SingleSelect,
  SingleSelectOption,
  Button,
  Flex,
  Grid,
} from '@strapi/design-system';
import { Layouts } from '@strapi/strapi/admin';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useIntl } from 'react-intl';
import { useParams, useNavigate } from 'react-router-dom';
import { useFetchClient } from '@strapi/strapi/admin';
import { useNotification } from '@strapi/strapi/admin';
import { Trash, Plus, Drag } from '@strapi/icons';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'select', label: 'Select' },
  { value: 'upload', label: 'File Upload' },
  { value: 'date', label: 'Date' },
  { value: 'datetime', label: 'Date Time' },
  { value: 'time', label: 'Time' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'radio', label: 'Radio' },
  { value: 'phone', label: 'Phone' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'url', label: 'URL' },
];

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

const SortableField = ({ field, index, updateField, removeField }: {
  field: FormField;
  index: number;
  updateField: (index: number, updates: Partial<FormField>) => void;
  removeField: (index: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      background="neutral0"
      hasRadius
      borderColor={isDragging ? 'primary600' : 'neutral200'}
      borderStyle="solid"
      borderWidth="1px"
    >
      <Flex padding={3}>
        <Box {...attributes} {...listeners} cursor="move" paddingRight={3}>
          <Drag width="1rem" />
        </Box>
        
        <Box flex="1">
          <Grid.Root gap={4}>
            <Grid.Item col={6}>
              <TextInput
                placeholder="Field name"
                label="Name"
                required
                value={field.label}
                onChange={(e: { target: { value: any; }; }) => updateField(index, { label: e.target.value })}
              />
            </Grid.Item>

            <Grid.Item col={3}>
              <SingleSelect
                label="Type"
                required
                value={field.type}
                onChange={(value: any) => updateField(index, { type: value })}
              >
                {FIELD_TYPES.map(type => (
                  <SingleSelectOption key={type.value} value={type.value}>
                    {type.label}
                  </SingleSelectOption>
                ))}
              </SingleSelect>
            </Grid.Item>

            <Grid.Item col={2}>
              <SingleSelect
                label="Required"
                value={field.required ? 'true' : 'false'}
                onChange={(value: any) => updateField(index, { required: value === 'true' })}
              >
                <SingleSelectOption value="true">TRUE</SingleSelectOption>
                <SingleSelectOption value="false">FALSE</SingleSelectOption>
              </SingleSelect>
            </Grid.Item>

            <Grid.Item col={1}>
              <Flex justifyContent="flex-end" alignItems="flex-end" height="100%">
                <Button
                  variant="tertiary"
                  onClick={() => removeField(index)}
                >
                  <Trash />
                </Button>
              </Flex>
            </Grid.Item>
          </Grid.Root>

          {field.type === 'select' || field.type === 'radio' || field.type === 'multiselect' ? (
            <Box paddingTop={4}>
              <TextInput
                label="Options"
                placeholder="Enter comma-separated options"
                value={field.options?.join(', ') || ''}
                onChange={(e: { target: { value: string; }; }) => 
                  updateField(index, { options: e.target.value.split(',').map(o => o.trim()) })
                }
                hint="Separate options with commas"
              />
            </Box>
          ) : null}

          {field.type !== 'hidden' && (
            <Box paddingTop={4}>
              <TextInput
                label="Placeholder"
                placeholder="Enter placeholder text"
                value={field.placeholder || ''}
                onChange={(e: { target: { value: string; }; }) => 
                  updateField(index, { placeholder: e.target.value })
                }
              />
            </Box>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

const FormBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const push = useNavigate();
  const { formatMessage } = useIntl();
  const { get, post, put } = useFetchClient();
  const { toggleNotification } = useNotification();
  
  const [formName, setFormName] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      const { data } = await get(`/form-builder/forms/${id}`);
      setFormName(data.name);
      setFields(data.fields);
    } catch (err) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to load form',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: '',
      required: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const formData = {
        name: formName,
        fields,
      };

      if (id) {
        await put(`/form-builder/forms/${id}`, formData);
      } else {
        await post('/form-builder/forms', formData);
      }

      toggleNotification({
        type: 'success',
        message: id ? 'Form updated successfully' : 'Form created successfully',
      });
      push('/plugins/form-builder');
    } catch (err) {
      toggleNotification({
        type: 'warning',
        message: 'Failed to save form',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layouts.Root>
      <Layouts.Header
        title={id ? 'Edit Form' : 'Create Form'}
        primaryAction={
          <Button
            loading={isLoading}
            onClick={handleSubmit}
            startIcon={<Plus />}
          >
            Save
          </Button>
        }
      />
      <Layouts.Content>
        <Box padding={8}>
          <TextInput
            name="formName"
            label="Form Name"
            placeholder="My contact form"
            value={formName}
            onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setFormName(e.target.value)}
            required
          />

          <Box paddingTop={6}>
            <Flex justifyContent="space-between" alignItems="center" paddingBottom={4}>
              <Typography variant="beta">Form Fields</Typography>
              <Button
                variant="secondary"
                startIcon={<Plus />}
                onClick={addField}
              >
                Add field
              </Button>
            </Flex>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map(f => f.id)}
                strategy={verticalListSortingStrategy}
              >
                <Flex direction="column" gap={2}>
                  {fields.map((field, index) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      index={index}
                      updateField={updateField}
                      removeField={removeField}
                    />
                  ))}
                </Flex>
              </SortableContext>
            </DndContext>

            {fields.length === 0 && (
              <Box 
                padding={8} 
                background="neutral100"
                hasRadius
                borderStyle="dashed"
                borderWidth="1px"
                borderColor="neutral200"
              >
                <Flex justifyContent="center">
                  <Typography textColor="neutral600">
                    Click the "Add field" button above to start building your form.
                  </Typography>
                </Flex>
              </Box>
            )}
          </Box>
        </Box>
      </Layouts.Content>
    </Layouts.Root>
  );
};

export default FormBuilder;