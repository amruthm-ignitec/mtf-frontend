import React from 'react';
import { Plus, Star, User, Hash } from 'lucide-react';
import { DonorCreate } from '../../types/donor';
import { useForm, useApiState } from '../../hooks';
import { GENDER_OPTIONS } from '../../constants';
import { apiService } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface DonorCreateFormProps {
  onSuccess: (donor: DonorCreate) => void;
  onCancel: () => void;
}

export default function DonorCreateForm({ onSuccess, onCancel }: DonorCreateFormProps) {
  const { values, errors, setValue, setError, reset, isValid } = useForm({
    unique_donor_id: '',
    name: '',
    age: '',
    date_of_birth: '',
    gender: '',
    is_priority: false,
  });

  const { loading, execute } = useApiState();

  const validateForm = (): boolean => {
    let isValid = true;

    // Required fields validation
    if (!values.unique_donor_id.trim()) {
      setError('unique_donor_id', 'Unique Donor ID is required');
      isValid = false;
    } else if (values.unique_donor_id.trim().length < 3) {
      setError('unique_donor_id', 'Unique Donor ID must be at least 3 characters');
      isValid = false;
    }

    if (!values.name.trim()) {
      setError('name', 'Name is required');
      isValid = false;
    } else if (values.name.trim().length < 2) {
      setError('name', 'Name must be at least 2 characters');
      isValid = false;
    }

    if (!values.gender) {
      setError('gender', 'Gender is required');
      isValid = false;
    }

    // Age or Date of Birth validation
    const hasAge = values.age.trim() !== '';
    const hasDob = values.date_of_birth.trim() !== '';

    if (!hasAge && !hasDob) {
      setError('age', 'Either Age or Date of Birth is required');
      setError('date_of_birth', 'Either Age or Date of Birth is required');
      isValid = false;
    } else if (hasAge && (isNaN(Number(values.age)) || Number(values.age) < 0 || Number(values.age) > 120)) {
      setError('age', 'Age must be a number between 0 and 120');
      isValid = false;
    } else if (hasDob) {
      const dob = new Date(values.date_of_birth);
      if (isNaN(dob.getTime())) {
        setError('date_of_birth', 'Invalid Date of Birth');
        isValid = false;
      } else if (dob > new Date()) {
        setError('date_of_birth', 'Date of Birth cannot be in the future');
        isValid = false;
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const donorData: DonorCreate = {
        unique_donor_id: values.unique_donor_id.trim(),
        name: values.name.trim(),
        gender: values.gender as 'Male' | 'Female' | 'Other',
        is_priority: values.is_priority,
        age: values.age.trim() !== '' ? Number(values.age) : null,
        date_of_birth: values.date_of_birth.trim() !== '' ? values.date_of_birth : null,
      };

      const newDonor = await execute(() => apiService.createDonor(donorData));
      onSuccess(newDonor);
      reset();
    } catch (err) {
      console.error('Failed to create donor:', err);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Plus className="w-6 h-6 mr-2 text-blue-600" />
          Create New Donor
        </h2>
        <p className="text-gray-600 mt-1">
          Add a new donor record to the system
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Unique Donor ID"
            placeholder="Enter unique donor ID"
            value={values.unique_donor_id}
            onChange={(e) => setValue('unique_donor_id', e.target.value)}
            error={errors.unique_donor_id}
            icon={<Hash className="w-4 h-4" />}
            required
          />

          <Input
            label="Full Name"
            placeholder="Enter donor's full name"
            value={values.name}
            onChange={(e) => setValue('name', e.target.value)}
            error={errors.name}
            icon={<User className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Age"
            type="number"
            placeholder="Enter age"
            value={values.age}
            onChange={(e) => setValue('age', e.target.value)}
            error={errors.age}
            helperText="Optional if Date of Birth is provided"
            min="0"
            max="120"
          />

          <Input
            label="Date of Birth"
            type="date"
            placeholder="Select date of birth"
            value={values.date_of_birth}
            onChange={(e) => setValue('date_of_birth', e.target.value)}
            error={errors.date_of_birth}
            helperText="Optional if Age is provided"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {GENDER_OPTIONS.map((option) => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={values.gender === option.value}
                  onChange={(e) => setValue('gender', e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="is_priority"
            checked={values.is_priority}
            onChange={(e) => setValue('is_priority', e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="is_priority" className="ml-2 block text-sm text-gray-900">
            <span className="font-medium flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              High Priority Processing
            </span>
            <p className="text-xs text-gray-500 mt-0.5">
              Enable this flag to prioritize this donor's document processing
            </p>
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!isValid}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Donor
          </Button>
        </div>
      </form>
    </Card>
  );
}