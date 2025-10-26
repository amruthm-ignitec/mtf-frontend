import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Users, AlertCircle, Star, Trash2, Clock, FileText } from 'lucide-react';
import { Donor } from '../types/donor';
import { useDonors } from '../hooks';
import { formatDate, calculateAge } from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatsCard from '../components/ui/StatsCard';
import Table from '../components/ui/Table';
import DonorCreateForm from '../components/donor/DonorCreateForm';
import { useNavigate } from 'react-router-dom';

export default function DonorManagement() {
  const navigate = useNavigate();
  const { donors, loading, error, deleteDonor, togglePriority } = useDonors();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'priority' | 'normal'>('all');

  const handleDonorCreated = async () => {
    setShowCreateForm(false);
  };

  const handleDeleteDonor = async (donorId: number) => {
    if (!window.confirm('Are you sure you want to delete this donor? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDonor(donorId);
    } catch (err) {
      console.error('Failed to delete donor:', err);
    }
  };

  const handleTogglePriority = async (donorId: number, currentPriority: boolean) => {
    try {
      await togglePriority(donorId, currentPriority);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const filteredDonors = useMemo(() => {
    return donors.filter(donor => {
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           donor.unique_donor_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterPriority === 'all' ||
                           (filterPriority === 'priority' && donor.is_priority) ||
                           (filterPriority === 'normal' && !donor.is_priority);
      
      return matchesSearch && matchesFilter;
    });
  }, [donors, searchTerm, filterPriority]);

  const getAgeDisplay = (donor: Donor) => {
    if (donor.age) {
      return `${donor.age} years`;
    }
    if (donor.date_of_birth) {
      const age = calculateAge(donor.date_of_birth);
      return `${age} years`;
    }
    return 'N/A';
  };

  const tableColumns = [
    {
      key: 'donor',
      title: 'Donor',
      render: (donor: Donor) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{donor.name}</div>
          <div className="text-sm text-gray-500">ID: {donor.unique_donor_id}</div>
        </div>
      )
    },
    {
      key: 'age_gender',
      title: 'Age/Gender',
      render: (donor: Donor) => (
        <div>
          <div className="text-sm text-gray-900">{getAgeDisplay(donor)}</div>
          <div className="text-sm text-gray-500">{donor.gender}</div>
        </div>
      )
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (donor: Donor) => (
        <button
          onClick={() => handleTogglePriority(donor.id, donor.is_priority)}
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            donor.is_priority
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-3 h-3 mr-1 ${donor.is_priority ? 'text-yellow-600' : 'text-gray-400'}`} />
          {donor.is_priority ? 'High Priority' : 'Normal'}
        </button>
      )
    },
    {
      key: 'created',
      title: 'Created',
      render: (donor: Donor) => (
        <span className="text-sm text-gray-500">{formatDate(donor.created_at)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right',
      render: (donor: Donor) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => navigate(`/documents/${donor.id}`)}
            className="text-blue-600 hover:bg-blue-100 p-1 rounded"
            title="View documents"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleTogglePriority(donor.id, donor.is_priority)}
            className={`p-1 rounded ${
              donor.is_priority 
                ? 'text-yellow-600 hover:bg-yellow-100' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={donor.is_priority ? 'Remove priority' : 'Set priority'}
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteDonor(donor.id)}
            className="text-red-600 hover:bg-red-100 p-1 rounded"
            title="Delete donor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (showCreateForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DonorCreateForm
          onSuccess={handleDonorCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              Donor Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage donor records and set processing priorities
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Donor
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Donors"
          value={donors.length}
          icon={<Users className="w-8 h-8" />}
          color="blue"
        />
        <StatsCard
          title="High Priority"
          value={donors.filter(d => d.is_priority).length}
          icon={<Star className="w-8 h-8" />}
          color="yellow"
        />
        <StatsCard
          title="Normal Priority"
          value={donors.filter(d => !d.is_priority).length}
          icon={<Clock className="w-8 h-8" />}
          color="green"
        />
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or donor ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'all' | 'priority' | 'normal')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Donors</option>
              <option value="priority">High Priority</option>
              <option value="normal">Normal Priority</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Donors Table */}
      <Table
        data={filteredDonors as unknown as Record<string, unknown>[]}
        columns={tableColumns as unknown as Array<{ key: string; title: string; render?: (item: unknown) => React.ReactNode; className?: string }>}
        loading={loading}
        emptyMessage={
          searchTerm || filterPriority !== 'all' 
            ? 'No donors match your search criteria.'
            : 'No donors found. Create your first donor to get started.'
        }
      />
    </div>
  );
}
