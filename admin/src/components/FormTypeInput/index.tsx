import React from 'react';
import { SingleSelect, SingleSelectOption } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { useEffect, useState } from 'react';

interface FormTypeInputProps {
  value: string;
  onChange: (value: string) => void;
}

const FormTypeInput: React.FC<FormTypeInputProps> = ({ value, onChange }) => {
  const [formTypes, setFormTypes] = useState([]);
  const { get } = useFetchClient();

  useEffect(() => {
    loadFormTypes();
  }, []);

  const loadFormTypes = async () => {
    try {
      const { data } = await get('/form-builder/form-types');
      setFormTypes(data);
    } catch (err) {
      console.error('Failed to load form types');
    }
  };

  return (
    <SingleSelect
      value={value}
      onChange={onChange}
      placeholder="Select a form type"
    >
      {formTypes.map((type: any) => (
        <SingleSelectOption key={type.id} value={type.id}>
          {type.name}
        </SingleSelectOption>
      ))}
    </SingleSelect>
  );
};

export default FormTypeInput;
