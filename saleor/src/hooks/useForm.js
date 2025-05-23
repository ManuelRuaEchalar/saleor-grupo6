import { useState, useCallback } from 'react';

const useForm = ({ initialValues, validate }) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
      if (validate) {
        const newErrors = validate({ ...formData, [name]: value });
        setErrors((prev) => ({ ...prev, [name]: newErrors[name] }));
      }
    },
    [formData, validate]
  );

  const validateForm = useCallback(() => {
    if (!validate) return true;
    const newErrors = validate(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validate]);

  return { formData, handleChange, errors, validateForm };
};

export default useForm;