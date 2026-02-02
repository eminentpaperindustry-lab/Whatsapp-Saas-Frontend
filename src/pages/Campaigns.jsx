import React, { useEffect, useState, useRef, useCallback } from "react";
import API from "../utils/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

// ==============================================================================
// 1. UTILITY ICONS & GLOBAL COMPONENTS
// ==============================================================================

// --- Icons ---
const TrashIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>;
const PlayIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>;
const PlusIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LoaderIcon = (props) => <svg {...props} className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const CloseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const SuccessIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const ErrorIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const PauseIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const StopIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>;
const CalendarIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const ClockIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

// --- Toast Component ---
const Toast = ({ message, type, onClose }) => {
    const bg = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const Icon = type === 'success' ? SuccessIcon : ErrorIcon;

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!message) return null;

    return (
        <div className={`fixed bottom-5 right-5 ${bg} text-white p-4 rounded-lg shadow-xl flex items-center gap-3 transition-opacity duration-300 z-[60]`}>
            <Icon className="w-6 h-6" />
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors">
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

// --- Modal Component ---
const Modal = ({ title, message, isOpen, onClose, onConfirm, isConfirming }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all duration-300 scale-100 opacity-100">
                <h3 className="text-xl font-bold text-red-700 mb-3 border-b pb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-gray-700 font-medium transition-colors"
                        disabled={isConfirming}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm} 
                        disabled={isConfirming}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isConfirming && <LoaderIcon className="w-5 h-5" />}
                        {isConfirming ? "Deleting..." : "Confirm Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Skeleton Loader ---
const SkeletonLoader = ({ count = 3 }) => (
    <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-100 animate-pulse border border-gray-200">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
        ))}
    </div>
);

// --- Campaign ID Display ---
const CampaignIdDisplay = ({ id }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded border border-gray-200 select-all">
                ID: {id?.substring(0, 12)}...
            </span>
            <button
                onClick={handleCopy}
                className={`p-1 rounded transition-colors text-xs font-medium flex items-center gap-1 ${copied ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            >
                {copied ? (
                    <SuccessIcon className="w-3 h-3" />
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                )}
                {copied ? 'Copied!' : 'Copy'}
            </button>
        </div>
    );
};

// --- Campaign Status Badge ---
const CampaignStatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'draft': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
        </span>
    );
};

// --- Campaign Type Badge ---
const CampaignTypeBadge = ({ type }) => {
    const getTypeConfig = (type) => {
        switch (type) {
            case 'daily': return { bg: 'bg-purple-100', text: 'text-purple-800', icon: '🔄' };
            case 'weekly': return { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: '📆' };
            case 'monthly': return { bg: 'bg-pink-100', text: 'text-pink-800', icon: '📊' };
            case 'fixed': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📅' };
            case 'content_based': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: '🎯' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '📋' };
        }
    };

    const config = getTypeConfig(type);

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} flex items-center gap-1`}>
            {config.icon} {type}
        </span>
    );
};

// ==============================================================================
// 2. MAIN CAMPAIGNS COMPONENT
// ==============================================================================

export default function Campaigns() {
    // --- State Management ---
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddingStep, setIsAddingStep] = useState(false);
    const [isTestRunning, setIsTestRunning] = useState(false);
    const [isControlling, setIsControlling] = useState(false);
    
    // --- Toast/Modal State ---
    const [toast, setToast] = useState({ message: '', type: '' });
    const [campaignModal, setCampaignModal] = useState({ isOpen: false, campaignId: null });
    const [stepModal, setStepModal] = useState({ isOpen: false, stepId: null });

    // --- Data State ---
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [steps, setSteps] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [sections, setSections] = useState([]);
    const [campaignStats, setCampaignStats] = useState(null);

    // --- Campaign Form State ---
    const [newName, setNewName] = useState("");
    const [selectedSections, setSelectedSections] = useState([]);
    const [campaignType, setCampaignType] = useState("fixed");
    const [autoStart, setAutoStart] = useState(false);
    const [repeatCount, setRepeatCount] = useState(0);
    const [contentType, setContentType] = useState("text");
    const [contentId, setContentId] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDay, setSelectedDay] = useState(1);

    // --- Step Form State ---
    const [stepForm, setStepForm] = useState({
        sequence: 1,
        day: 1,
        type: "text",
        text: "",
        templateId: "",
        mediaUrl: "",
        caption: "",
        dayOfWeek: 0,
        dayOfMonth: 1,
        stepTime: "09:00",
        condition: "always"
    });

    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // --- Utility Functions ---
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // --- Data Loading Functions ---
    useEffect(() => {
        async function loadSections() {
            try {
                console.log('🔄 Loading sections...');
                const res = await API.get('/sections');
                console.log('✅ Sections loaded:', res.data.length);
                setSections(res.data);
            } catch (err) {
                console.error("Failed to load sections", err);
            }
        }
        loadSections();
    }, []);

    const loadCampaigns = async () => {
        setIsLoading(true);
        try {
            const res = await API.get("/campaigns");
            setCampaigns(res.data || []);
            showToast(`Loaded ${res.data?.length || 0} campaigns`, 'success');
        } catch (err) {
            console.error("Failed to load campaigns:", err);
            showToast(err.response?.data?.error || "Failed to load campaigns.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const loadSteps = async (campaignId) => {
        if (!campaignId) {
            setSteps([]);
            return;
        }
        try {
            const res = await API.get(`/campaigns/${campaignId}/steps`);
            const loadedSteps = res.data || [];
            setSteps(loadedSteps);
            
            // Calculate next sequence for selected day
            const daySteps = loadedSteps.filter(s => s.day === selectedDay);
            const nextSequence = daySteps.length + 1;
            
            setStepForm(s => ({ 
                ...s, 
                sequence: nextSequence,
                day: selectedDay,
                // Reset form fields for new step
                text: "",
                templateId: "",
                mediaUrl: "",
                caption: ""
            }));
        } catch (err) {
            console.error("Failed to load steps:", err);
            showToast(err.response?.data?.error || "Failed to load steps.", 'error');
        }
    };

    const loadCampaignStats = async (campaignId) => {
        try {
            const res = await API.get(`/campaigns/${campaignId}/stats`);
            setCampaignStats(res.data);
        } catch (err) {
            console.error("Failed to load campaign stats:", err);
        }
    };

    const loadTemplates = async () => { 
        try { 
            console.log('🔄 Loading templates...');
            const res = await API.get('/templates/meta-templates');
            
            if (res.data.success) {
                const templates = res.data.templates;
                setTemplates(templates);
                showToast(`Loaded ${templates.length} templates`, 'success');
            } else {
                setTemplates([]);
                showToast(res.data.error || "Failed to load templates", 'error');
            }
        } catch (err) { 
            console.error('❌ Error loading templates:', err);
            setTemplates([]);
            showToast("Error loading templates", 'error');
        } 
    };

    useEffect(() => {
        loadCampaigns();
        loadTemplates();
    }, []);

    // --- Campaign Actions ---
    const createCampaign = async () => {
        console.log('🎯 Creating campaign...');
        
        if (!newName.trim()) {
            showToast("Campaign name is required", 'error');
            return;
        }

        if (selectedSections.length === 0) {
            showToast("Please select at least one section", 'error');
            return;
        }

        setIsCreating(true);
        try {
            const campaignData = {
                name: newName,
                sectionIds: selectedSections,
                description,
                campaignType,
                autoStart,
                repeatCount: parseInt(repeatCount) || 0
            };

            // Add content for content_based campaigns
            if (campaignType === 'content_based') {
                if (!contentId.trim()) {
                    showToast("Content is required for content-based campaigns", 'error');
                    setIsCreating(false);
                    return;
                }
                campaignData.contentType = contentType;
                campaignData.contentId = contentId;
            }

            console.log('📤 Sending campaign data:', campaignData);
            
            const res = await API.post('/campaigns', campaignData);
            
            console.log('✅ Campaign created:', res.data);
            
            setCampaigns([res.data, ...campaigns]);
            
            // Reset form
            setNewName('');
            setSelectedSections([]);
            setDescription('');
            setCampaignType('fixed');
            setAutoStart(false);
            setRepeatCount(0);
            setContentType('text');
            setContentId('');
            setSelectedDay(1);
            
            showToast('Campaign created successfully', 'success');
        } catch (err) {
            console.error('❌ Error creating campaign:', err);
            showToast(err.response?.data?.error || 'Error creating campaign', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const selectCampaign = async (c) => {
        setSelectedCampaign(c);
        setSelectedDay(1);
        await loadSteps(c._id || c.id);
        await loadCampaignStats(c._id || c.id);
    };

    const openCampaignDeleteModal = (campaignId) => {
        setCampaignModal({ isOpen: true, campaignId: campaignId });
    };

    const deleteCampaign = async () => {
        const campaignId = campaignModal.campaignId;
        if (!campaignId) return;

        setIsDeleting(true);
        
        try {
            await API.delete(`/campaigns/${campaignId}`);
            
            setCampaigns(prev => prev.filter(c => c._id !== campaignId));
            if (selectedCampaign?._id === campaignId) {
                setSelectedCampaign(null);
                setSteps([]);
                setCampaignStats(null);
                setSelectedDay(1);
            }
            showToast("Campaign deleted successfully!");
        } catch (err) {
            console.error("Delete campaign failed:", err);
            showToast(err.response?.data?.error || "Delete campaign failed", 'error');
        } finally {
            setIsDeleting(false);
            setCampaignModal({ isOpen: false, campaignId: null });
        }
    };

    // --- Campaign Control Actions ---
    const controlCampaign = async (action) => {
        if (!selectedCampaign) return;
        
        setIsControlling(true);
        try {
            await API.post(`/campaigns/${selectedCampaign._id}/control`, { action });
            
            // Update local campaign state
            setSelectedCampaign(prev => ({
                ...prev,
                status: action === 'pause' ? 'paused' : 
                       action === 'start' || action === 'resume' ? 'active' : 
                       action === 'stop' ? 'completed' : prev.status
            }));
            
            // Update in campaigns list
            setCampaigns(prev => prev.map(c => 
                c._id === selectedCampaign._id 
                    ? { ...c, status: action === 'pause' ? 'paused' : 
                             action === 'start' || action === 'resume' ? 'active' : 
                             action === 'stop' ? 'completed' : c.status }
                    : c
            ));
            
            showToast(`Campaign ${action}ed successfully`, 'success');
        } catch (err) {
            console.error("Campaign control failed:", err);
            showToast(err.response?.data?.error || `Failed to ${action} campaign`, 'error');
        } finally {
            setIsControlling(false);
        }
    };

    // --- Step Actions ---
    const handleUploadFile = async () => {
        const f = fileRef.current?.files?.[0];
        if (!f) return showToast("Choose a file first", 'error');
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", f);
            const res = await API.post("/media/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            const url = res.data.url || res.data.secure_url || res.data.path || res.data;
            if (!url) throw new Error("No URL returned from upload");
            setStepForm((s) => ({ ...s, mediaUrl: url }));
            showToast("Upload successful");
        } catch (err) {
            console.error("Upload failed:", err);
            showToast(err.response?.data?.error || "Upload failed", 'error');
        } finally {
            setUploading(false);
        }
    };
    
    const addStep = async () => {
        if (!selectedCampaign) return showToast("Select a campaign first", 'error');
        
        // Validate sequence uniqueness for same day
        const isDuplicate = steps.some(step => 
            step.sequence === stepForm.sequence && step.day === stepForm.day
        );
        
        if (isDuplicate) {
            showToast("This sequence number already exists for this day.", 'error');
            return;
        }

        const payload = {
            sequence: Number(stepForm.sequence),
            day: stepForm.day,
            type: stepForm.type,
            stepTime: stepForm.stepTime,
            condition: stepForm.condition
        };

        // Add specific fields based on type
        if (stepForm.type === "text") {
            if (!stepForm.text?.trim()) return showToast("Enter message text", 'error');
            payload.body = stepForm.text.trim();
        } else if (stepForm.type === "media") {
            if (!stepForm.mediaUrl?.trim()) return showToast("Provide media URL", 'error');
            payload.mediaUrl = stepForm.mediaUrl.trim();
            payload.caption = stepForm.caption || "";
        } else if (stepForm.type === "template") {
            if (!stepForm.templateId) return showToast("Select a template", 'error');
            const [templateName, language] = stepForm.templateId.split("::");
            payload.templateName = templateName;
            payload.language = language;
        }

        // Add scheduling based on campaign type
        if (selectedCampaign.campaignType === 'weekly') {
            payload.dayOfWeek = stepForm.dayOfWeek;
        } else if (selectedCampaign.campaignType === 'monthly') {
            payload.dayOfMonth = stepForm.dayOfMonth;
        }

        setIsAddingStep(true);
        try {
            console.log('📤 Adding step:', payload);
            await API.post(`/campaigns/${selectedCampaign._id}/steps`, payload);
            await loadSteps(selectedCampaign._id);
            
            // Reset step form with next sequence for same day
            const daySteps = steps.filter(s => s.day === stepForm.day);
            const nextSequence = daySteps.length + 1;
            setStepForm({
                sequence: nextSequence,
                day: stepForm.day,
                type: "text",
                text: "",
                templateId: "",
                mediaUrl: "",
                caption: "",
                dayOfWeek: 0,
                dayOfMonth: 1,
                stepTime: "09:00",
                condition: "always"
            });
            
            showToast("Step added successfully!");
        } catch (err) {
            console.error("Add step failed:", err);
            showToast(err.response?.data?.error || "Add step failed", 'error');
        } finally {
            setIsAddingStep(false);
        }
    };

    const openStepDeleteModal = (stepId) => {
        setStepModal({ isOpen: true, stepId: stepId });
    };

    const deleteStep = async () => {
        const stepId = stepModal.stepId;
        if (!selectedCampaign || !stepId) return;
        
        setIsDeleting(true); 
        try {
            await API.delete(`/campaigns/${selectedCampaign._id}/steps/${stepId}`);
            await loadSteps(selectedCampaign._id);
            showToast("Step deleted successfully!");
        } catch (err) {
            console.error("Delete step failed:", err);
            showToast(err.response?.data?.error || "Delete failed", 'error');
        } finally {
            setIsDeleting(false);
            setStepModal({ isOpen: false, stepId: null });
        }
    };

    const resetStepForm = () => {
        const daySteps = steps.filter(s => s.day === stepForm.day);
        const nextSequence = daySteps.length + 1;
        setStepForm({
            sequence: nextSequence,
            day: stepForm.day,
            type: "text",
            text: "",
            templateId: "",
            mediaUrl: "",
            caption: "",
            dayOfWeek: 0,
            dayOfMonth: 1,
            stepTime: "09:00",
            condition: "always"
        });
    };

    // --- Trigger Actions ---
    const triggerTest = async () => {
        if (!selectedCampaign) return showToast("Select a campaign", 'error');
        
        setIsTestRunning(true);
        try {
            console.log('🧪 Triggering test for campaign:', selectedCampaign._id);
            await API.post(`/campaigns/${selectedCampaign._id}/trigger?test=true`);
            showToast("Test triggered successfully. Check logs for status.");
        } catch (err) {
            console.error("Trigger failed:", err);
            showToast(err.response?.data?.error || "Trigger failed", 'error');
        } finally {
            setIsTestRunning(false);
        }
    };

    const triggerContentBased = async () => {
        if (!selectedCampaign) return showToast("Select a campaign", 'error');
        
        if (selectedCampaign.campaignType !== 'content_based') {
            showToast("This is not a content-based campaign", 'error');
            return;
        }
        
        setIsTestRunning(true);
        try {
            console.log('🚀 Triggering content-based campaign:', selectedCampaign._id);
            await API.post(`/campaigns/${selectedCampaign._id}/trigger-content`);
            showToast("Content-based campaign triggered successfully.");
        } catch (err) {
            console.error("Trigger failed:", err);
            showToast(err.response?.data?.error || "Trigger failed", 'error');
        } finally {
            setIsTestRunning(false);
        }
    };

    // --- Section Selection Helper ---
    const toggleSection = (sectionId) => {
        setSelectedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    };

    const selectAllSections = () => {
        if (selectedSections.length === sections.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections(sections.map(s => s._id));
        }
    };

    // Get selected section names
    const getSelectedSectionNames = () => {
        return selectedSections
            .map(id => sections.find(s => s._id === id)?.name)
            .filter(name => name)
            .join(', ');
    };

    // Get campaign section names
    const getCampaignSectionNames = (campaign) => {
        if (!campaign.sectionIds) return 'No sections';
        return campaign.sectionIds
            .map(id => sections.find(s => s._id === id)?.name)
            .filter(name => name)
            .join(', ');
    };

    // When selectedDay changes, update step form
    useEffect(() => {
        if (selectedCampaign) {
            const daySteps = steps.filter(step => step.day === selectedDay);
            setStepForm(prev => ({
                ...prev,
                day: selectedDay,
                sequence: daySteps.length + 1
            }));
        }
    }, [selectedDay, steps]);

    // ==============================================================================
    // 3. UI RENDERING
    // ==============================================================================

    const selectedTemplate = templates.find(t => t.id === stepForm.templateId);

    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-8 flex-1">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                        🚀 WhatsApp Campaigns
                    </h2>

                    {/* Campaign Creation Section */}
                    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Create New Campaign</h3>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left Column - Basic Info */}
                            <div className="space-y-6">
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 p-1 rounded">1</span>
                                        Campaign Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="e.g., Welcome Campaign"
                                        className="mt-2 block w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        disabled={isCreating}
                                    />
                                </div>
                                
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 p-1 rounded">2</span>
                                        Campaign Type *
                                    </label>
                                    <div className="relative">
                                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                        <select
                                            value={campaignType}
                                            onChange={(e) => setCampaignType(e.target.value)}
                                            className="mt-2 block w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all"
                                            disabled={isCreating}
                                        >
                                            <option value="fixed">📅 Fixed (Day-wise steps)</option>
                                            <option value="daily">🔄 Daily (Same day, different times)</option>
                                            <option value="weekly">📆 Weekly (Specific days)</option>
                                            <option value="monthly">📊 Monthly (Specific dates)</option>
                                            <option value="content_based">🎯 Content-Based (Manual trigger)</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 p-1 rounded">3</span>
                                        Select Sections *
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">
                                                Selected: {selectedSections.length} section(s)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={selectAllSections}
                                                className="text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded"
                                            >
                                                {selectedSections.length === sections.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                                            {sections.length > 0 ? (
                                                sections.map((section) => (
                                                    <div key={section._id} className="flex items-center p-2 hover:bg-gray-50 rounded">
                                                        <input
                                                            type="checkbox"
                                                            id={`section-${section._id}`}
                                                            checked={selectedSections.includes(section._id)}
                                                            onChange={() => toggleSection(section._id)}
                                                            className="h-4 w-4 text-blue-600 rounded"
                                                            disabled={isCreating}
                                                        />
                                                        <label htmlFor={`section-${section._id}`} className="ml-2 text-sm text-gray-700 flex-1 cursor-pointer">
                                                            👥 {section.name} ({section.contacts?.length || 0} contacts)
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center p-4 text-gray-500">
                                                    ❌ No sections available. Create a section first.
                                                </div>
                                            )}
                                        </div>
                                        {selectedSections.length > 0 && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                <p className="text-sm text-blue-700">
                                                    📋 Selected: {getSelectedSectionNames()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-600 p-1 rounded">4</span>
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="3"
                                        placeholder="What is this campaign about? Describe the purpose..."
                                        className="mt-2 block w-full border border-gray-300 p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                                        disabled={isCreating}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Campaign Settings */}
                            <div className="space-y-6">
                                {/* CONTENT-BASED Campaign Settings */}
                                {campaignType === 'content_based' && (
                                    <div className="bg-gradient-to-r from-orange-50 to-white p-5 rounded-xl border border-orange-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="bg-orange-100 p-2 rounded-lg">
                                                <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                                                </svg>
                                            </div>
                                            <h4 className="font-bold text-gray-800">Content Settings</h4>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type *</label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setContentType('text'); setContentId(''); }}
                                                        className={`p-3 rounded-lg text-sm font-medium transition-all ${contentType === 'text'
                                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        disabled={isCreating}
                                                    >
                                                        ✏️ Text
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setContentType('template'); setContentId(''); }}
                                                        className={`p-3 rounded-lg text-sm font-medium transition-all ${contentType === 'template'
                                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        disabled={isCreating}
                                                    >
                                                        📋 Template
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setContentType('media'); setContentId(''); }}
                                                        className={`p-3 rounded-lg text-sm font-medium transition-all ${contentType === 'media'
                                                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        disabled={isCreating}
                                                    >
                                                        🖼️ Media
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                                                {contentType === 'text' && (
                                                    <textarea
                                                        value={contentId}
                                                        onChange={(e) => setContentId(e.target.value)}
                                                        rows="4"
                                                        placeholder="Type your message here..."
                                                        className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                                                        disabled={isCreating}
                                                    />
                                                )}
                                                
                                                {contentType === 'template' && (
                                                    <div className="relative">
                                                        <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                        <select
                                                            value={contentId}
                                                            onChange={(e) => setContentId(e.target.value)}
                                                            className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none transition-all"
                                                            disabled={isCreating}
                                                        >
                                                            <option value="">Select a template...</option>
                                                            {templates.map(t => (
                                                                <option key={t.id} value={t.id}>
                                                                    📄 {t.name} ({t.language})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                                
                                                {contentType === 'media' && (
                                                    <div>
                                                        <input
                                                            type="url"
                                                            value={contentId}
                                                            onChange={(e) => setContentId(e.target.value)}
                                                            placeholder="https://example.com/image.jpg"
                                                            className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all mb-2"
                                                            disabled={isCreating}
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                            Supports images (jpg, png, gif), videos (mp4), and documents (pdf, doc)
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Common Settings */}
                                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                                        </svg>
                                        Advanced Settings
                                    </h4>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-lg">
                                                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <label htmlFor="autoStart" className="text-sm font-medium text-gray-700">
                                                        Auto-start campaign
                                                    </label>
                                                    <p className="text-xs text-gray-500">Start campaign immediately after creation</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    id="autoStart"
                                                    checked={autoStart}
                                                    onChange={(e) => setAutoStart(e.target.checked)}
                                                    className="sr-only peer"
                                                    disabled={isCreating}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                            </label>
                                        </div>
                                        
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Repeat Count
                                                <span className="text-xs text-gray-500 ml-2">(0 = infinite)</span>
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={repeatCount}
                                                    onChange={(e) => setRepeatCount(e.target.value)}
                                                    className="flex-1 border border-gray-300 p-3 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                    disabled={isCreating}
                                                />
                                                <div className="text-center">
                                                    <div className="text-xl font-bold text-blue-600">{repeatCount === "0" ? "∞" : repeatCount}</div>
                                                    <div className="text-xs text-gray-500">times</div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                0 = repeat forever, 1 = run once, 2 = run twice, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${newName.trim() ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">Campaign Name</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${selectedSections.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">Sections ({selectedSections.length})</span>
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap gap-3">
                                    <button 
                                        onClick={loadCampaigns} 
                                        className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-300 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={isLoading || isCreating}
                                    >
                                        {isLoading ? <LoaderIcon className="w-5 h-5" /> : (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                        )}
                                        Refresh Campaigns
                                    </button>
                                    
                                    <button 
                                        onClick={loadTemplates} 
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        disabled={isLoading}
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Reload Templates
                                    </button>
                                    
                                    <button 
                                        onClick={createCampaign} 
                                        disabled={isCreating || !newName.trim() || selectedSections.length === 0}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold transition-all duration-300 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2 transform hover:scale-[1.02]"
                                    >
                                        {isCreating ? (
                                            <>
                                                <LoaderIcon className="w-5 h-5" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                                </svg>
                                                Create Campaign
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign List and Details */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Campaign List */}
                        <div className="md:col-span-1">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-xl text-gray-700">
                                    All Campaigns ({campaigns.length})
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {campaigns.filter(c => c.status === 'active').length} active
                                </span>
                            </div>
                            
                            <div className="space-y-3 bg-white p-4 rounded-xl shadow-lg h-[600px] overflow-y-auto">
                                {/* SKELETON LOADER */}
                                {isLoading ? (
                                    <SkeletonLoader count={5} />
                                ) : (
                                    campaigns.map((c) => (
                                        <div
                                            key={c._id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all flex justify-between items-start ${selectedCampaign && selectedCampaign._id === c._id
                                                ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
                                                : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                                            }`}
                                        >
                                            <div onClick={() => selectCampaign(c)} className="flex-1 mr-2">
                                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                    {c.name}
                                                    <CampaignTypeBadge type={c.campaignType} />
                                                    <CampaignStatusBadge status={c.status} />
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Sections: {getCampaignSectionNames(c)}
                                                </div>
                                                {c.description && (
                                                    <div className="text-xs text-gray-600 mt-1 truncate">
                                                        {c.description}
                                                    </div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Created: {new Date(c.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            
                                            {/* DELETE BUTTON */}
                                            <button 
                                                onClick={() => openCampaignDeleteModal(c._id)}
                                                className="p-1 text-red-500 hover:text-red-700 rounded-full transition-colors disabled:opacity-50 ml-2"
                                                disabled={isDeleting || isCreating}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))
                                )}
                                
                                {campaigns.length === 0 && !isLoading && (
                                    <div className="text-gray-500 p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                                        <div className="text-4xl mb-2">📋</div>
                                        <div className="font-medium mb-1">No campaigns found</div>
                                        <div className="text-sm">Create your first campaign above!</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Campaign Details and Step Management */}
                        <div className="md:col-span-2">
                            {!selectedCampaign ? (
                                <div className="p-10 bg-white rounded-xl shadow-lg text-center text-gray-500 border-2 border-dashed border-gray-300">
                                    <div className="text-4xl mb-4">👈</div>
                                    <div className="text-xl font-medium mb-2">Select a Campaign</div>
                                    <div className="text-sm">Choose a campaign from the list to view and manage its steps</div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    {/* Campaign Header */}
                                    <div className="flex justify-between items-start pb-4 mb-6 border-b border-gray-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-gray-800">{selectedCampaign.name}</h3>
                                                <CampaignTypeBadge type={selectedCampaign.campaignType} />
                                                <CampaignStatusBadge status={selectedCampaign.status} />
                                            </div>
                                            
                                            <CampaignIdDisplay id={selectedCampaign._id} />
                                            
                                            {selectedCampaign.description && (
                                                <p className="text-gray-600 mt-2">{selectedCampaign.description}</p>
                                            )}
                                            
                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                                <div>
                                                    <span className="font-medium">Sections:</span>{' '}
                                                    {getCampaignSectionNames(selectedCampaign)}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Type:</span> {selectedCampaign.campaignType}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Created:</span>{' '}
                                                    {new Date(selectedCampaign.createdAt).toLocaleDateString()}
                                                </div>
                                                {selectedCampaign.nextExecutionDate && (
                                                    <div className="text-green-600 font-medium">
                                                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                                                        Next: {new Date(selectedCampaign.nextExecutionDate).toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Campaign Control Buttons */}
                                        <div className="flex flex-col gap-2 ml-4">
                                            {selectedCampaign.campaignType === 'content_based' ? (
                                                <button 
                                                    onClick={triggerContentBased}
                                                    disabled={isTestRunning}
                                                    className="bg-green-600 hover:bg-green-700 transition-colors text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {isTestRunning ? <LoaderIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                                    {isTestRunning ? "Triggering..." : "Trigger Now"}
                                                </button>
                                            ) : (
                                                <>
                                                    {selectedCampaign.status === 'active' ? (
                                                        <button
                                                            onClick={() => controlCampaign('pause')}
                                                            disabled={isControlling}
                                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <PauseIcon className="w-4 h-4" />
                                                            {isControlling ? "Pausing..." : "Pause Campaign"}
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => controlCampaign(selectedCampaign.status === 'paused' ? 'resume' : 'start')}
                                                            disabled={isControlling}
                                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                            {isControlling ? "Starting..." : 
                                                             selectedCampaign.status === 'paused' ? "Resume Campaign" : "Start Campaign"}
                                                        </button>
                                                    )}
                                                    
                                                    <button
                                                        onClick={() => controlCampaign('stop')}
                                                        disabled={isControlling}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        <StopIcon className="w-4 h-4" />
                                                        {isControlling ? "Stopping..." : "Stop Campaign"}
                                                    </button>
                                                </>
                                            )}
                                            
                                            <button 
                                                onClick={triggerTest} 
                                                disabled={isTestRunning || steps.length === 0}
                                                className="bg-purple-500 hover:bg-purple-600 transition-colors text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {isTestRunning ? <LoaderIcon className="w-4 h-4" /> : "🧪"}
                                                {isTestRunning ? "Running Test..." : "Run Test"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Campaign Stats */}
                                    {campaignStats && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                            <h4 className="font-bold text-lg mb-3 text-blue-700">Campaign Statistics</h4>
                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="text-center p-3 bg-white rounded-lg shadow">
                                                    <div className="text-2xl font-bold text-blue-600">{campaignStats.stepsCount}</div>
                                                    <div className="text-sm text-gray-600">Total Steps</div>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg shadow">
                                                    <div className="text-2xl font-bold text-green-600">{campaignStats.sentMessages}</div>
                                                    <div className="text-sm text-gray-600">Sent Messages</div>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg shadow">
                                                    <div className="text-2xl font-bold text-red-600">{campaignStats.failedMessages}</div>
                                                    <div className="text-sm text-gray-600">Failed Messages</div>
                                                </div>
                                                <div className="text-center p-3 bg-white rounded-lg shadow">
                                                    <div className="text-2xl font-bold text-purple-600">{campaignStats.successRate}%</div>
                                                    <div className="text-sm text-gray-600">Success Rate</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Add Step Form - Show for all except content_based */}
                                    {selectedCampaign.campaignType !== 'content_based' && (
                                        <div className="border border-green-200 bg-green-50 p-4 rounded-xl mb-6">
                                            <h4 className="font-semibold text-green-700 mb-4">Add New Step</h4>
                                            
                                            {/* Day Selection Tabs for Fixed Campaigns */}
                                            {selectedCampaign.campaignType === 'fixed' && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Day for Step</label>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                                                            <button
                                                                key={day}
                                                                type="button"
                                                                onClick={() => setSelectedDay(day)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedDay === day
                                                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                Day {day}
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedDay(selectedDay + 1)}
                                                            className="px-3 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200"
                                                        >
                                                            + Add Day
                                                        </button>
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Selected: <span className="font-bold">Day {selectedDay}</span> • 
                                                        Steps in this day: {steps.filter(s => s.day === selectedDay).length}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                {/* Step Controls */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Sequence No. *
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                (Current steps: {steps.filter(s => s.day === selectedDay).map(s => `#${s.sequence}`).join(', ')})
                                                            </span>
                                                        </label>
                                                        <input 
                                                            type="number" 
                                                            min="1" 
                                                            value={stepForm.sequence} 
                                                            onChange={(e) => setStepForm(s => ({ ...s, sequence: Number(e.target.value) }))}
                                                            className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                            disabled={isAddingStep}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Enter unique sequence number. Steps will execute in this order.
                                                        </p>
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Time for this step (HH:MM) *</label>
                                                        <input
                                                            type="time"
                                                            value={stepForm.stepTime}
                                                            onChange={(e) => setStepForm(s => ({ ...s, stepTime: e.target.value }))}
                                                            className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                            disabled={isAddingStep}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            This step will be sent at this specific time
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Type Selection and Scheduling */}
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Message Type *</label>
                                                        <select
                                                            value={stepForm.type}
                                                            onChange={(e) => setStepForm(s => ({ 
                                                                ...s, 
                                                                type: e.target.value, 
                                                                text: "", 
                                                                mediaUrl: "", 
                                                                caption: "", 
                                                                templateId: "" 
                                                            }))}
                                                            className="mt-1 block w-full border border-gray-300 p-2.5 rounded-lg bg-white"
                                                            disabled={isAddingStep}
                                                        >
                                                            <option value="text">Text Message</option>
                                                            <option value="media">Media Message (Image/Video/File)</option>
                                                            <option value="template">Template Message</option>
                                                        </select>
                                                    </div>
                                                    
                                                    {/* Weekly Campaign Settings */}
                                                    {selectedCampaign.campaignType === 'weekly' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Day of Week for Step {stepForm.sequence}
                                                            </label>
                                                            <select
                                                                value={stepForm.dayOfWeek}
                                                                onChange={(e) => setStepForm(s => ({ ...s, dayOfWeek: Number(e.target.value) }))}
                                                                className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                                disabled={isAddingStep}
                                                            >
                                                                <option value="0">Sunday</option>
                                                                <option value="1">Monday</option>
                                                                <option value="2">Tuesday</option>
                                                                <option value="3">Wednesday</option>
                                                                <option value="4">Thursday</option>
                                                                <option value="5">Friday</option>
                                                                <option value="6">Saturday</option>
                                                            </select>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Monthly Campaign Settings */}
                                                    {selectedCampaign.campaignType === 'monthly' && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Day of Month for Step {stepForm.sequence}
                                                            </label>
                                                            <select
                                                                value={stepForm.dayOfMonth}
                                                                onChange={(e) => setStepForm(s => ({ ...s, dayOfMonth: Number(e.target.value) }))}
                                                                className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                                disabled={isAddingStep}
                                                            >
                                                                {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                                                                    <option key={date} value={date}>
                                                                        {date}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Template Selection */}
                                            {stepForm.type === 'template' && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700">Select Template *</label>
                                                    
                                                    <div className="mt-2">
                                                        {templates.length > 0 ? (
                                                            <div>
                                                                <select
                                                                    value={stepForm.templateId}
                                                                    onChange={(e) => setStepForm(s => ({ ...s, templateId: e.target.value }))}
                                                                    className="w-full border border-gray-300 p-2.5 rounded-lg bg-white"
                                                                    disabled={isAddingStep}
                                                                >
                                                                    <option value="">-- Select a Template --</option>
                                                                    {templates.map(t => (
                                                                        <option key={t.id} value={t.id}>
                                                                            {t.name} ({t.language})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                <div className="flex items-center">
                                                                    <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                    <span className="text-yellow-700 font-medium">No templates loaded</span>
                                                                </div>
                                                                <button
                                                                    onClick={loadTemplates}
                                                                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                                                >
                                                                    Reload Templates
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Content Input Fields */}
                                            {stepForm.type === 'text' && (
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700">Message Body *</label>
                                                    <textarea 
                                                        value={stepForm.text} 
                                                        onChange={(e) => setStepForm(s => ({ ...s, text: e.target.value }))}
                                                        rows="3"
                                                        placeholder="Enter your message text here..."
                                                        className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                        disabled={isAddingStep}
                                                    />
                                                </div>
                                            )}

                                            {stepForm.type === 'media' && (
                                                <div className="mb-4 space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Media URL *</label>
                                                        <input 
                                                            type="url"
                                                            value={stepForm.mediaUrl}
                                                            onChange={(e) => setStepForm(s => ({ ...s, mediaUrl: e.target.value }))}
                                                            placeholder="Paste direct URL of Image/Video/Document"
                                                            className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                            disabled={isAddingStep || uploading}
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">
                                                            Caption (Optional)
                                                        </label>
                                                        <textarea 
                                                            value={stepForm.caption}
                                                            onChange={(e) => setStepForm(s => ({ ...s, caption: e.target.value }))}
                                                            rows="2"
                                                            placeholder="Optional caption for the media"
                                                            className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                            disabled={isAddingStep}
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="file" 
                                                            ref={fileRef} 
                                                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                                                        />
                                                        <button 
                                                            onClick={handleUploadFile} 
                                                            disabled={uploading || isAddingStep}
                                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1 disabled:opacity-50"
                                                        >
                                                            {uploading ? <LoaderIcon className="w-4 h-4" /> : 'Upload & Get URL'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Condition Selection */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700">Send Condition</label>
                                                <select
                                                    value={stepForm.condition}
                                                    onChange={(e) => setStepForm(s => ({ ...s, condition: e.target.value }))}
                                                    className="mt-1 block w-full border border-gray-300 p-2 rounded-lg"
                                                    disabled={isAddingStep}
                                                >
                                                    <option value="always">Always Send</option>
                                                    <option value="if_replied">Only if Contact Replied</option>
                                                    <option value="if_not_replied">Only if Contact Didn't Reply</option>
                                                </select>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-between items-center border-t pt-4 border-green-200">
                                                <div className="text-sm text-gray-600">
                                                    {selectedCampaign.campaignType === 'fixed' ? (
                                                        <span>
                                                            Steps in Day {selectedDay}: {steps.filter(s => s.day === selectedDay).length}
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            Total steps: {steps.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={resetStepForm} 
                                                        className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg text-gray-700 font-medium transition-colors disabled:opacity-50"
                                                        disabled={isAddingStep}
                                                    >
                                                        Reset Form
                                                    </button>
                                                    <button 
                                                        onClick={addStep} 
                                                        disabled={isAddingStep || !stepForm.sequence}
                                                        className="bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isAddingStep ? <LoaderIcon className="w-5 h-5" /> : "Add Step"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Steps List - Show for all except content_based */}
                                    {selectedCampaign.campaignType !== 'content_based' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-bold text-lg text-gray-700">
                                                    {selectedCampaign.campaignType === 'fixed' ? (
                                                        <div className="flex items-center gap-2">
                                                            Campaign Steps ({steps.length})
                                                            <div className="flex gap-1">
                                                                {[...new Set(steps.map(s => s.day))].sort((a,b) => a-b).map(day => (
                                                                    <button
                                                                        key={day}
                                                                        onClick={() => setSelectedDay(day)}
                                                                        className={`px-2 py-1 text-xs rounded ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                                                    >
                                                                        Day {day} ({steps.filter(s => s.day === day).length})
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        `Campaign Steps (${steps.length})`
                                                    )}
                                                </h4>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {steps.length === 0 && (
                                                    <div className="text-gray-500 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                                        <div className="text-3xl mb-2">📝</div>
                                                        <div className="font-medium">No steps defined yet</div>
                                                        <div className="text-sm mt-1">Add your first step above to start building the campaign</div>
                                                    </div>
                                                )}
                                                
                                                {selectedCampaign.campaignType === 'fixed' ? (
                                                    // Show steps filtered by selected day for fixed campaigns
                                                    steps
                                                        .filter(s => s.day === selectedDay)
                                                        .sort((a, b) => a.sequence - b.sequence)
                                                        .map((s) => (
                                                            <div key={s._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:bg-gray-100 transition-colors">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                                        <span className="text-blue-600">Day {s.day} • Step #{s.sequence}</span>
                                                                        <span className="capitalize px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{s.type}</span>
                                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                                            {s.stepTime || '09:00'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-sm text-gray-600 mt-2">
                                                                        {s.type === 'template'
                                                                            ? `Template: ${s.templateName} (${s.language})`
                                                                            : s.type === 'media'
                                                                                ? `Media: ${s.mediaUrl?.substring(0, 50)}...`
                                                                                : `Message: ${s.body ? s.body.substring(0, 80) + (s.body.length > 80 ? '...' : '') : 'No message body'}`}
                                                                    </div>
                                                                    {s.caption && s.type === 'media' && (
                                                                        <div className="text-sm text-gray-500 mt-1">
                                                                            Caption: {s.caption.substring(0, 50)}...
                                                                        </div>
                                                                    )}
                                                                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                                        <div>
                                                                            🎯 Condition: <span className="font-bold">{s.condition}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                
                                                                <button 
                                                                    onClick={() => openStepDeleteModal(s._id)} 
                                                                    className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg ml-4 transition-colors"
                                                                    disabled={isDeleting || isAddingStep}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))
                                                ) : (
                                                    // Show all steps for other campaign types
                                                    steps.map((s) => (
                                                        <div key={s._id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center hover:bg-gray-100 transition-colors">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                                                    <span className="text-blue-600">Step #{s.sequence}</span>
                                                                    <span className="capitalize px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{s.type}</span>
                                                                    {s.dayOfWeek !== undefined && s.dayOfWeek !== null && (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek]}
                                                                        </span>
                                                                    )}
                                                                    {s.dayOfMonth !== undefined && s.dayOfMonth !== null && (
                                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">
                                                                            Day {s.dayOfMonth}
                                                                        </span>
                                                                    )}
                                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                                        {s.stepTime || '09:00'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 mt-2">
                                                                    {s.type === 'template'
                                                                        ? `Template: ${s.templateName} (${s.language})`
                                                                        : s.type === 'media'
                                                                            ? `Media: ${s.mediaUrl?.substring(0, 50)}...`
                                                                            : `Message: ${s.body ? s.body.substring(0, 80) + (s.body.length > 80 ? '...' : '') : 'No message body'}`}
                                                                </div>
                                                                {s.caption && s.type === 'media' && (
                                                                    <div className="text-sm text-gray-500 mt-1">
                                                                        Caption: {s.caption.substring(0, 50)}...
                                                                    </div>
                                                                )}
                                                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                                    <div>
                                                                        🎯 Condition: <span className="font-bold">{s.condition}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={() => openStepDeleteModal(s._id)} 
                                                                className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg ml-4 transition-colors"
                                                                disabled={isDeleting || isAddingStep}
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Content-Based Campaign Info */}
                                    {selectedCampaign.campaignType === 'content_based' && (
                                        <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                                            <h4 className="font-bold text-lg mb-3 text-orange-700">Content-Based Campaign</h4>
                                            <div className="space-y-4">
                                                <div className="p-3 bg-white rounded-lg shadow">
                                                    <div className="font-medium text-gray-700 mb-1">Content Type:</div>
                                                    <div className="text-lg font-semibold text-orange-600 capitalize">{selectedCampaign.contentType}</div>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg shadow">
                                                    <div className="font-medium text-gray-700 mb-1">Content:</div>
                                                    <div className="text-gray-800 font-mono bg-gray-100 p-2 rounded border">
                                                        {selectedCampaign.contentType === 'text' ? selectedCampaign.contentId : 
                                                         selectedCampaign.contentType === 'template' ? `Template: ${selectedCampaign.contentId}` :
                                                         `Media URL: ${selectedCampaign.contentId}`}
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-white rounded-lg shadow">
                                                    <div className="font-medium text-gray-700 mb-1">Sections:</div>
                                                    <div className="text-gray-800 bg-gray-100 p-2 rounded border">
                                                        {getCampaignSectionNames(selectedCampaign)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
                
                {/* --- MODALS --- */}
                <Modal
                    isOpen={campaignModal.isOpen}
                    onClose={() => setCampaignModal({ isOpen: false, campaignId: null })}
                    onConfirm={deleteCampaign}
                    isConfirming={isDeleting}
                    title="Delete Campaign"
                    message={`Are you sure you want to delete the campaign "${campaigns.find(c => c._id === campaignModal.campaignId)?.name || 'this campaign'}"? This will also delete all steps, progress, and logs associated with it. This action cannot be undone.`}
                />
                
                <Modal
                    isOpen={stepModal.isOpen}
                    onClose={() => setStepModal({ isOpen: false, stepId: null })}
                    onConfirm={deleteStep}
                    isConfirming={isDeleting}
                    title="Delete Step"
                    message="Are you sure you want to delete this step? This action cannot be undone and will re-sequence the remaining steps."
                />
                
                {/* --- TOAST NOTIFICATION --- */}
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ message: '', type: '' })} 
                />
            </div>
        </div>
    );
}