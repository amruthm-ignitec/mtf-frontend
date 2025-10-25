import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { CriticalFinding } from '../types';

// Mock API for demo purposes
const api = {
  recordCriticalFinding: async (donorId: string, finding: CriticalFinding) => {
    // Mock implementation
    console.log('Recording critical finding:', { donorId, finding });
    return Promise.resolve();
  }
};

export const useCriticalFindingAlert = (donorId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (finding: CriticalFinding) => {
      // API call to record critical finding
      await api.recordCriticalFinding(donorId, finding);
    },
    onSuccess: () => {
      // Immediately update UI and notify relevant personnel
      queryClient.invalidateQueries({ queryKey: ['donor', donorId] });
      
      // Show prominent alert
      toast.error('Critical Finding Detected - Screening Halted', {
        duration: Infinity, // Will stay until dismissed
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          border: '2px solid #EF4444',
          padding: '16px',
        },
      });
    },
  });
}; 