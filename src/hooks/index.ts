import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Donor, DonorCreate, DonorUpdate } from '../types/donor';
import { User, UserCreate, UserUpdate } from '../types/auth';
import { getErrorMessage } from '../utils';

// Custom hook for donor management
export const useDonors = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const donorsData = await apiService.getDonors();
      setDonors(donorsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createDonor = useCallback(async (donorData: DonorCreate) => {
    try {
      const newDonor = await apiService.createDonor(donorData);
      setDonors(prev => [newDonor, ...prev]);
      return newDonor;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const updateDonor = useCallback(async (donorId: number, donorData: DonorUpdate) => {
    try {
      const updatedDonor = await apiService.updateDonor(donorId, donorData);
      setDonors(prev => prev.map(donor => 
        donor.id === donorId ? updatedDonor : donor
      ));
      return updatedDonor;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const deleteDonor = useCallback(async (donorId: number) => {
    try {
      await apiService.deleteDonor(donorId);
      setDonors(prev => prev.filter(donor => donor.id !== donorId));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const togglePriority = useCallback(async (donorId: number, currentPriority: boolean) => {
    try {
      const updatedDonor = await apiService.updateDonorPriority(donorId, !currentPriority);
      setDonors(prev => prev.map(donor => 
        donor.id === donorId ? updatedDonor : donor
      ));
      return updatedDonor;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  return {
    donors,
    loading,
    error,
    fetchDonors,
    createDonor,
    updateDonor,
    deleteDonor,
    togglePriority
  };
};

// Custom hook for user management (Admin only)
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: UserCreate) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const updateUser = useCallback(async (userId: number, userData: UserUpdate) => {
    try {
      const updatedUser = await apiService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      return updatedUser;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
};

// Custom hook for settings management (Admin only)
export const useSettings = () => {
  const [settings, setSettings] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const settingsData = await apiService.getSettings();
      setSettings(settingsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (settingsData: Record<string, string | null>) => {
    try {
      const updatedSettings = await apiService.updateSettings(settingsData);
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings
  };
};

// Custom hook for form state management
export const useForm = <T extends Record<string, unknown>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setFieldTouched,
    reset,
    isValid
  };
};

// Custom hook for API state management
export const useApiState = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};
