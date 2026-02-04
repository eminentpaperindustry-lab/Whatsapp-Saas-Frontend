import React, { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { 
  PlusCircle, Trash2, Edit2, X, Globe, Phone, MessageSquare, 
  AlertTriangle, CheckCircle, Upload, Eye, Menu, Layers, 
  Zap, Loader2, RefreshCw, Filter, Search, Download, 
  ChevronDown, ChevronUp, Info, FileText, Image, Video, 
  File, Check, Copy, ExternalLink, Star, BarChart,
  Calendar, Users, Tag, Hash, Type, Link, Smartphone,
  Clock, UploadCloud, Shield, FileCheck, AlertCircle,
  PlayCircle, PauseCircle, EyeOff, Settings, Globe2,
  Bell, CheckSquare, Square, ThumbsUp, ThumbsDown,
  ArrowUpDown, ChevronRight, ChevronLeft, BookOpen,
  Terminal, Wifi, WifiOff, ZapOff, Database
} from 'lucide-react';

// ====================================================================
// HELPER COMPONENTS
// ====================================================================

function AlertModal({ message, type, onClose }) {
  if (!message) return null;
  
  const bgColor = type === 'error' ? 'bg-red-600' : 
                  type === 'warning' ? 'bg-yellow-600' :
                  type === 'info' ? 'bg-blue-600' :
                  'bg-green-600';
  const Icon = type === 'error' ? AlertTriangle : 
               type === 'warning' ? AlertCircle :
               type === 'info' ? Info :
               CheckCircle;
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-xl z-[999] transition-all duration-300 transform animate-slideUp`}>
      <div className="flex items-center justify-between max-w-md">
        <span className="flex items-center font-medium">
          <Icon size={20} className="mr-2"/>
          {message}
        </span>
        <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'delete', confirmText = 'Delete' }) {
  if (!isOpen) return null;

  const buttonColor = type === 'delete' ? 'bg-red-600 hover:bg-red-700' :
                     type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                     'bg-green-600 hover:bg-green-700';

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
        <h3 className={`text-xl font-bold mb-3 ${
          type === 'delete' ? 'text-red-600' : 
          type === 'warning' ? 'text-yellow-600' :
          'text-green-600'
        } border-b pb-2`}>{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 ${buttonColor} text-white rounded-lg transition duration-150`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function BulkActionsModal({ isOpen, onClose, onAction, selectedTemplates }) {
  const [action, setAction] = useState('');

  if (!isOpen) return null;

  const actions = [
    { id: 'submit', label: 'Submit for Approval', icon: UploadCloud, color: 'blue' },
    { id: 'duplicate', label: 'Duplicate Templates', icon: Copy, color: 'purple' },
    { id: 'delete', label: 'Delete Templates', icon: Trash2, color: 'red' },
    { id: 'pause', label: 'Pause Templates', icon: PauseCircle, color: 'yellow' },
    { id: 'export', label: 'Export as JSON', icon: Download, color: 'green' }
  ];

  const handleSubmit = () => {
    if (!action) return;
    onAction(action, selectedTemplates);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Bulk Actions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            <span className="font-semibold">{selectedTemplates.length}</span> templates selected
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTemplates.slice(0, 3).map(t => (
              <span key={t._id} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                {t.name}
              </span>
            ))}
            {selectedTemplates.length > 3 && (
              <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                +{selectedTemplates.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {actions.map(a => (
            <label key={a.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="bulkAction"
                value={a.id}
                checked={action === a.id}
                onChange={(e) => setAction(e.target.value)}
                className="mr-3"
              />
              <a.icon className={`mr-3 text-${a.color}-600`} size={18} />
              <span className="flex-1">{a.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!action}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply Action
          </button>
        </div>
      </div>
    </div>
  );
}

function MetaDebugModal({ isOpen, onClose }) {
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchDebugInfo();
    }
  }, [isOpen]);

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      const response = await API.get('/templates/debug/meta');
      setDebugInfo(response.data);
    } catch (error) {
      console.error('Debug info error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testMetaConnection = async () => {
    try {
      setTestResult({ loading: true });
      const response = await API.get('/templates/debug/meta');
      setTestResult({
        success: true,
        message: 'Meta connection successful',
        data: response.data
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Connection failed'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Terminal size={20} className="mr-2" />
            Meta API Debug
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : debugInfo ? (
          <div className="space-y-6">
            {/* Credentials Status */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-700 mb-3">API Credentials Status</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${debugInfo.credentials?.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    {debugInfo.credentials?.hasToken ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="ml-2 font-medium">Access Token</span>
                  </div>
                  <div className="text-xs mt-1">
                    {debugInfo.credentials?.hasToken ? 'Configured' : 'Missing'}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${debugInfo.credentials?.hasBusinessId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    {debugInfo.credentials?.hasBusinessId ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="ml-2 font-medium">Business ID</span>
                  </div>
                  <div className="text-xs mt-1 truncate">
                    {debugInfo.credentials?.businessId || 'Not set'}
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${debugInfo.credentials?.phoneId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    {debugInfo.credentials?.phoneId ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="ml-2 font-medium">Phone ID</span>
                  </div>
                  <div className="text-xs mt-1">
                    {debugInfo.credentials?.phoneId || 'Not set'}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 text-blue-800 rounded-lg">
                  <div className="font-medium">Graph Version</div>
                  <div className="text-xs mt-1">{debugInfo.credentials?.graphVersion}</div>
                </div>
              </div>
            </div>

            {/* Connection Test */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700">Connection Test</h4>
                <button
                  onClick={testMetaConnection}
                  disabled={testResult?.loading}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  Test Connection
                </button>
              </div>
              
              {testResult && (
                <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="flex items-center">
                    {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span className="ml-2 font-medium">{testResult.message}</span>
                  </div>
                  {testResult.data?.templates && (
                    <div className="text-sm mt-2">
                      Found {testResult.data.templates.length} templates on Meta
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Templates from Meta */}
            {debugInfo.templates && debugInfo.templates.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Templates on Meta ({debugInfo.templates.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {debugInfo.templates.map(t => (
                    <div key={t.id} className="p-3 bg-white rounded border">
                      <div className="flex justify-between">
                        <span className="font-medium">{t.name}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          t.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {t.id} | Language: {t.language} | Category: {t.category}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Display */}
            {debugInfo.error && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                  <AlertCircle size={16} className="mr-2" />
                  Error Details
                </h4>
                <div className="text-sm text-red-600 font-mono bg-red-100 p-3 rounded">
                  {debugInfo.error}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function QualityScoreModal({ isOpen, onClose, template }) {
  if (!isOpen || !template) return null;

  const getScoreColor = (score) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreText = (score) => {
    if (!score) return 'Not Rated';
    if (score >= 4) return 'High Quality';
    if (score >= 3) return 'Medium Quality';
    return 'Low Quality';
  };

  const qualityTips = [
    { title: 'High Quality (4-5)', tips: ['Clear value proposition', 'Relevant to users', 'Good engagement'] },
    { title: 'Medium Quality (3-4)', tips: ['Needs improvement', 'May get limited delivery', 'Review content'] },
    { title: 'Low Quality (1-2.9)', tips: ['Likely to be rejected', 'Poor engagement', 'Revise completely'] }
  ];

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Star size={20} className="mr-2 text-yellow-500" />
            Quality Score
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold ${getScoreColor(template.quality_score)}`}>
            {template.quality_score || 'NR'}
          </div>
          <div className="mt-3 text-lg font-semibold">
            {getScoreText(template.quality_score)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Template: {template.name}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">What is Quality Score?</h4>
            <p className="text-sm text-gray-600">
              Meta assigns quality scores (1-5) based on user engagement and template effectiveness.
              Higher scores get better delivery rates.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Quality Guidelines</h4>
            <div className="space-y-3">
              {qualityTips.map((section, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="font-medium text-sm mb-1">{section.title}</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {section.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start">
                        <span className="mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-700 text-sm mb-1">Tips to Improve Score</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Use clear, concise language</li>
              <li>• Provide real value to users</li>
              <li>• Avoid spammy content</li>
              <li>• Test with users before submitting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceModal({ isOpen, onClose, template, onUpdate }) {
  const [formData, setFormData] = useState({
    privacyPolicyUrl: '',
    termsUrl: '',
    isOptIn: false,
    canUnsubscribe: true
  });

  useEffect(() => {
    if (template?.complianceInfo) {
      setFormData({
        privacyPolicyUrl: template.complianceInfo.privacyPolicyUrl || '',
        termsUrl: template.complianceInfo.termsUrl || '',
        isOptIn: template.complianceInfo.isOptIn || false,
        canUnsubscribe: template.complianceInfo.canUnsubscribe !== false
      });
    }
  }, [template]);

  const handleSubmit = async () => {
    try {
      await onUpdate(template._id, formData);
      handleToast('Compliance settings updated', 'success');
      onClose();
    } catch (error) {
      handleToast('Failed to update compliance settings', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Shield size={20} className="mr-2" />
            Compliance Settings
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Policy URL
            </label>
            <input
              type="url"
              value={formData.privacyPolicyUrl}
              onChange={(e) => setFormData({...formData, privacyPolicyUrl: e.target.value})}
              placeholder="https://example.com/privacy"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Terms & Conditions URL
            </label>
            <input
              type="url"
              value={formData.termsUrl}
              onChange={(e) => setFormData({...formData, termsUrl: e.target.value})}
              placeholder="https://example.com/terms"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isOptIn"
              checked={formData.isOptIn}
              onChange={(e) => setFormData({...formData, isOptIn: e.target.checked})}
              className="h-4 w-4 text-indigo-600"
            />
            <label htmlFor="isOptIn" className="text-sm text-gray-700">
              Users must opt-in before receiving messages
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="canUnsubscribe"
              checked={formData.canUnsubscribe}
              onChange={(e) => setFormData({...formData, canUnsubscribe: e.target.checked})}
              className="h-4 w-4 text-indigo-600"
            />
            <label htmlFor="canUnsubscribe" className="text-sm text-gray-700">
              Users can unsubscribe from messages
            </label>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-700 text-sm mb-1">Compliance Requirements</h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• Required for marketing templates</li>
              <li>• Recommended for all template types</li>
              <li>• Helps prevent rejections</li>
              <li>• Builds user trust</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistoryModal({ isOpen, onClose, template, onRestore }) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && template) {
      fetchVersions();
    }
  }, [isOpen, template]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      // This endpoint should return all versions of a template
      const response = await API.get(`/templates/${template._id}/versions`);
      setVersions(response.data.versions || []);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Clock size={20} className="mr-2" />
            Version History
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-indigo-600" />
          </div>
        ) : versions.length > 0 ? (
          <div className="space-y-4">
            {versions.map((version, idx) => (
              <div key={version._id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">Version {version.version}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(version.updatedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(version.status)}`}>
                      {version.status}
                    </span>
                    {version.isLatest && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        Current
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  {version.body?.substring(0, 100)}...
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created by: {version.createdBy?.name || 'System'}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onRestore(version)}
                      className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => setTemplateToView(version)}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No version history found
          </div>
        )}
      </div>
    </div>
  );
}

function TemplatePreviewModal({ isOpen, onClose, template }) {
  if (!isOpen || !template) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  const formatName = (name) => {
    return name?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || '';
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'IN_REVIEW': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category) => {
    switch(category?.toUpperCase()) {
      case 'UTILITY': return 'text-blue-600 bg-blue-100';
      case 'MARKETING': return 'text-purple-600 bg-purple-100';
      case 'AUTHENTICATION': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleTestSend = async () => {
    setTemplateToTest(template);
    onClose();
  };

  const handleViewMeta = () => {
    if (template.fbTemplateId) {
      window.open(`https://business.facebook.com/wa/manage/message-templates/`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-6 my-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
          <X size={20} />
        </button>
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">
              {formatName(template.name)}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(template.status)}`}>
                {template.status || 'DRAFT'}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(template.category)}`}>
                {template.category || 'UTILITY'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                {template.language || 'en_US'}
              </span>
              {template.quality_score && (
                <button
                  onClick={() => setTemplateToQuality(template)}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center"
                >
                  <Star size={12} className="mr-1" />
                  Score: {template.quality_score}
                </button>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">Template ID</div>
            <div className="text-sm font-mono text-gray-700">{template._id || template.id}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Template Preview */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-gray-700 flex items-center">
                  <Eye size={16} className="mr-2" />
                  Preview
                </h4>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              </div>
              
              {/* WhatsApp Message Bubble */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-300">
                {/* Header */}
                {template.header && template.header.format !== 'NONE' && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Header</div>
                    {template.header.format === 'TEXT' ? (
                      <div className="text-lg font-bold text-gray-800 p-2 bg-blue-50 rounded">
                        {template.header.text || '[HEADER TEXT]'}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-200 rounded text-center">
                        <div className="flex items-center justify-center">
                          {template.header.format === 'IMAGE' && <Image size={24} className="mr-2" />}
                          {template.header.format === 'VIDEO' && <Video size={24} className="mr-2" />}
                          {template.header.format === 'DOCUMENT' && <File size={24} className="mr-2" />}
                          <span className="font-medium">{template.header.format} Attachment</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Body */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Body</div>
                  <div className="text-gray-800 whitespace-pre-wrap p-2 bg-green-50 rounded">
                    {template.body ? (
                      <span dangerouslySetInnerHTML={{ 
                        __html: template.body.replace(/{(\d+)}/g, (match, p1) => 
                          `<span class="bg-yellow-200 px-1 rounded font-mono text-xs font-bold mx-1">\${${p1}}</span>`
                        ) 
                      }} />
                    ) : (
                      <span className="text-gray-400">[BODY TEXT]</span>
                    )}
                  </div>
                </div>
                
                {/* Footer */}
                {template.footer && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Footer</div>
                    <div className="text-sm text-gray-600 p-2 bg-gray-100 rounded">
                      {template.footer}
                    </div>
                  </div>
                )}
                
                {/* Buttons */}
                {template.buttons && template.buttons.length > 0 && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Buttons ({template.buttons.length})</div>
                    <div className="space-y-2">
                      {template.buttons.map((btn, idx) => (
                        <div key={idx} className="flex items-center p-2 bg-purple-50 rounded border border-purple-100">
                          <div className="mr-3">
                            {btn.type === 'URL' && <Link size={16} className="text-blue-600" />}
                            {btn.type === 'PHONE_NUMBER' && <Phone size={16} className="text-green-600" />}
                            {btn.type === 'QUICK_REPLY' && <MessageSquare size={16} className="text-purple-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{btn.text}</div>
                            <div className="text-xs text-gray-500 truncate">
                              {btn.type === 'URL' && (btn.url || '[URL]')}
                              {btn.type === 'PHONE_NUMBER' && (btn.phone || '[PHONE]')}
                              {btn.type === 'QUICK_REPLY' && 'Quick Reply'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Variables Preview</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {template.variables?.map((v, i) => (
                        <div key={i} className="p-2 bg-white border rounded">
                          <div className="font-mono text-sm">{v.placeholder}</div>
                          <div className="text-xs text-gray-500">{v.description}</div>
                          <div className="text-xs text-gray-400">Example: {v.example}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Meta Components</h5>
                    <div className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(template.components?.slice(0, 2), null, 2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Template Details */}
          <div className="space-y-6">
            {/* Variables */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <Hash size={16} className="mr-2" />
                Variables ({template.variables?.length || 0})
              </h4>
              
              {template.variables && template.variables.length > 0 ? (
                <div className="space-y-2">
                  {template.variables.map((variable, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium text-sm">{variable.placeholder}</div>
                        <div className="text-xs text-gray-500">{variable.description}</div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                        {variable.type}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No variables defined</p>
              )}
            </div>

            {/* Meta Information */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                <Info size={16} className="mr-2" />
                Meta Information
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Meta Template ID:</span>
                  <span className="text-sm font-mono text-gray-700 truncate max-w-[150px]">
                    {template.fbTemplateId || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quality Score:</span>
                  <span className={`text-sm font-semibold ${
                    template.quality_score >= 4 ? 'text-green-600' :
                    template.quality_score >= 3 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {template.quality_score || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm text-gray-700">
                    {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Last Updated:</span>
                  <span className="text-sm text-gray-700">
                    {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-700 mb-3">Actions</h4>
              
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(template._id);
                    handleToast('Template ID copied', 'success');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Copy size={16} className="mr-2" />
                  Copy Template ID
                </button>
                
                {template.status === 'APPROVED' && (
                  <button 
                    onClick={handleTestSend}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Smartphone size={16} className="mr-2" />
                    Send Test Message
                  </button>
                )}
                
                {template.fbTemplateId && (
                  <button 
                    onClick={handleViewMeta}
                    className="w-full flex items-center justify-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
                  >
                    <ExternalLink size={16} className="mr-2" />
                    View in Meta Business
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    const data = JSON.stringify(template, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${template.name}_export.json`;
                    a.click();
                    handleToast('Template exported', 'success');
                  }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <Download size={16} className="mr-2" />
                  Export JSON
                </button>

                <button 
                  onClick={() => setTemplateToQuality(template)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition"
                >
                  <Star size={16} className="mr-2" />
                  View Quality Score
                </button>

                <button 
                  onClick={() => setTemplateToCompliance(template)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition"
                >
                  <Shield size={16} className="mr-2" />
                  Compliance Settings
                </button>

                <button 
                  onClick={() => setTemplateToVersions(template)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                >
                  <Clock size={16} className="mr-2" />
                  Version History
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestTemplateModal({ isOpen, onClose, template, onTestSend }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [variables, setVariables] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testMode, setTestMode] = useState('single'); // 'single' or 'batch'

  if (!isOpen || !template) return null;

  const handleSendTest = async () => {
    if (!phoneNumber || !phoneNumber.match(/^\+[1-9]\d{1,14}$/)) {
      handleToast('Please enter a valid phone number in E.164 format (+1234567890)', 'error');
      return;
    }

    setIsSending(true);
    try {
      const result = await onTestSend(template._id, phoneNumber, variables);
      setTestResult(result);
      handleToast('Test message sent successfully', 'success');
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.error || 'Failed to send test message'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleBatchTest = async (phoneNumbers) => {
    // Implement batch testing
    console.log('Batch test:', phoneNumbers);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Send Test Message</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Test Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setTestMode('single')}
              className={`flex-1 py-2 text-sm font-medium ${testMode === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Single Test
            </button>
            <button
              onClick={() => setTestMode('batch')}
              className={`flex-1 py-2 text-sm font-medium ${testMode === 'batch' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            >
              Batch Test
            </button>
          </div>

          {/* Phone Number */}
          {testMode === 'single' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (E.164 format)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Numbers (comma separated)
              </label>
              <textarea
                placeholder="+1234567890, +9876543210"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter up to 5 phone numbers separated by commas
              </p>
            </div>
          )}

          {/* Variables */}
          {template.variables && template.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Variables
              </label>
              <div className="space-y-2">
                {template.variables.map((variable, idx) => (
                  <div key={idx}>
                    <label className="block text-xs text-gray-600 mb-1">
                      {variable.placeholder} ({variable.description})
                    </label>
                    <input
                      type="text"
                      value={variables[variable.placeholder] || ''}
                      onChange={(e) => setVariables({
                        ...variables,
                        [variable.placeholder]: e.target.value
                      })}
                      placeholder={`Value for ${variable.placeholder}`}
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="flex items-center">
                {testResult.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="ml-2">{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={testMode === 'single' ? handleSendTest : handleBatchTest}
              disabled={isSending || !phoneNumber}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Smartphone size={16} className="mr-2" />
                  {testMode === 'single' ? 'Send Test' : 'Send Batch Test'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-8 bg-indigo-100 rounded mt-4 w-1/3"></div>
    </div>
  );
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export default function Templates() {
  // State
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Template Form State
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState('en_US');
  const [category, setCategory] = useState('UTILITY');
  const [headerType, setHeaderType] = useState('NONE');
  const [headerText, setHeaderText] = useState('');
  const [headerExample, setHeaderExample] = useState('');
  const [headerFile, setHeaderFile] = useState(null);
  const [footer, setFooter] = useState('');
  const [buttons, setButtons] = useState([]);
  const [buttonType, setButtonType] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonValue, setButtonValue] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [isSecured, setIsSecured] = useState(false);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState('');
  const [termsUrl, setTermsUrl] = useState('');
  
  // UI State
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('success');
  const [templateToView, setTemplateToView] = useState(null);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateToEdit, setTemplateToEdit] = useState(null);
  const [templateToTest, setTemplateToTest] = useState(null);
  const [templateToQuality, setTemplateToQuality] = useState(null);
  const [templateToCompliance, setTemplateToCompliance] = useState(null);
  const [templateToVersions, setTemplateToVersions] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showMetaDebug, setShowMetaDebug] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  // Refs
  const fileRef = useRef(null);

  // Constants
  const languages = [
    { code: 'en_US', name: 'English (US)' },
    { code: 'en_GB', name: 'English (UK)' },
    { code: 'en', name: 'English' },
    { code: 'hi_IN', name: 'Hindi' },
    { code: 'es_ES', name: 'Spanish' },
    { code: 'fr_FR', name: 'French' },
    { code: 'de_DE', name: 'German' },
    { code: 'pt_BR', name: 'Portuguese (BR)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'bn', name: 'Bengali' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' },
    { code: 'ml', name: 'Malayalam' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'te', name: 'Telugu' },
    { code: 'ur', name: 'Urdu' }
  ];

  const categories = [
    { value: 'UTILITY', label: 'Utility', color: 'bg-blue-100 text-blue-800' },
    { value: 'MARKETING', label: 'Marketing', color: 'bg-purple-100 text-purple-800' },
    { value: 'AUTHENTICATION', label: 'Authentication', color: 'bg-orange-100 text-orange-800' },
    { value: 'TRANSACTIONAL', label: 'Transactional', color: 'bg-teal-100 text-teal-800' }
  ];

  const buttonTypes = [
    { value: 'URL', label: 'Visit Website', icon: Globe },
    { value: 'PHONE_NUMBER', label: 'Call Phone Number', icon: Phone },
    { value: 'QUICK_REPLY', label: 'Quick Reply', icon: MessageSquare }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'IN_REVIEW', label: 'In Review', color: 'bg-blue-100 text-blue-800' },
    { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'REJECTED', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'PAUSED', label: 'Paused', color: 'bg-orange-100 text-orange-800' },
    { value: 'DISABLED', label: 'Disabled', color: 'bg-gray-100 text-gray-800' }
  ];

  // Helper Functions
  const handleToast = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
  };

  const formatName = (name) => {
    return name?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || name;
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'APPROVED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'IN_REVIEW': return 'text-blue-600 bg-blue-100';
      case 'PAUSED': return 'text-orange-600 bg-orange-100';
      case 'DISABLED': return 'text-gray-600 bg-gray-100';
      case 'DRAFT': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        console.log('Auto-refreshing templates...');
        loadData();
      }, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Load Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load templates
      console.log('Loading templates...');
      const templatesRes = await API.get('/templates');
      console.log('Templates response:', templatesRes.data);
      
      // Load stats
      console.log('Loading stats...');
      const statsRes = await API.get('/templates/stats/overview');
      console.log('Stats response:', statsRes.data);
      
      setTemplates(templatesRes.data.templates || []);
      setFilteredTemplates(templatesRes.data.templates || []);
      setStats(statsRes.data.stats);
      
      handleToast('Templates loaded successfully', 'success');
    } catch (error) {
      console.error('Failed to load data:', error);
      handleToast('Failed to load templates', 'error');
      setTemplates([]);
      setFilteredTemplates([]);
      setStats({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        categories: { UTILITY: 0, MARKETING: 0, AUTHENTICATION: 0, TRANSACTIONAL: 0 }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Templates
  useEffect(() => {
    let filtered = templates;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.body?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => 
        template.category === selectedCategory
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(template => 
        template.status === selectedStatus
      );
    }
    
    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(template => 
        template.source === selectedSource
      );
    }
    
    setFilteredTemplates(filtered);
    setSelectedTemplates([]); // Clear selection when filters change
  }, [templates, searchTerm, selectedCategory, selectedStatus, selectedSource]);

  // Reset Form
  const resetForm = useCallback(() => {
    setName('');
    setBody('');
    setLanguage('en_US');
    setCategory('UTILITY');
    setHeaderType('NONE');
    setHeaderText('');
    setHeaderExample('');
    setHeaderFile(null);
    setFooter('');
    setButtons([]);
    setButtonType('');
    setButtonText('');
    setButtonValue('');
    setSubCategory('');
    setIsSecured(false);
    setPrivacyPolicyUrl('');
    setTermsUrl('');
    setTemplateToEdit(null);
    setShowCreateForm(false);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  // Add Button
  const addButton = () => {
    if (!buttonType || !buttonText || !buttonValue) {
      handleToast('Please fill all button fields', 'error');
      return;
    }

    const newButton = {
      type: buttonType,
      text: buttonText,
      ...(buttonType === 'URL' && { url: buttonValue }),
      ...(buttonType === 'PHONE_NUMBER' && { phone: buttonValue }),
      ...(buttonType === 'QUICK_REPLY' && { payload: buttonValue })
    };

    if (buttons.length >= 3) {
      handleToast('Maximum 3 buttons allowed', 'error');
      return;
    }

    setButtons([...buttons, newButton]);
    setButtonType('');
    setButtonText('');
    setButtonValue('');
  };

  // Remove Button
  const removeButton = (index) => {
    const newButtons = [...buttons];
    newButtons.splice(index, 1);
    setButtons(newButtons);
  };

  // Load Template for Edit
  const loadTemplateForEdit = useCallback((template) => {
    console.log('Loading template for edit:', template);
    setTemplateToEdit(template);
    setName(template.name || '');
    setBody(template.body || '');
    setLanguage(template.language || 'en_US');
    setCategory(template.category || 'UTILITY');
    setHeaderType(template.header?.format || 'NONE');
    setHeaderText(template.header?.text || '');
    setHeaderExample(template.header?.example || template.header?.mediaUrl || '');
    setFooter(template.footer || '');
    setButtons(template.buttons || []);
    setSubCategory(template.subCategory || '');
    setIsSecured(template.isSecured || false);
    setPrivacyPolicyUrl(template.complianceInfo?.privacyPolicyUrl || '');
    setTermsUrl(template.complianceInfo?.termsUrl || '');
    setShowCreateForm(true);
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Create/Update Template
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form...');
    
    // Basic validation
    if (!name.trim()) {
      handleToast('Template name is required', 'error');
      return;
    }
    
    if (!body.trim()) {
      handleToast('Template body is required', 'error');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add template data
      formData.append('name', name.trim());
      formData.append('body', body.trim());
      formData.append('language', language);
      formData.append('category', category);
      formData.append('headerType', headerType);
      formData.append('footer', footer);
      formData.append('buttons', JSON.stringify(buttons));
      formData.append('subCategory', subCategory);
      formData.append('isSecured', isSecured.toString());
      formData.append('privacyPolicyUrl', privacyPolicyUrl);
      formData.append('termsUrl', termsUrl);
      
      console.log('Form data entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Add header data
      if (headerType === 'TEXT') {
        formData.append('headerText', headerText);
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType)) {
        if (headerFile) {
          formData.append('headerMedia', headerFile);
        } else if (headerExample) {
          formData.append('headerExample', headerExample);
        }
      }

      let response;
      if (templateToEdit) {
        // Update template
        console.log('Updating template:', templateToEdit._id);
        response = await API.put(`/templates/${templateToEdit._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        handleToast('Template updated successfully', 'success');
      } else {
        // Create template
        console.log('Creating new template');
        response = await API.post('/templates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        if (response.data.metaResponse?.success) {
          handleToast('Template submitted to Meta for approval', 'success');
        } else if (response.data.metaResponse?.error) {
          handleToast(`Created locally but Meta submission failed: ${response.data.metaResponse.error}`, 'warning');
        } else {
          handleToast('Template created successfully', 'success');
        }
      }

      console.log('Response:', response.data);
      
      resetForm();
      loadData();
      
    } catch (error) {
      console.error('Submit error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.errors?.join(', ') || 
                          error.message || 
                          'Failed to save template';
      handleToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Template
  const handleDelete = async (templateId) => {
    try {
      await API.delete(`/templates/${templateId}`);
      handleToast('Template deleted successfully', 'success');
      setTemplateToDelete(null);
      loadData();
    } catch (error) {
      handleToast('Failed to delete template', 'error');
    }
  };

  // Sync Templates from Meta
  const handleSyncMeta = async () => {
    setIsSyncing(true);
    try {
      const response = await API.post('/templates/sync/meta');
      handleToast(response.data.message || 'Templates synced successfully', 'success');
      loadData();
    } catch (error) {
      handleToast(error.response?.data?.error || 'Failed to sync templates', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Send Test Message
  const handleTestSend = async (templateId, phoneNumber, variables) => {
    try {
      const response = await API.post(`/templates/${templateId}/test`, {
        phoneNumber,
        variables
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Sync Single Template Status
  const syncTemplateStatus = async (templateId) => {
    try {
      const response = await API.get(`/templates/${templateId}/sync-status`);
      if (response.data.success) {
        handleToast(`Status updated for template`, 'success');
        // Update local state
        setTemplates(prev => prev.map(t => 
          t._id === templateId ? { ...t, ...response.data.template } : t
        ));
      }
    } catch (error) {
      console.error('Sync status error:', error);
    }
  };

  // Submit for Approval
  const handleSubmitForApproval = async (templateId) => {
    try {
      const response = await API.post(`/templates/${templateId}/submit`);
      handleToast(response.data.message || 'Template submitted for approval', 'success');
      loadData();
    } catch (error) {
      handleToast(error.response?.data?.error || 'Failed to submit template', 'error');
    }
  };

  // Duplicate Template
  const handleDuplicate = async (templateId, newName) => {
    try {
      const response = await API.post(`/templates/${templateId}/duplicate`, {
        newName
      });
      handleToast('Template duplicated successfully', 'success');
      loadData();
      return response.data.template;
    } catch (error) {
      handleToast(error.response?.data?.error || 'Failed to duplicate template', 'error');
      throw error;
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action, templates) => {
    switch (action) {
      case 'delete':
        // Confirm and delete
        const confirmed = window.confirm(`Delete ${templates.length} templates?`);
        if (confirmed) {
          for (const template of templates) {
            await handleDelete(template._id);
          }
        }
        break;
      case 'submit':
        // Submit for approval
        for (const template of templates) {
          await handleSubmitForApproval(template._id);
        }
        break;
      case 'duplicate':
        // Duplicate with new names
        for (const template of templates) {
          const newName = `${template.name}_copy`;
          await handleDuplicate(template._id, newName);
        }
        break;
      case 'export':
        // Export as JSON
        const data = JSON.stringify(templates, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `templates_export_${Date.now()}.json`;
        a.click();
        handleToast(`Exported ${templates.length} templates`, 'success');
        break;
    }
    setShowBulkActions(false);
    setSelectedTemplates([]);
  };

  // Toggle Template Selection
  const toggleTemplateSelection = (template) => {
    setSelectedTemplates(prev => {
      const isSelected = prev.some(t => t._id === template._id);
      if (isSelected) {
        return prev.filter(t => t._id !== template._id);
      } else {
        return [...prev, template];
      }
    });
  };

  // Select/Deselect All
  const toggleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates([...filteredTemplates]);
    }
  };

  // Update Compliance Settings
  const handleUpdateCompliance = async (templateId, complianceData) => {
    try {
      await API.put(`/templates/${templateId}`, {
        complianceInfo: complianceData
      });
      loadData();
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Navbar />
        
        <main className="p-4 md:p-8 flex-1">
          {/* Header with Stats */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Layers size={24} className="text-indigo-600 mr-2" />
                  WhatsApp Templates
                </h2>
                <p className="text-gray-600 mt-1">
                  Create and manage WhatsApp message templates for your business
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Meta Debug Button */}
                <button
                  onClick={() => setShowMetaDebug(true)}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  title="Meta API Debug"
                >
                  <Terminal size={16} className="mr-2" />
                  Debug
                </button>

                {/* Auto Refresh Toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center px-4 py-2 border rounded-lg ${
                    autoRefresh 
                      ? 'bg-green-100 text-green-700 border-green-300' 
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  } hover:bg-opacity-80`}
                  title="Auto Refresh"
                >
                  <RefreshCw size={16} className={`mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                  Auto
                </button>

                {/* Sync from Meta */}
                <button
                  onClick={handleSyncMeta}
                  disabled={isSyncing}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <Loader2 size={16} className="mr-2 animate-spin" />
                  ) : (
                    <RefreshCw size={16} className="mr-2" />
                  )}
                  Sync from Meta
                </button>
                
                {/* Create Template */}
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Create Template
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-gray-800">{stats.total || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Layers size={14} className="mr-1" />
                    Total
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-green-600">{stats.approved || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Check size={14} className="mr-1" />
                    Approved
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Clock size={14} className="mr-1" />
                    Pending
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <X size={14} className="mr-1" />
                    Rejected
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-blue-600">{stats.utility || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <Zap size={14} className="mr-1" />
                    Utility
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">{stats.marketing || 0}</div>
                  <div className="text-sm text-gray-600 flex items-center">
                    <BarChart size={14} className="mr-1" />
                    Marketing
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bulk Actions Bar */}
          {selectedTemplates.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle size={20} className="text-indigo-600 mr-2" />
                  <span className="font-medium text-indigo-700">
                    {selectedTemplates.length} templates selected
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowBulkActions(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Bulk Actions
                  </button>
                  <button
                    onClick={() => setSelectedTemplates([])}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || templateToEdit) && (
            <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-indigo-700 flex items-center">
                  {templateToEdit ? (
                    <>
                      <Edit2 size={20} className="mr-2" />
                      Edit Template: {formatName(templateToEdit.name)}
                    </>
                  ) : (
                    <>
                      <PlusCircle size={20} className="mr-2" />
                      Create New Template
                    </>
                  )}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="order_update, shipping_notification, etc."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      disabled={!!templateToEdit}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use lowercase with underscores. Will be converted automatically.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language *
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Header Type
                    </label>
                    <select
                      value={headerType}
                      onChange={(e) => setHeaderType(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="NONE">No Header</option>
                      <option value="TEXT">Text Header</option>
                      <option value="IMAGE">Image Header</option>
                      <option value="VIDEO">Video Header</option>
                      <option value="DOCUMENT">Document Header</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub Category (Optional)
                    </label>
                    <input
                      type="text"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      placeholder="e.g., order_updates, shipping"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Security & Compliance */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Shield size={16} className="mr-2" />
                    Security & Compliance
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Privacy Policy URL
                      </label>
                      <input
                        type="url"
                        value={privacyPolicyUrl}
                        onChange={(e) => setPrivacyPolicyUrl(e.target.value)}
                        placeholder="https://example.com/privacy"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Terms & Conditions URL
                      </label>
                      <input
                        type="url"
                        value={termsUrl}
                        onChange={(e) => setTermsUrl(e.target.value)}
                        placeholder="https://example.com/terms"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isSecured"
                        checked={isSecured}
                        onChange={(e) => setIsSecured(e.target.checked)}
                        className="h-4 w-4 text-indigo-600"
                      />
                      <label htmlFor="isSecured" className="text-sm text-gray-700">
                        Mark as secured template
                      </label>
                    </div>
                  </div>
                </div>

                {/* Header Content */}
                {headerType !== 'NONE' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3">Header Content</h4>
                    
                    {headerType === 'TEXT' ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Header Text *
                        </label>
                        <input
                          type="text"
                          value={headerText}
                          onChange={(e) => setHeaderText(e.target.value)}
                          placeholder="Enter header text (max 60 characters)"
                          maxLength="60"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload {headerType} File
                          </label>
                          <input
                            ref={fileRef}
                            type="file"
                            onChange={(e) => setHeaderFile(e.target.files[0])}
                            accept={
                              headerType === 'IMAGE' ? 'image/*' :
                              headerType === 'VIDEO' ? 'video/*' :
                              'application/pdf,.doc,.docx,.xlsx'
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or Enter Example URL
                          </label>
                          <input
                            type="url"
                            value={headerExample}
                            onChange={(e) => setHeaderExample(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Body Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Body Text *
                  </label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Enter your message body. Use {{1}}, {{2}}, etc. for variables."
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Use variables like {'{1}'}, {'{2}'} for dynamic content</span>
                    <span>{body.length}/1024 characters</span>
                  </div>
                </div>

                {/* Footer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={footer}
                    onChange={(e) => setFooter(e.target.value)}
                    placeholder="Enter footer text (max 60 characters)"
                    maxLength="60"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Buttons */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">
                    Buttons ({buttons.length}/3)
                  </h4>
                  
                  {/* Button Form */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                      value={buttonType}
                      onChange={(e) => setButtonType(e.target.value)}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select Button Type</option>
                      {buttonTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Button text (max 25 characters)"
                      maxLength="25"
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={buttonValue}
                        onChange={(e) => setButtonValue(e.target.value)}
                        placeholder={
                          buttonType === 'URL' ? 'https://example.com/{1}' :
                          buttonType === 'PHONE_NUMBER' ? '+1234567890' :
                          'Quick reply text'
                        }
                        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={addButton}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  
                  {/* Added Buttons List */}
                  {buttons.length > 0 && (
                    <div className="space-y-2">
                      {buttons.map((btn, idx) => {
                        const ButtonIcon = buttonTypes.find(b => b.value === btn.type)?.icon || Globe;
                        return (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center">
                              <ButtonIcon size={16} className="mr-2 text-purple-600" />
                              <div>
                                <div className="font-medium">{btn.text}</div>
                                <div className="text-xs text-gray-500">
                                  {btn.type === 'URL' && btn.url}
                                  {btn.type === 'PHONE_NUMBER' && btn.phone}
                                  {btn.type === 'QUICK_REPLY' && 'Quick Reply'}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeButton(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="mr-2" />
                        {templateToEdit ? 'Update Template' : 'Create Template'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search templates by name, content, or ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Sources</option>
                  <option value="local">Local</option>
                  <option value="meta">Meta</option>
                  <option value="imported">Imported</option>
                </select>
                
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
                    title="Grid View"
                  >
                    <Menu size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white'}`}
                    title="List View"
                  >
                    <Layers size={18} />
                  </button>
                </div>

                {selectedTemplates.length > 0 && (
                  <button
                    onClick={() => setShowBulkActions(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Bulk Actions ({selectedTemplates.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Templates Grid/List */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Templates ({filteredTemplates.length})
              </h3>
              <div className="flex items-center space-x-4">
                {filteredTemplates.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                      onChange={toggleSelectAll}
                      className="mr-2"
                    />
                    Select All
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Showing {filteredTemplates.length} of {templates.length} templates
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TemplateSkeleton key={i} />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4">
                  <Layers size={48} className="mx-auto" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  No templates found
                </h4>
                <p className="text-gray-500 mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedSource !== 'all'
                    ? 'Try changing your filters'
                    : 'Create your first WhatsApp template'}
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusCircle size={16} className="inline mr-2" />
                  Create Template
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredTemplates.map((template) => (
                  <div key={template._id || template.id} 
                    className={`bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 ${
                      selectedTemplates.some(t => t._id === template._id) ? 'ring-2 ring-indigo-500' : ''
                    }`}
                    onClick={(e) => {
                      if (e.target.type !== 'checkbox') {
                        setTemplateToView(template);
                      }
                    }}
                  >
                    <div className="p-5">
                      {/* Selection Checkbox */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.some(t => t._id === template._id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleTemplateSelection(template);
                            }}
                            className="mr-2"
                          />
                          <div>
                            <h4 className="font-bold text-gray-800 truncate">
                              {formatName(template.name)}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(template.status)}`}>
                                {template.status || 'DRAFT'}
                              </span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {template.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Variables</div>
                          <div className="text-sm font-semibold text-indigo-600">
                            {template.variables?.length || 0}
                          </div>
                        </div>
                      </div>
                      
                      {/* Template Preview */}
                      <div className="mb-4">
                        <div className="text-gray-700 text-sm line-clamp-3 mb-3 min-h-[60px]">
                          {template.body ? (
                            <span dangerouslySetInnerHTML={{
                              __html: template.body
                                .replace(/{(\d+)}/g, (match, p1) => 
                                  `<span class="bg-yellow-100 text-yellow-800 px-1 rounded text-xs font-mono">{${p1}}</span>`
                                )
                                .substring(0, 150)
                            }} />
                          ) : (
                            <span className="text-gray-400">No body content</span>
                          )}
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-1 text-xs">
                          <div className="text-center p-2 bg-gray-50 rounded" title="Buttons">
                            <div className="font-semibold">{template.buttons?.length || 0}</div>
                            <div className="text-gray-500">BTN</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded" title="Header">
                            <div className="font-semibold">{template.header?.format !== 'NONE' ? 'Yes' : 'No'}</div>
                            <div className="text-gray-500">HDR</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded" title="Language">
                            <div className="font-semibold">{template.language?.split('_')[0] || 'EN'}</div>
                            <div className="text-gray-500">LANG</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded" title="Usage">
                            <div className="font-semibold">{template.usageCount || 0}</div>
                            <div className="text-gray-500">USE</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Meta Info */}
                      {template.fbTemplateId && (
                        <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          <div className="flex items-center justify-between">
                            <span className="truncate">Meta: {template.fbTemplateId.substring(0, 10)}...</span>
                            {template.quality_score && (
                              <span className="flex items-center">
                                <Star size={10} className="mr-1" />
                                {template.quality_score}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex justify-between pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTemplateToView(template);
                            }}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                            title="Preview"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {template.status === 'APPROVED' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplateToTest(template);
                              }}
                              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                              title="Send Test"
                            >
                              <Smartphone size={16} />
                            </button>
                          )}
                          
                          {template.status === 'PENDING' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                syncTemplateStatus(template._id);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Sync Status"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                          
                          {(!template.source || template.source === 'local') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                loadTemplateForEdit(template);
                              }}
                              className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(template._id || template.id);
                              handleToast('Template ID copied', 'success');
                            }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Copy ID"
                          >
                            <Copy size={16} />
                          </button>
                          
                          {(!template.source || template.source === 'local') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplateToDelete(template);
                              }}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View
              <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.length === filteredTemplates.length && filteredTemplates.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variables
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTemplates.map((template) => (
                      <tr key={template._id || template.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.some(t => t._id === template._id)}
                            onChange={() => toggleTemplateSelection(template)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatName(template.name)}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {template.body?.substring(0, 80)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(template.status)}`}>
                              {template.status}
                            </span>
                            <div className="text-xs text-gray-600">{template.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{template.language}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                              {template.variables?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            template.source === 'meta' 
                              ? 'bg-blue-100 text-blue-800' 
                              : template.source === 'imported'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {template.source || 'Local'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setTemplateToView(template)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Preview"
                            >
                              <Eye size={16} />
                            </button>
                            
                            {template.status === 'APPROVED' && (
                              <button
                                onClick={() => setTemplateToTest(template)}
                                className="text-green-600 hover:text-green-900"
                                title="Send Test"
                              >
                                <Smartphone size={16} />
                              </button>
                            )}
                            
                            {template.status === 'PENDING' && (
                              <button
                                onClick={() => syncTemplateStatus(template._id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Sync Status"
                              >
                                <RefreshCw size={16} />
                              </button>
                            )}
                            
                            {(!template.source || template.source === 'local') && (
                              <button
                                onClick={() => loadTemplateForEdit(template)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(template._id || template.id);
                                handleToast('Template ID copied', 'success');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy ID"
                            >
                              <Copy size={16} />
                            </button>
                            
                            {(!template.source || template.source === 'local') && (
                              <button
                                onClick={() => setTemplateToDelete(template)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TemplatePreviewModal
        isOpen={!!templateToView}
        onClose={() => setTemplateToView(null)}
        template={templateToView}
      />
      
      <TestTemplateModal
        isOpen={!!templateToTest}
        onClose={() => setTemplateToTest(null)}
        template={templateToTest}
        onTestSend={handleTestSend}
      />
      
      <ConfirmModal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        onConfirm={() => handleDelete(templateToDelete._id)}
        title="Delete Template"
        message={`Are you sure you want to delete "${formatName(templateToDelete?.name)}"?`}
        type="delete"
      />
      
      <BulkActionsModal
        isOpen={showBulkActions}
        onClose={() => setShowBulkActions(false)}
        onAction={handleBulkAction}
        selectedTemplates={selectedTemplates}
      />
      
      <MetaDebugModal
        isOpen={showMetaDebug}
        onClose={() => setShowMetaDebug(false)}
      />
      
      <QualityScoreModal
        isOpen={!!templateToQuality}
        onClose={() => setTemplateToQuality(null)}
        template={templateToQuality}
      />
      
      <ComplianceModal
        isOpen={!!templateToCompliance}
        onClose={() => setTemplateToCompliance(null)}
        template={templateToCompliance}
        onUpdate={handleUpdateCompliance}
      />
      
      <VersionHistoryModal
        isOpen={!!templateToVersions}
        onClose={() => setTemplateToVersions(null)}
        template={templateToVersions}
        onRestore={() => {}}
      />
      
      <AlertModal
        message={alertMessage}
        type={alertType}
        onClose={() => setAlertMessage(null)}
      />
    </div>
  );
}

// Add CSS for animations
const styles = `
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  .animate-slideUp {
    animation: slideUp 0.3s ease-out;
  }
  
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}