import React, { useEffect, useRef, useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import { PlusCircle, Trash2, Edit2, X, Globe, Phone, MessageSquare, AlertTriangle, CheckCircle, Upload, Eye, Menu, Layers, Zap, Loader2 } from 'lucide-react'; 

// ====================================================================
// --- HELPER COMPONENTS (MODALS & SKELETON) ---
// ====================================================================

// --- 1. Toast Notification Modal ---
function AlertModal({ message, type, onClose }) {
    if (!message) return null;
    
    const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';
    const Icon = type === 'error' ? AlertTriangle : CheckCircle;
    
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-xl z-[999] transition-all duration-300 transform`}>
            <div className="flex items-center justify-between">
                <span className="flex items-center font-medium"><Icon size={20} className="mr-2"/>{message}</span>
                <button onClick={onClose} className="ml-4 opacity-75 hover:opacity-100"><X size={18} /></button>
            </div>
        </div>
    );
}

// --- 2. Delete Confirmation Modal ---
function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
                <h3 className="text-xl font-bold mb-3 text-red-600 border-b pb-2">{title}</h3>
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
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-150"
                    >
                        Delete
                    </button>
                </div>
            </div>
            
        </div>
    );
}

// --- 3. Template View Modal ---
function TemplateViewModal({ isOpen, onClose, template }) {
    // FIX: Ensure template and template.body are available before proceeding.
    if (!isOpen || !template) return null; 

    // Ensure template.body is a string, default to empty string if missing
    const templateBody = template.body ?? ''; 

    const formatName = (name) => name?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const header = template.header && template.header.format !== 'NONE' ? template.header : null;
    const button = template.buttons?.length > 0 ? template.buttons[0] : null;

    let buttonIcon = MessageSquare; 
    if (button) {
        if (button.type === 'url') buttonIcon = Globe;
        if (button.type === 'call') buttonIcon = Phone;
    }
    
    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 my-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"><X size={20} /></button>
                <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Preview: {formatName(template.name)}</h3>
                
                <div className="p-4 bg-gray-200 rounded-lg shadow-inner max-h-[60vh] overflow-y-auto">
                    {/* Simplified WhatsApp Message Bubble */}
                    <div className="bg-green-100 p-3 rounded-xl rounded-tl-none shadow-md border border-green-200 max-w-[90%] ml-auto text-right">
                        
                        {/* Header Content */}
                        {header && (
                            <div className={`mb-2 p-2 rounded-lg ${header.format === 'TEXT' ? 'bg-transparent' : 'bg-gray-300'}`}>
                                {header.format === 'TEXT' ? (
                                    <p className="font-bold text-lg text-gray-800">{header.text}</p>
                                ) : (
                                    <span className="text-sm font-medium text-gray-600 block">[{header.format} Placeholder]</span>
                                )}
                            </div>
                        )}

                        {/* Body Content (FIX APPLIED HERE) */}
                        <p key="body" className="text-gray-800 text-left whitespace-pre-wrap text-base">
                            <span dangerouslySetInnerHTML={{ 
                                __html: templateBody.replace(/{{(\d+)}}/g, (match, p1) => `<span class="bg-yellow-200 px-1 rounded font-mono text-sm font-bold">PLACEHOLDER ${p1}</span>`) 
                            }} />
                            {!templateBody && <span className='text-red-500'>Body text is missing.</span>}
                        </p>
                        
                        <span className="block text-xs text-gray-500 mt-1">Sent Just Now</span>
                    </div>

                    {/* Buttons */}
                    {button && (
                        <div className="mt-2 flex flex-col space-y-2 p-2">
                            <button className="w-full bg-white text-blue-600 border border-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 transition duration-150 flex items-center justify-center">
                                {React.createElement(buttonIcon, { size: 16, className: "mr-2" })}
                                {button.type === 'quick_reply' ? button.payload : button.text || button.type}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="mt-4 text-sm text-gray-500 border-t pt-3">
                    <p><strong>Database ID:</strong> <span className='font-mono'>{template._id}</span></p>
                    <p><strong>Template Type:</strong> {template.type || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className={`font-semibold text-orange-500`}>PENDING/REVIEW (API needs to update this)</span></p>
                </div>
            </div>
        </div>
    );
}

// --- 4. Skeleton Loader ---
const TemplateSkeleton = () => (
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


// ====================================================================
// --- MAIN TEMPLATES COMPONENT ---
// ====================================================================

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [name, setName] = useState('');
    const [body, setBody] = useState('');
    const [headerType, setHeaderType] = useState('NONE');
    const [headerValue, setHeaderValue] = useState('');
    const [headerFile, setHeaderFile] = useState(null);
    const [buttonType, setButtonType] = useState('');
    const [buttonPayload, setButtonPayload] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Modals & State
    const [alertMessage, setAlertMessage] = useState(null);
    const [alertType, setAlertType] = useState('success');
    const [isLoading, setIsLoading] = useState(true);
    const [templateToView, setTemplateToView] = useState(null);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [templateToEdit, setTemplateToEdit] = useState(null); // Used to pre-fill form in Edit mode

    const fileRef = useRef(null);

    const buttonOptions = [
        { label: 'Visit website (URL)', value: 'url', placeholder: 'Enter website URL (e.g., https://site.com/{{1}})' },
        { label: 'Call on WhatsApp (PHONE_NUMBER)', value: 'call', placeholder: 'Enter phone number (e.g., +919999999999)' },
        { label: 'Quick reply (QUICK_REPLY)', value: 'quick_reply', placeholder: 'Enter button text (e.g., View Details)' }
    ];

    const handleToast = (message, type = 'success') => {
        setAlertMessage(message);
        setAlertType(type);
    };

    // --- Data Loading ---
    const load = useCallback(async () => {
        setIsLoading(true);
        try { 
            const res = await API.get('/templates'); 
            setTemplates(res.data || []); 
            handleToast('Templates successfully loaded.', 'success');
        } catch(err) { 
            handleToast('Failed to load templates. Please check your API/server connection.', 'error'); 
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    // --- State Reset Function ---
    const resetForm = useCallback(() => {
        setName(''); setBody(''); setHeaderType('NONE'); setHeaderValue(''); setHeaderFile(null);
        setButtonType(''); setButtonPayload(''); 
        setTemplateToEdit(null);
        if (fileRef.current) fileRef.current.value = '';
    }, []);

    // --- CREATE / EDIT (SUBMIT) Logic ---
    async function createOrUpdate(e) {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simple client-side validation
        if (!name || !body) {
            handleToast('Template Name and Body text are required.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            let header = { format: 'NONE' };
            
            // 1. Handle Header Media Upload / Text
            if (headerType === 'TEXT') {
                if (!headerValue) throw new Error("Header text cannot be empty.");
                header = { format: 'TEXT', text: headerValue.replace(/[\n*]/g, ' ') };
            }
            if (headerType === 'IMAGE' || headerType === 'VIDEO') {
                if (headerFile) {
                    // API call to upload media
                    const fd = new FormData();
                    fd.append('file', headerFile);
                    // NOTE: API call requires a proper endpoint and response structure.
                    // This is a placeholder call assuming the API utility handles it.
                    const up = await API.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                    header = { format: headerType, link: up.data.url }; // Assuming API returns { url: "..." }
                } else if (templateToEdit && templateToEdit.header && templateToEdit.header.format === headerType) {
                    // If editing and no new file, reuse old header info (assuming link exists)
                    header = templateToEdit.header;
                } else {
                    throw new Error("Media file is required for Image/Video header.");
                }
            }

            // 2. Handle Buttons Payload
            let buttons = [];
            if (buttonType) {
                if (!buttonPayload) throw new Error("Button payload (URL/Phone/Text) is required.");
                
                let buttonText = buttonOptions.find(b => b.value === buttonType).label.split('(')[0].trim();
                if (buttonType === 'quick_reply') buttonText = buttonPayload;
                
                buttons = [{ 
                    type: buttonType, 
                    text: buttonText, 
                    payload: buttonPayload 
                }];
            }
            
            // 3. Final API Payload
            const payload = { 
                name: name.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]+/g, ''), 
                type: 'template', 
                // FIX: Ensure body is a string and clean it up before sending
                body: body ? body.replace(/[\n*]/g, ' ') : '', 
                header, 
                buttons 
            };
            
            let res;
            if (templateToEdit) {
                // EDIT/UPDATE LOGIC: Use PUT or POST with ID
                res = await API.put(`/templates/${templateToEdit._id}`, payload);
                handleToast('Template successfully updated!', 'success');
            } else {
                // CREATE LOGIC
                res = await API.post('/templates', payload);
                handleToast('Template successfully submitted for review!', 'success');
            }

            resetForm();
            load();

        } catch (err) { 
            console.error(err);
            handleToast(err.response?.data?.error || err.message || `${templateToEdit ? 'Update' : 'Creation'} failed. Please check form details and API response.`, 'error'); 
        } finally {
            setIsSubmitting(false);
        }
    }

    // --- DELETE Logic ---
    async function deleteTemplate(id) {
        try {
            await API.delete(`/templates/${id}`);
            handleToast('Template successfully deleted.', 'success');
            setTemplateToDelete(null);
            load();
        } catch(err) {
            handleToast(err.response?.data?.error || 'Deletion failed.', 'error');
        }
    }
    
    // --- Handlers for Buttons ---
    const handleView = useCallback((template) => {
        setTemplateToView(template);
    }, []);
    
    const handleDeleteClick = useCallback((template) => {
        setTemplateToDelete(template);
    }, []);
    
    const handleEdit = useCallback((template) => {
        setTemplateToEdit(template);
        setName(template.name || '');
        setBody(template.body || '');
        
        // Header
        if (template.header && template.header.format !== 'NONE') {
            setHeaderType(template.header.format);
            setHeaderValue(template.header.format === 'TEXT' ? template.header.text : '');
        } else {
            setHeaderType('NONE'); setHeaderValue('');
        }
        setHeaderFile(null); // Must be null, user needs to re-upload if needed

        // Button
        const btn = template.buttons?.[0];
        if (btn) {
            setButtonType(btn.type);
            setButtonPayload(btn.payload);
        } else {
            setButtonType(''); setButtonPayload('');
        }
        
        // Scroll to form (Optional, for better UX)
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);


    // Utility function for display formatting
    const formatName = (name) => name?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    const currentButtonOption = buttonOptions.find(b => b.value === buttonType);


    return (
        <div className="flex bg-gray-50 min-h-screen">
            <Sidebar />
            <div className="flex-1 min-h-screen flex flex-col">
                <Navbar />
                
                <main className="p-4 md:p-8 flex-1">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                           <Layers size={24} className="text-indigo-600 mr-2"/> Message Templates
                        </h2>
                    </div>

                    {/* --- Template Creation/Edit Form --- */}
                    <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-indigo-200">
                        <h3 className="text-xl font-semibold mb-4 text-indigo-700 border-b pb-2 flex items-center">
                            {templateToEdit ? <Edit2 size={20} className="mr-2"/> : <PlusCircle size={20} className="mr-2"/>} 
                            {templateToEdit ? `Edit Template: ${formatName(templateToEdit.name)}` : 'Create New Template'}
                        </h3>
                        <form onSubmit={createOrUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Row 1 */}
                            <input 
                                value={name} onChange={e => setName(e.target.value)} 
                                placeholder="Template Name (e.g., order_update)" 
                                className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                disabled={!!templateToEdit} // Name cannot change in Meta API
                            />
                            {templateToEdit && <p className='text-xs text-red-500'>Editing mode: Template name cannot be changed.</p>}

                            <textarea 
                                value={body} onChange={e => setBody(e.target.value)} 
                                placeholder="Body text with placeholders {{1}} (Max 1024 chars)" 
                                rows="2"
                                className="p-3 border border-gray-300 rounded-lg md:col-span-2 focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            />

                            {/* Row 2: Header Control */}
                            <div className="space-y-2 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                                <label className="block text-sm font-medium text-indigo-700">Header Type</label>
                                <select 
                                    value={headerType} onChange={e => setHeaderType(e.target.value)} 
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="NONE">No Header</option>
                                    <option value="TEXT">Header Text</option>
                                    <option value="IMAGE">Header Image</option>
                                    <option value="VIDEO">Header Video</option>
                                </select>
                            </div>
                            
                            {/* Header Value Input (Text/File) */}
                            {headerType === 'TEXT' && 
                                <input 
                                    value={headerValue} onChange={e => setHeaderValue(e.target.value)} 
                                    placeholder="Header text (Max 60 chars)" 
                                    className="p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            }
                            {(headerType === 'IMAGE' || headerType === 'VIDEO') && 
                                <div className='flex items-center space-x-2'>
                                    <input 
                                        ref={fileRef} type="file" 
                                        onChange={e => setHeaderFile(e.target.files[0])}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {templateToEdit && (headerType === templateToEdit.header?.format && !headerFile) && 
                                        <p className='text-xs text-gray-500'>Using old media link.</p>
                                    }
                                </div>
                            }
                            {/* Empty space filler for alignment */}
                            {!(headerType === 'TEXT' || headerType === 'IMAGE' || headerType === 'VIDEO') && <div className='md:col-span-2'></div>}


                            {/* Row 3: Button Control */}
                            <div className="space-y-2 bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <label className="block text-sm font-medium text-purple-700">Button Type</label>
                                <select 
                                    value={buttonType} onChange={e => { setButtonType(e.target.value); setButtonPayload(''); }} 
                                    className="p-3 border border-gray-300 rounded-lg w-full focus:ring-purple-500 focus:border-purple-500"
                                >
                                    <option value="">Select Button Type (Optional)</option>
                                    {buttonOptions.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                                </select>
                            </div>
                            
                            {/* Button Payload Input */}
                            {buttonType && currentButtonOption &&
                                <input 
                                    value={buttonPayload} onChange={e => setButtonPayload(e.target.value)} 
                                    placeholder={currentButtonOption.placeholder} 
                                    className="p-3 border border-gray-300 rounded-lg md:col-span-2 focus:ring-purple-500 focus:border-purple-500"
                                    required
                                />
                            }
                            {/* Empty space filler for alignment */}
                            {!buttonType && <div className='md:col-span-2'></div>}


                            <div className="md:col-span-3 pt-4 flex justify-between items-center">
                                {templateToEdit && <button type='button' onClick={resetForm} className='text-gray-600 hover:text-red-600 font-semibold'>Cancel Edit</button>}
                                
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition duration-200 flex items-center disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <Loader2 size={18} className="mr-2 animate-spin"/>
                                    ) : (
                                        <Upload size={18} className="mr-2"/>
                                    )}
                                    {templateToEdit ? 'Save Changes & Resubmit' : 'Save & Submit Template'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- Template List --- */}
                    <h3 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2 flex items-center">
                        <Layers size={20} className="text-gray-600 mr-2"/> Available Templates ({templates.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <TemplateSkeleton key={i} />)
                        ) : templates.length === 0 ? (
                            <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl shadow-lg border border-dashed border-gray-300">
                                No templates found. Use the form above to create a new one.
                            </div>
                        ) : (
                            templates.map(t => (
                                <div key={t._id} className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="text-lg font-bold text-indigo-600 line-clamp-2">{formatName(t.name)}</div>
                                        <div className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t.type}</div>
                                    </div>
                                    
                                    {t.header && t.header.format !== 'NONE' && (
                                        <div className="text-sm font-semibold mt-1 p-2 bg-blue-50 rounded-lg flex items-center">
                                            Header: <span className='ml-2 font-normal text-blue-700'>{t.header.format === 'TEXT' ? t.header.text : t.header.format}</span>
                                        </div>
                                    )}

                                    <div className="text-gray-700 mt-3 mb-4 text-sm line-clamp-3 min-h-[3rem] whitespace-pre-wrap">
                                        {/* FIX APPLIED HERE: Use optional chaining and default to empty string */}
                                        <span dangerouslySetInnerHTML={{ 
                                            __html: (t.body ?? '').replace(/{{(\d+)}}/g, (match, p1) => `<span class="bg-yellow-200 px-1 rounded font-mono text-xs font-bold">PH${p1}</span>`) 
                                        }} />
                                        {!t.body && <span className='text-red-500'>Body missing.</span>}
                                    </div>

                                    {t.buttons && t.buttons.length > 0 && (
                                        <div className="mt-auto pt-3 border-t border-gray-100">
                                            <div className="text-xs font-medium text-purple-700 bg-purple-100 p-2 rounded-lg flex items-center">
                                                {t.buttons[0].type === 'url' ? <Globe size={14} className="mr-1"/> : t.buttons[0].type === 'call' ? <Phone size={14} className="mr-1"/> : <MessageSquare size={14} className="mr-1"/>}
                                                Button: {t.buttons[0].type} → {t.buttons[0].payload.length > 30 ? t.buttons[0].payload.substring(0, 30) + '...' : t.buttons[0].payload}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button 
                                            onClick={() => handleDeleteClick(t)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition" 
                                            title="Delete Template"
                                        >
                                            <Trash2 size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(t)}
                                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition" 
                                            title="Edit Template"
                                        >
                                            <Edit2 size={16}/>
                                        </button>
                                        <button 
                                            onClick={() => handleView(t)}
                                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition" 
                                            title="View Preview"
                                        >
                                            <Eye size={16}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
            
            {/* --- Modals --- */}
            <TemplateViewModal 
                isOpen={!!templateToView}
                onClose={() => setTemplateToView(null)}
                template={templateToView}
            />

            <ConfirmModal
                isOpen={!!templateToDelete}
                onClose={() => setTemplateToDelete(null)}
                onConfirm={() => deleteTemplate(templateToDelete._id)}
                title="Delete Template"
                message={`Are you sure you want to delete the template "${templateToDelete?.name}"? This action cannot be undone.`}
            />

            <AlertModal 
                message={alertMessage} 
                type={alertType} 
                onClose={() => setAlertMessage(null)} 
            />
        </div>
    );
}