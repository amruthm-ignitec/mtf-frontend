import { useState } from 'react';
import { User, Mail, Phone, Building, Shield, Clock, Award, FileCheck, Pencil, Save, X } from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Antony Linus',
    role: 'Medical Director',
    email: 'alinus@donoriq.ai',
    phone: '(555) 123-4567',
    organization: 'Memorial Hospital',
    certifications: [
      {
        id: '1',
        name: 'Board Certified - Tissue Banking',
        expiry: 'Dec 2024',
        status: 'active'
      },
      {
        id: '2',
        name: 'Annual Compliance Training',
        completed: 'Jan 2024',
        status: 'active'
      }
    ],
    preferences: {
      notifications: true,
      emailUpdates: true,
      language: 'English'
    }
  });

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleCertificationUpdate = (id: string, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow">
        {/* Profile Header with Edit Button */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="text-base font-semibold text-gray-900 border rounded px-2 py-1"
                  />
                ) : (
                  <h2 className="text-base font-semibold text-gray-900">{profileData.name}</h2>
                )}
                <p className="text-xs text-gray-500">{profileData.role}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-xs">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="border rounded px-2 py-1 flex-1"
                    />
                  ) : (
                    <span>{profileData.email}</span>
                  )}
                </div>
                <div className="flex items-center text-xs">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="border rounded px-2 py-1 flex-1"
                    />
                  ) : (
                    <span>{profileData.phone}</span>
                  )}
                </div>
                <div className="flex items-center text-xs">
                  <Building className="w-4 h-4 text-gray-400 mr-2" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.organization}
                      onChange={(e) => setProfileData({...profileData, organization: e.target.value})}
                      className="border rounded px-2 py-1 flex-1"
                    />
                  ) : (
                    <span>{profileData.organization}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Role & Permissions</h3>
              <div className="space-y-3">
                <div className="flex items-center text-xs">
                  <Shield className="w-4 h-4 text-gray-400 mr-2" />
                  <span>Medical Director</span>
                </div>
                <div className="text-xs text-gray-500">
                  Permissions:
                  <ul className="mt-1 list-disc list-inside">
                    <li>Review and approve tissue analysis</li>
                    <li>Access to all donor records</li>
                    <li>Manage team permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Certifications - Now Editable */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Certifications</h3>
              <div className="space-y-3">
                {profileData.certifications.map(cert => (
                  <div key={cert.id} className="flex items-start text-xs">
                    <Award className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleCertificationUpdate(cert.id, 'name', e.target.value)}
                            className="w-full border rounded px-2 py-1"
                          />
                          <input
                            type="text"
                            value={cert.expiry || cert.completed}
                            onChange={(e) => handleCertificationUpdate(cert.id, cert.expiry ? 'expiry' : 'completed', e.target.value)}
                            className="w-full border rounded px-2 py-1"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-gray-500">
                            {cert.expiry ? `Expires: ${cert.expiry}` : `Completed: ${cert.completed}`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Stats - Read Only */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Activity Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center text-xs mb-1">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    Cases Reviewed
                  </div>
                  <p className="text-lg font-semibold">247</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex items-center text-xs mb-1">
                    <FileCheck className="w-4 h-4 text-green-500 mr-2" />
                    Approvals
                  </div>
                  <p className="text-lg font-semibold">189</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 