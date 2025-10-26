import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  Shield,
  UserCheck,
  UserX,
  Settings,
  Key,
  BarChart3
} from 'lucide-react';
import { User, UserCreate, UserUpdate } from '../types/auth';
import { useUsers, useSettings } from '../hooks';
import { formatDate } from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatsCard from '../components/ui/StatsCard';
import Table from '../components/ui/Table';
import UserCreateForm from '../components/user/UserCreateForm';
import UserEditForm from '../components/user/UserEditForm';

type AdminTab = 'overview' | 'users' | 'settings';

export default function Admin() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'doc_uploader' | 'medical_director'>('all');
  const [settingsForm, setSettingsForm] = useState({
    openai_api_key: '',
    openai_embedding_model: 'text-embedding-ada-002',
    openai_summarization_model: 'gpt-3.5-turbo',
    azure_api_key: '',
    azure_endpoint: '',
    azure_deployment_id: '',
    google_api_key: '',
    google_project_id: '',
    anthropic_api_key: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const handleUserCreated = async (userData: UserCreate) => {
    try {
      await createUser(userData);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  const handleUserUpdated = async (userId: number, userData: UserUpdate) => {
    try {
      await updateUser(userId, userData);
      setEditingUser(null);
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteUser(userId);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleSettingsChange = (key: string, value: string) => {
    setSettingsForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSettings(settingsForm);
      alert('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Update settings form when settings are loaded
  React.useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSettingsForm(prev => ({
        ...prev,
        ...settings
      }));
    }
  }, [settings]);

  // Handle URL parameter to switch to settings tab
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'settings') {
      setActiveTab('settings');
    }
  }, [searchParams]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const userStats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    docUploaders: users.filter(u => u.role === 'doc_uploader').length,
    medicalDirectors: users.filter(u => u.role === 'medical_director').length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length
  };

  const tableColumns = [
    {
      key: 'user',
      title: 'User',
      render: (user: User) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.role === 'admin' ? 'bg-red-100 text-red-800' :
          user.role === 'medical_director' ? 'bg-purple-100 text-purple-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {user.role === 'admin' ? 'Admin' :
           user.role === 'medical_director' ? 'Medical Director' :
           'Document Uploader'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (user: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.is_active ? (
            <>
              <UserCheck className="w-3 h-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <UserX className="w-3 h-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      )
    },
    {
      key: 'created_at',
      title: 'Created',
      render: (user: User) => (
        <span className="text-sm text-gray-500">
          {formatDate(user.created_at)}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right',
      render: (user: User) => (
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setEditingUser(user)}
            className="text-blue-600 hover:bg-blue-100 p-1 rounded"
            title="Edit user"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="text-red-600 hover:bg-red-100 p-1 rounded"
            title="Delete user"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  if (showCreateForm) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserCreateForm
          onSuccess={handleUserCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  if (editingUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserEditForm
          user={editingUser}
          onSuccess={handleUserUpdated}
          onCancel={() => setEditingUser(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and system settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center px-1 py-2 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={userStats.total}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Active Users"
              value={userStats.active}
              icon={<UserCheck className="w-6 h-6" />}
              color="green"
            />
            <StatsCard
              title="Admins"
              value={userStats.admins}
              icon={<Shield className="w-6 h-6" />}
              color="red"
            />
            <StatsCard
              title="Document Uploaders"
              value={userStats.docUploaders}
              icon={<UserPlus className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => setActiveTab('users')}
                className="flex items-center justify-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
              <Button
                onClick={() => setActiveTab('settings')}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
              <Button
                onClick={() => setShowCreateForm(true)}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={userStats.total}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatsCard
              title="Active Users"
              value={userStats.active}
              icon={<UserCheck className="w-6 h-6" />}
              color="green"
            />
            <StatsCard
              title="Inactive Users"
              value={userStats.inactive}
              icon={<UserX className="w-6 h-6" />}
              color="indigo"
            />
            <StatsCard
              title="Medical Directors"
              value={userStats.medicalDirectors}
              icon={<Shield className="w-6 h-6" />}
              color="purple"
            />
          </div>

          {/* User Management */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="doc_uploader">Document Uploader</option>
                  <option value="medical_director">Medical Director</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <Table
              data={filteredUsers as unknown as Record<string, unknown>[]}
              columns={tableColumns as unknown as Array<{ key: string; title: string; render?: (item: unknown) => React.ReactNode; className?: string }>}
              loading={loading}
              emptyMessage={
                searchTerm || roleFilter !== 'all'
                  ? 'No users match your search criteria.'
                  : 'No users found.'
              }
            />
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Key className="w-5 h-5 mr-2 text-blue-600" />
              OpenAI Configuration
            </h3>
            <p className="text-gray-600 mb-6">
              Configure OpenAI API settings for document processing and analysis.
            </p>
            
            {settingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-gray-600">Loading settings...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter OpenAI API key"
                    value={settingsForm.openai_api_key || ''}
                    onChange={(e) => handleSettingsChange('openai_api_key', e.target.value)}
                    className="font-mono"
                    disabled={savingSettings}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Embedding Model
                    </label>
                    <select 
                      value={settingsForm.openai_embedding_model}
                      onChange={(e) => handleSettingsChange('openai_embedding_model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={savingSettings}
                    >
                      <option value="text-embedding-ada-002">text-embedding-ada-002</option>
                      <option value="text-embedding-3-small">text-embedding-3-small</option>
                      <option value="text-embedding-3-large">text-embedding-3-large</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Summarization Model
                    </label>
                    <select 
                      value={settingsForm.openai_summarization_model}
                      onChange={(e) => handleSettingsChange('openai_summarization_model', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      disabled={savingSettings}
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="flex items-center"
                  >
                    {savingSettings ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      'Save Settings'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Azure Configuration */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Azure Configuration
            </h3>
            <p className="text-gray-600 mb-6">
              Configure Azure OpenAI settings for enhanced security and compliance.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Azure API Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter Azure API key"
                  value={settingsForm.azure_api_key || ''}
                  onChange={(e) => handleSettingsChange('azure_api_key', e.target.value)}
                  className="font-mono"
                  disabled={savingSettings}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azure Endpoint
                  </label>
                  <Input
                    type="text"
                    placeholder="https://your-resource.openai.azure.com/"
                    value={settingsForm.azure_endpoint || ''}
                    onChange={(e) => handleSettingsChange('azure_endpoint', e.target.value)}
                    disabled={savingSettings}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deployment ID
                  </label>
                  <Input
                    type="text"
                    placeholder="gpt-4-deployment"
                    value={settingsForm.azure_deployment_id || ''}
                    onChange={(e) => handleSettingsChange('azure_deployment_id', e.target.value)}
                    disabled={savingSettings}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}