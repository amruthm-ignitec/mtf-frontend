import React, { useState } from 'react';
import { 
  Bell, 
  Monitor, 
  Lock, 
  Mail, 
  Shield, 
  Sliders, 
  Eye, 
  BellRing,
  Save,
  Brain,
  Key,
  Database,
  ChevronDown,
  MessageSquare
} from 'lucide-react';

type SettingSection = 'preferences' | 'notifications' | 'privacy' | 'accessibility' | 'ai-models' | 'custom-prompts';

interface AIModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Azure' | 'Google' | 'Anthropic';
  description: string;
  capabilities: string[];
  isEnabled: boolean;
}

interface CustomPrompt {
  id: string;
  title: string;
  prompt: string;
  category: 'medical-review' | 'tissue-evaluation' | 'contraindication' | 'eligibility' | 'summary';
  isDefault?: boolean;
  lastUsed?: Date;
  useCount?: number;
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingSection>('preferences');
  const [notifications, setNotifications] = useState({
    newDonor: true,
    statusUpdates: true,
    criticalAlerts: true,
    reviewRequests: true
  });

  const [preferences, setPreferences] = useState({
    defaultView: 'summary',
    autoRefresh: true,
    refreshInterval: 5,
    showAIConfidence: true
  });

  const [accessibility, setAccessibility] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    reduceMotion: false
  });

  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [apiCredentials, setApiCredentials] = useState({
    openai: {
      apiKey: '',
      orgId: ''
    },
    azure: {
      apiKey: '',
      endpoint: '',
      deploymentId: ''
    },
    google: {
      apiKey: '',
      projectId: ''
    },
    anthropic: {
      apiKey: ''
    }
  });

  const availableModels: AIModel[] = [
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Advanced model for complex medical analysis and tissue evaluation',
      capabilities: [
        'Complex tissue analysis',
        'Medical document understanding',
        'Detailed contraindication detection'
      ],
      isEnabled: true
    },
    {
      id: 'azure-gpt4',
      name: 'Azure GPT-4',
      provider: 'Azure',
      description: 'Azure-hosted GPT-4 with enhanced security and compliance',
      capabilities: [
        'HIPAA compliant',
        'Enhanced data security',
        'Regional data residency'
      ],
      isEnabled: false
    },
    {
      id: 'med-palm2',
      name: 'Med-PaLM 2',
      provider: 'Google',
      description: 'Specialized medical language model by Google',
      capabilities: [
        'Medical terminology expertise',
        'Research-backed medical analysis',
        'Healthcare-specific training'
      ],
      isEnabled: false
    },
    {
      id: 'claude-2',
      name: 'Claude 2',
      provider: 'Anthropic',
      description: 'Advanced model with strong medical analysis capabilities',
      capabilities: [
        'Detailed medical reasoning',
        'Complex document analysis',
        'Nuanced tissue evaluation'
      ],
      isEnabled: false
    }
  ];

  const [expandedProviders, setExpandedProviders] = useState<Record<string, boolean>>({
    openai: false,
    azure: false,
    google: false,
    anthropic: false
  });

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Display Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Default View</label>
                    <p className="text-xs text-gray-500">Choose your default landing page</p>
                  </div>
                  <select 
                    className="text-xs rounded-md border-gray-300"
                    value={preferences.defaultView}
                    onChange={(e) => setPreferences({...preferences, defaultView: e.target.value})}
                  >
                    <option value="summary">Summary</option>
                    <option value="intelligence">Intelligence</option>
                    <option value="queue">Queue</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Auto Refresh</label>
                    <p className="text-xs text-gray-500">Automatically refresh data</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.autoRefresh}
                      onChange={(e) => setPreferences({...preferences, autoRefresh: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600"
                    />
                    {preferences.autoRefresh && (
                      <select 
                        className="text-xs rounded-md border-gray-300"
                        value={preferences.refreshInterval}
                        onChange={(e) => setPreferences({...preferences, refreshInterval: Number(e.target.value)})}
                      >
                        <option value="1">1 min</option>
                        <option value="5">5 min</option>
                        <option value="15">15 min</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-gray-700">AI Confidence Scores</label>
                    <p className="text-xs text-gray-500">Show AI confidence indicators</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.showAIConfidence}
                    onChange={(e) => setPreferences({...preferences, showAIConfidence: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                      <p className="text-xs text-gray-500">
                        Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications({...notifications, [key]: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ai-models':
        return renderAIModelSection();

      case 'custom-prompts':
        return renderCustomPromptsSection();

      // Add other sections as needed
      default:
        return null;
    }
  };

  const renderAIModelSection = () => (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">AI Model Selection</h3>
        <div className="space-y-4">
          {availableModels.map((model) => (
            <div key={model.id} className="border rounded-lg hover:border-blue-500 transition-colors">
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setSelectedModel(model.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="ai-model"
                        id={model.id}
                        checked={selectedModel === model.id}
                        onChange={() => setSelectedModel(model.id)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor={model.id} className="ml-2 block text-sm font-medium text-gray-900">
                        {model.name}
                        <span className="ml-2 text-xs text-gray-500">({model.provider})</span>
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{model.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Credentials as Accordions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">API Credentials</h3>
        
        {/* OpenAI Credentials */}
        <div className="border rounded-lg mb-4">
          <button
            onClick={() => toggleProvider('openai')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
          >
            <h4 className="text-xs font-medium text-gray-700">OpenAI Credentials</h4>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedProviders.openai ? 'rotate-180' : ''}`} />
          </button>
          {expandedProviders.openai && (
            <div className="p-4 border-t space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiCredentials.openai.apiKey}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    openai: { ...prev.openai, apiKey: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                  placeholder="sk-..."
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Organization ID</label>
                <input
                  type="text"
                  value={apiCredentials.openai.orgId}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    openai: { ...prev.openai, orgId: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                  placeholder="org-..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Azure OpenAI Credentials */}
        <div className="border rounded-lg mb-4">
          <button
            onClick={() => toggleProvider('azure')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
          >
            <h4 className="text-xs font-medium text-gray-700">Azure OpenAI Credentials</h4>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedProviders.azure ? 'rotate-180' : ''}`} />
          </button>
          {expandedProviders.azure && (
            <div className="p-4 border-t space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiCredentials.azure.apiKey}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    azure: { ...prev.azure, apiKey: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Endpoint</label>
                <input
                  type="text"
                  value={apiCredentials.azure.endpoint}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    azure: { ...prev.azure, endpoint: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                  placeholder="https://your-resource.openai.azure.com/"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Deployment ID</label>
                <input
                  type="text"
                  value={apiCredentials.azure.deploymentId}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    azure: { ...prev.azure, deploymentId: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Google AI Credentials */}
        <div className="border rounded-lg mb-4">
          <button
            onClick={() => toggleProvider('google')}
            className="w-full flex justify-between items-center p-4 hover:bg-gray-50"
          >
            <h4 className="text-xs font-medium text-gray-700">Google AI Credentials</h4>
            <ChevronDown className={`w-4 h-4 transform transition-transform ${expandedProviders.google ? 'rotate-180' : ''}`} />
          </button>
          {expandedProviders.google && (
            <div className="p-4 border-t space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">API Key</label>
                <input
                  type="password"
                  value={apiCredentials.google.apiKey}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    google: { ...prev.google, apiKey: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Project ID</label>
                <input
                  type="text"
                  value={apiCredentials.google.projectId}
                  onChange={(e) => setApiCredentials(prev => ({
                    ...prev,
                    google: { ...prev.google, projectId: e.target.value }
                  }))}
                  className="w-full border rounded-md px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save API Settings
          </button>
        </div>
      </div>
    </div>
  );

  const [prompts, setPrompts] = useState<CustomPrompt[]>([
    {
      id: '1',
      title: 'Tissue Eligibility Check',
      prompt: 'Analyze the medical history and lab results to determine eligibility for {tissue_type}. Consider contraindications, risk factors, and relevant medical conditions.',
      category: 'eligibility',
      isDefault: true,
      useCount: 45
    },
    {
      id: '2',
      title: 'Contraindication Analysis',
      prompt: 'Review all medical records for potential contraindications. List them by severity and provide relevant citations from the source documents.',
      category: 'contraindication',
      isDefault: true,
      useCount: 32
    },
    {
      id: '3',
      title: 'Quick Medical Summary',
      prompt: 'Provide a concise summary of the donor\'s medical history, focusing on key conditions, medications, and recent treatments that may impact donation.',
      category: 'summary',
      isDefault: true,
      useCount: 28
    }
  ]);

  const renderCustomPromptsSection = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Custom Prompts</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
              Add New Prompt
            </button>
          </div>

          {/* Categories */}
          <div className="flex space-x-2 mb-6">
            {['All', 'Medical Review', 'Tissue Evaluation', 'Contraindication', 'Eligibility', 'Summary'].map((category) => (
              <button
                key={category}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Prompts List */}
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{prompt.title}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {prompt.category}
                    </span>
                  </div>
                  {prompt.isDefault && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Default Template
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{prompt.prompt}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Used {prompt.useCount} times</span>
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">Edit</button>
                    {!prompt.isDefault && (
                      <button className="text-red-600 hover:text-red-800">Delete</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Tips for Writing Effective Prompts</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Use specific medical terminology for better results</li>
            <li>• Include key aspects you want to analyze</li>
            <li>• Use {'{tissue_type}'} placeholder for dynamic tissue selection</li>
            <li>• Request citations when needed for verification</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex space-x-8">
        <div className="w-64">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveSection('preferences')}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md ${
                activeSection === 'preferences' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Sliders className="w-4 h-4 mr-2" />
              Preferences
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md ${
                activeSection === 'notifications' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveSection('ai-models')}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md ${
                activeSection === 'ai-models' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Models
            </button>
            <button
              onClick={() => setActiveSection('custom-prompts')}
              className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded-md ${
                activeSection === 'custom-prompts' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Custom Prompts
            </button>
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === 'ai-models' ? renderAIModelSection() : renderSection()}
        </div>
      </div>
    </div>
  );
} 