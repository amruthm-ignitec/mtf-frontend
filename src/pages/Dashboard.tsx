import {
  BarChart3,
  FileCheck,
  AlertTriangle,
  Clock,
  AlertCircle,
  Activity,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Brain,
  UserCheck,
  Scale
} from 'lucide-react';

export default function Admin() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Time Critical Alerts */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Clock className="w-6 h-6 mr-2 text-red-500" />
            Time Critical Alerts
          </h2>
          <span className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Delays */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-red-800 mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Critical Processing Delays
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Donor ID: 1234 - Exceeding time window
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Processing time: 18 hours (6 hours remaining)
                  </p>
                  <button className="mt-2 text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full hover:bg-red-200">
                    Take Action
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Deadlines */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-yellow-800 mb-4 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending Critical Documents
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Donor ID: 1235 - Missing critical documents
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Required within: 4 hours
                  </p>
                  <button className="mt-2 text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full hover:bg-yellow-200">
                    Review Documents
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current System Status */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-blue-500" />
          Current System Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Processing Queue</p>
                <p className="text-2xl font-semibold">24</p>
                <p className="text-sm text-blue-600">4.2 hrs avg. time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Staff Coverage</p>
                <p className="text-2xl font-semibold">5/6</p>
                <p className="text-sm text-green-600">Active Staff</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">AI Performance</p>
                <p className="text-2xl font-semibold">94%</p>
                <p className="text-sm text-purple-600">Accuracy Rate</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">SLA Breaches</p>
                <p className="text-2xl font-semibold">2</p>
                <p className="text-sm text-orange-600">Requires Attention</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Updates & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent System Updates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
            Recent System Updates
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">AI Model Update</p>
                <p className="text-sm text-green-700">New version deployed with improved accuracy</p>
                <p className="text-xs text-green-500 mt-1">Today at 9:30 AM</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Performance Optimization</p>
                <p className="text-sm text-blue-700">Processing speed improved by 15%</p>
                <p className="text-xs text-blue-500 mt-1">Yesterday at 4:15 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Performance Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            System Performance
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing Speed</span>
                <span className="font-medium text-green-600">4.2 min/case</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Model Accuracy</span>
                <span className="font-medium text-blue-600">94.5%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: '94.5%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this section after Current System Status */}
      <div className="mt-8 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-indigo-500" />
          Processing Analytics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time Efficiency */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Processing Time Efficiency</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average Processing</span>
                  <span className="text-green-600">4.2 hrs</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>24hr Completion Rate</span>
                  <span className="text-blue-600">92%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">AI Analysis Accuracy</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Document Analysis</p>
                  <p className="text-xl font-semibold text-green-600">98.5%</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Finding Detection</p>
                  <p className="text-xl font-semibold text-blue-600">96.2%</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Based on validation against MD reviews
              </div>
            </div>
          </div>

          {/* Cost Savings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Operational Impact</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Time Saved</p>
                  <p className="text-xl font-semibold text-purple-600">65%</p>
                  <p className="text-xs text-gray-500">vs. Manual Review</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Error Reduction</p>
                  <p className="text-xl font-semibold text-indigo-600">82%</p>
                  <p className="text-xs text-gray-500">vs. Traditional Methods</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <CheckCircle2 className="w-6 h-6 mr-2 text-green-500" />
          Quality Metrics
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Tracking */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Compliance & Documentation</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileCheck className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm">Required Documentation</span>
                </div>
                <span className="text-sm font-medium text-green-600">98.2% Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm">Timely Processing</span>
                </div>
                <span className="text-sm font-medium text-blue-600">95.7% On Time</span>
              </div>
            </div>
          </div>

          {/* Decision Support Impact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Decision Support Impact</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Brain className="w-5 h-5 text-purple-500 mr-2" />
                  <span className="text-sm">AI-Assisted Decisions</span>
                </div>
                <span className="text-sm font-medium text-purple-600">+45% Faster</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm">Accuracy Improvement</span>
                </div>
                <span className="text-sm font-medium text-green-600">+35%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add this section after Quality Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Scale className="w-6 h-6 mr-2 text-indigo-500" />
          LLM Usage & Billing
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Token Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Token Consumption</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Today's Usage</p>
                  <p className="text-xl font-semibold text-blue-600">245K</p>
                  <p className="text-xs text-gray-500">tokens</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Monthly Total</p>
                  <p className="text-xl font-semibold text-green-600">3.2M</p>
                  <p className="text-xs text-gray-500">tokens</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">Monthly Limit</span>
                  <span className="text-xs font-medium">5M tokens</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '64%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-1">64% of limit used</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium mb-4">Cost Analysis</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Today's Cost</p>
                  <p className="text-xl font-semibold text-purple-600">$12.25</p>
                  <p className="text-xs text-gray-500">@ $0.05/1K tokens</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Monthly Cost</p>
                  <p className="text-xl font-semibold text-indigo-600">$160.00</p>
                  <p className="text-xs text-gray-500">Projected: $185.00</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GPT-4</span>
                  <span className="font-medium text-gray-900">$142.50</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GPT-3.5</span>
                  <span className="font-medium text-gray-900">$17.50</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-gray-900">Total Cost</span>
                    <span className="text-gray-900">$160.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 