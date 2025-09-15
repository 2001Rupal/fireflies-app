




import { X, User, Mail, CheckCircle, HelpCircle, XCircle, Plus, Trash2, Edit, Save, X as CloseIcon, Search, Filter, Download, UserCheck, UserX, Clock, Send } from 'lucide-react';
import { useState, useMemo } from 'react';
import calendarService from './CalendarService';

const getStatusIcon = (status) => {
    switch (status) {
        case 'accepted':
            return <CheckCircle className="text-green-400" size={16} title="Accepted" />;
        case 'declined':
            return <XCircle className="text-red-400" size={16} title="Declined" />;
        case 'tentative':
            return <HelpCircle className="text-blue-400" size={16} title="Tentative" />;
        default:
            return <Clock className="text-yellow-400" size={16} title="Awaiting response" />;
    }
};

const statusOptions = [
    { value: 'needsAction', label: 'Needs Action', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { value: 'accepted', label: 'Accepted', color: 'text-green-400', bg: 'bg-green-500/20' },
    { value: 'declined', label: 'Declined', color: 'text-red-400', bg: 'bg-red-500/20' },
    { value: 'tentative', label: 'Tentative', color: 'text-blue-400', bg: 'bg-blue-500/20' }
];

export default function AttendeesModal({ attendees, onClose, meetingTitle, meetingId, onAttendeesUpdate }) {
    const [isAdding, setIsAdding] = useState(false);
    const [newAttendeeEmail, setNewAttendeeEmail] = useState('');
    const [newAttendeeName, setNewAttendeeName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [selectedAttendees, setSelectedAttendees] = useState(new Set());
    const [bulkAction, setBulkAction] = useState('');

    // Filtered and sorted attendees
    const processedAttendees = useMemo(() => {
        if (!attendees) return [];
        
        let filtered = attendees.filter(attendee => {
            const matchesSearch = !searchTerm || 
                (attendee.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 attendee.email?.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesStatus = statusFilter === 'all' || attendee.responseStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Sort attendees
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.displayName || a.email).localeCompare(b.displayName || b.email);
                case 'email':
                    return a.email.localeCompare(b.email);
                case 'status':
                    return (a.responseStatus || 'needsAction').localeCompare(b.responseStatus || 'needsAction');
                default:
                    return 0;
            }
        });

        return filtered;
    }, [attendees, searchTerm, statusFilter, sortBy]);

    const statusCounts = useMemo(() => {
        if (!attendees) return {};
        
        return attendees.reduce((acc, attendee) => {
            const status = attendee.responseStatus || 'needsAction';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [attendees]);

    const handleAddAttendee = async () => {
        if (!newAttendeeEmail || !isValidEmail(newAttendeeEmail)) {
            setError('Please enter a valid email address');
            return;
        }
        
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            await calendarService.addAttendee(meetingId, newAttendeeEmail, newAttendeeName || undefined);
            setSuccess('Attendee added successfully');
            setNewAttendeeEmail('');
            setNewAttendeeName('');
            setIsAdding(false);
            
            if (onAttendeesUpdate) {
                onAttendeesUpdate();
            }
        } catch (err) {
            setError(err.message || 'Failed to add attendee');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveAttendee = async (email) => {
        if (!confirm(`Are you sure you want to remove ${email} from this meeting?`)) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            await calendarService.removeAttendee(meetingId, email);
            setSuccess('Attendee removed successfully');
            
            if (onAttendeesUpdate) {
                onAttendeesUpdate();
            }
        } catch (err) {
            setError(err.message || 'Failed to remove attendee');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (email, newStatus) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            await calendarService.updateAttendeeStatus(meetingId, email, newStatus);
            setSuccess('Status updated successfully');
            
            if (onAttendeesUpdate) {
                onAttendeesUpdate();
            }
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkStatusUpdate = async () => {
        if (!bulkAction || selectedAttendees.size === 0) return;

        setLoading(true);
        setError(null);
        
        const promises = Array.from(selectedAttendees).map(email => 
            calendarService.updateAttendeeStatus(meetingId, email, bulkAction)
        );

        try {
            await Promise.all(promises);
            setSuccess(`Updated ${selectedAttendees.size} attendees to ${bulkAction}`);
            setSelectedAttendees(new Set());
            setBulkAction('');
            
            if (onAttendeesUpdate) {
                onAttendeesUpdate();
            }
        } catch (err) {
            setError('Some updates failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAttendee = (email) => {
        const newSelected = new Set(selectedAttendees);
        if (newSelected.has(email)) {
            newSelected.delete(email);
        } else {
            newSelected.add(email);
        }
        setSelectedAttendees(newSelected);
    };

    const handleSelectAll = () => {
        if (selectedAttendees.size === processedAttendees.length) {
            setSelectedAttendees(new Set());
        } else {
            setSelectedAttendees(new Set(processedAttendees.map(a => a.email)));
        }
    };

    const exportAttendees = () => {
        if (!attendees || attendees.length === 0) return;

        const csvContent = [
            'Name,Email,Status,Organizer',
            ...attendees.map(attendee => 
                `"${attendee.displayName || ''}","${attendee.email}","${attendee.responseStatus || 'needsAction'}","${attendee.organizer ? 'Yes' : 'No'}"`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${meetingTitle?.replace(/\s+/g, '_') || 'meeting'}_attendees.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    if (!attendees || attendees.length === 0) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center pt-20 z-50" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl m-4 p-0 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/80">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white">Attendees ({attendees.length})</h2>
                        <p className="text-sm text-slate-400 truncate mt-1" title={meetingTitle}>{meetingTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <button
                            onClick={exportAttendees}
                            className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Export attendees list"
                        >
                            <Download size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-4 border-b border-slate-700 bg-slate-700/30 space-y-4">
                    {/* Search and Filter */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search attendees..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-600 border border-slate-500 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status ({attendees.length})</option>
                            <option value="accepted">Accepted ({statusCounts.accepted || 0})</option>
                            <option value="declined">Declined ({statusCounts.declined || 0})</option>
                            <option value="tentative">Tentative ({statusCounts.tentative || 0})</option>
                            <option value="needsAction">Pending ({statusCounts.needsAction || 0})</option>
                        </select>
                        
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="email">Sort by Email</option>
                            <option value="status">Sort by Status</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedAttendees.size > 0 && (
                        <div className="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                            <span className="text-blue-300 text-sm font-medium">
                                {selectedAttendees.size} attendee{selectedAttendees.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Bulk action...</option>
                                    <option value="accepted">Mark Accepted</option>
                                    <option value="declined">Mark Declined</option>
                                    <option value="tentative">Mark Tentative</option>
                                    <option value="needsAction">Mark Pending</option>
                                </select>
                                <button
                                    onClick={handleBulkStatusUpdate}
                                    disabled={!bulkAction || loading}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Add Attendee Form */}
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                        {!isAdding ? (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                <Plus size={16} /> Add Attendee
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="email"
                                        placeholder="Email address *"
                                        value={newAttendeeEmail}
                                        onChange={(e) => setNewAttendeeEmail(e.target.value)}
                                        className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Display name (optional)"
                                        value={newAttendeeName}
                                        onChange={(e) => setNewAttendeeName(e.target.value)}
                                        className="bg-slate-600 border border-slate-500 rounded px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setIsAdding(false);
                                            setNewAttendeeEmail('');
                                            setNewAttendeeName('');
                                        }}
                                        className="px-3 py-1.5 text-slate-300 hover:text-white text-sm rounded border border-slate-600 hover:border-slate-500 transition-colors"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddAttendee}
                                        disabled={!newAttendeeEmail || loading}
                                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent" />
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Attendee'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mx-6 mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mx-6 mb-4 p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-300 text-sm">
                        {success}
                    </div>
                )}

                {/* Attendees List */}
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {processedAttendees.length > 0 ? (
                        <div className="space-y-3">
                            {/* Select All */}
                            <div className="flex items-center gap-3 p-2 border-b border-slate-700/50">
                                <input
                                    type="checkbox"
                                    checked={selectedAttendees.size > 0 && selectedAttendees.size === processedAttendees.length}
                                    onChange={handleSelectAll}
                                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-slate-300 font-medium">
                                    Select All ({processedAttendees.length})
                                </span>
                            </div>

                            {processedAttendees.map((attendee, index) => {
                                const statusOption = statusOptions.find(s => s.value === (attendee.responseStatus || 'needsAction'));
                                
                                return (
                                    <div key={index} className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                                        selectedAttendees.has(attendee.email)
                                            ? 'bg-blue-900/20 border-blue-700/50'
                                            : 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50'
                                    }`}>
                                        {/* Selection Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={selectedAttendees.has(attendee.email)}
                                            onChange={() => handleSelectAttendee(attendee.email)}
                                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                                        />

                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                                            <User size={18} className="text-slate-300" />
                                        </div>

                                        {/* Attendee Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-white truncate">
                                                    {attendee.displayName || attendee.email}
                                                </p>
                                                {attendee.organizer && (
                                                    <span className="inline-flex items-center px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded border border-purple-500/30">
                                                        <UserCheck size={12} className="mr-1" />
                                                        Organizer
                                                    </span>
                                                )}
                                                {attendee.self && (
                                                    <span className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-500/30">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                <Mail size={12} />
                                                <span className="truncate">{attendee.email}</span>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusOption?.bg || 'bg-slate-600/20'} ${statusOption?.color || 'text-slate-400'} border-current/30`}>
                                                {getStatusIcon(attendee.responseStatus)}
                                                <span className="text-sm font-medium capitalize">
                                                    {attendee.responseStatus === 'needsAction' ? 'Pending' : attendee.responseStatus}
                                                </span>
                                            </div>

                                            {/* Status Dropdown */}
                                            <select
                                                value={attendee.responseStatus || 'needsAction'}
                                                onChange={(e) => handleUpdateStatus(attendee.email, e.target.value)}
                                                disabled={loading}
                                                className="bg-slate-600 border border-slate-500 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                            >
                                                {statusOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveAttendee(attendee.email)}
                                                disabled={loading || attendee.organizer}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                title={attendee.organizer ? "Cannot remove organizer" : "Remove attendee"}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <User className="mx-auto text-slate-400 mb-4" size={48} />
                            <h3 className="text-lg font-semibold text-white mb-2">No attendees found</h3>
                            <p className="text-slate-400">
                                {searchTerm || statusFilter !== 'all' 
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No attendees information available'
                                }
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-700 px-6 py-4 bg-slate-800/60">
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                            Changes sync with Google Calendar automatically
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Showing {processedAttendees.length} of {attendees.length} attendees</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}