'use client';

import React from 'react';
import { apiClient } from '@/lib/api';
import { Gig } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  Users, 
  AlertTriangle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

type EditableGig = Pick<Gig, '_id' | 'title' | 'category' | 'createdAt'> & { 
  bidsCount?: number; 
  maxBids?: number; 
  isHidden?: boolean; 
  location?: string;
};

const PAGE_SIZE = 10;

export default function AdminGigsPage() {
  const [gigs, setGigs] = React.useState<EditableGig[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [category, setCategory] = React.useState<Gig['category'] | ''>('');
  const [page, setPage] = React.useState(1);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 1,
    total: 0
  });
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<EditableGig | null>(null);
  const [form, setForm] = React.useState<{ 
    title: string; 
    description: string; 
    category: Gig['category']; 
    requirements: string[]; 
    maxBids: number;
    location: string;
    contactDetails: {
      email: string;
      phone: string;
      name: string;
      alternateContact: string;
    };
  }>({ 
    title: '', 
    description: '', 
    category: 'website development', 
    requirements: [''], 
    maxBids: 10,
    location: 'Remote',
    contactDetails: {
      email: '',
      phone: '',
      name: '',
      alternateContact: ''
    }
  });
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});

  const load = React.useCallback(async (pageToLoad = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { limit: number; page: number; category?: Gig['category'] } = {
        limit: PAGE_SIZE,
        page: pageToLoad
      };
      if (category) {
        params.category = category;
      }

      const res = await apiClient.getGigs(params);
      const list = Array.isArray(res.data) ? res.data : [];
      setGigs(list.map(j => ({ 
        _id: j._id, 
        title: j.title, 
        category: j.category, 
        createdAt: j.createdAt, 
        bidsCount: (j as any).bidsCount,
        maxBids: (j as any).maxBids,
        isHidden: (j as any).isHidden,
        location: j.location
      })));

      const totalResults = res.total ?? res.count ?? list.length;
      const limitFromApi = res.pagination?.limit ?? PAGE_SIZE;
      const totalPages = Math.max(
        res.pagination?.totalPages ?? (Math.ceil((totalResults || 0) / limitFromApi) || 1),
        1
      );
      const resolvedPage = res.pagination?.page ?? Math.min(pageToLoad, totalPages);

      setPagination({
        page: resolvedPage,
        limit: limitFromApi,
        totalPages,
        total: totalResults
      });
      setPage(resolvedPage);
    } catch (e: any) {
      setError(e?.message || 'Failed to load gigs');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  React.useEffect(() => { load(1); }, [load]);

  const handlePageChange = React.useCallback((targetPage: number) => {
    if (targetPage < 1 || targetPage > pagination.totalPages || targetPage === page) return;
    load(targetPage);
  }, [load, page, pagination.totalPages]);

  const pageSize = pagination.limit || PAGE_SIZE;
  const totalResults = pagination.total ?? gigs.length;
  const totalPages = Math.max(pagination.totalPages || Math.ceil((totalResults || 0) / pageSize) || 1, 1);
  const showingFrom = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = totalResults === 0 ? 0 : Math.min(showingFrom + gigs.length - 1, totalResults);
  const pageNumbers = React.useMemo(() => {
    const pages = Math.max(totalPages, 1);
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = start + maxVisible - 1;
    if (end > pages) {
      end = pages;
      start = Math.max(1, end - maxVisible + 1);
    }

    const numbers: Array<number | string> = [];
    if (start > 1) {
      numbers.push(1);
      if (start > 2) {
        numbers.push('start-ellipsis');
      }
    }
    for (let current = start; current <= end; current += 1) {
      numbers.push(current);
    }
    if (end < pages) {
      if (end < pages - 1) {
        numbers.push('end-ellipsis');
      }
      numbers.push(pages);
    }
    return numbers;
  }, [page, totalPages]);

  const openCreate = () => {
    setForm({ 
      title: '', 
      description: '', 
      category: 'website development', 
      requirements: [''], 
      maxBids: 10,
      location: 'Remote',
      contactDetails: {
        email: '',
        phone: '',
        name: '',
        alternateContact: ''
      }
    });
    setCreating(true);
  };
  const openEdit = async (job: EditableGig) => {
    setEditing(job);
    try {
      const res = await apiClient.getGig(job._id);
      const j = res.data as Gig;
      setForm({
        title: j.title || '',
        description: j.description || '',
        category: j.category,
        requirements: Array.isArray(j.requirements) && j.requirements.length > 0 ? j.requirements : [''],
        maxBids: Number((j as any).maxBids ?? 10),
        location: j.location || 'Remote',
        contactDetails: {
          email: (j as any)?.contactDetails?.bidderContact?.email || (j as any)?.contactDetails?.email || '',
          phone: (j as any)?.contactDetails?.bidderContact?.phone || (j as any)?.contactDetails?.phone || '',
          name: (j as any)?.contactDetails?.bidderContact?.name || (j as any)?.contactDetails?.name || '',
          alternateContact: (j as any)?.contactDetails?.posterContact?.alternateContact || ''
        }
      });
    } catch (e) {
      // Fall back to minimal fields if fetch fails
      setForm((prev) => ({ ...prev, title: job.title || prev.title, category: job.category }));
    }
  };
  const removeGig = async (id: string) => {
    if (!confirm('Delete this gig?')) return;
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.deleteGig(id);
      await load(page);
    } catch (e: any) {
      setError(e?.message || 'Failed to delete job');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGigVisibility = async (id: string, currentHidden: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.toggleGigVisibility(id, !currentHidden);
      toast.success(`Gig ${!currentHidden ? 'hidden' : 'unhidden'} successfully`);
      await load(page);
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle gig visibility');
      toast.error(e?.message || 'Failed to toggle gig visibility');
    } finally {
      setIsLoading(false);
    }
  };

  const submitCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill all required fields');
      toast.error('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.createGig({ 
        title: form.title.trim(), 
        description: form.description.trim(), 
        category: form.category, 
        requirements: form.requirements.filter(Boolean), 
        maxBids: form.maxBids,
        location: form.location.trim() || 'Remote'
      });
      setCreating(false);
      toast.success('Gig created');
      await load(1);
    } catch (e: any) {
      const details = Array.isArray(e?.payload?.errors)
        ? e.payload.errors.map((er: any) => er?.msg || er?.message).filter(Boolean).join('; ')
        : '';
      const msg = details ? `${e?.message || 'Validation errors'}: ${details}` : (e?.message || 'Failed to create gig');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const submitEdit = async () => {
    if (!editing) return;
    if (!form.title.trim() || !form.description.trim()) {
      setError('Please fill all required fields');
      toast.error('Please fill all required fields');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.updateGig(editing._id, { 
        title: form.title.trim(), 
        description: form.description.trim(), 
        category: form.category, 
        requirements: form.requirements.filter(Boolean), 
        maxBids: form.maxBids,
        location: form.location.trim() || 'Remote'
      });
      setEditing(null);
      toast.success('Gig updated');
      await load(page);
    } catch (e: any) {
      const details = Array.isArray(e?.payload?.errors)
        ? e.payload.errors.map((er: any) => er?.msg || er?.message).filter(Boolean).join('; ')
        : '';
      const msg = details ? `${e?.message || 'Validation errors'}: ${details}` : (e?.message || 'Failed to update gig');
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // removed old audit helpers

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">Manage Gigs</h1>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Gig['category'] | '')}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {['website development','graphic design','content writing','social media management','SEO','app development','game development'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button onClick={() => load(1)} className="border rounded px-3 py-2 text-sm">Filter</button>
          <button onClick={openCreate} className="rounded px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90">Create New Gig</button>
        </div>
      </div>

      {error && <div className="text-error text-sm">{error}</div>}

      <div className="overflow-auto rounded border scrollbar-thin">
        <table className="min-w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-2 text-left">Title</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Posted</th>
              <th className="p-2 text-left">Bid Limit</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            )}
            {!isLoading && gigs.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No gigs</td></tr>
            )}
            {!isLoading && gigs.map(job => (
              <tr key={job._id} className="border-t">
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <span>{job.title}</span>
                    {job.isHidden && (
                      <Badge variant="destructive" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-2">{job.category}</td>
                <td className="p-2">{new Date(job.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">
                      {job.bidsCount ?? 0}/{job.maxBids ?? '∞'}
                    </span>
                    {job.maxBids && job.bidsCount && job.bidsCount >= job.maxBids && (
                      <AlertTriangle className="h-3 w-3 text-warning" />
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    {job.isHidden ? (
                      <Badge variant="destructive" className="text-xs">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hidden
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        Visible
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-2 flex gap-2">
                  <button onClick={() => { openEdit(job); }} className="px-2 py-1 text-xs rounded border">Edit</button>
                  <button 
                    onClick={() => toggleGigVisibility(job._id, job.isHidden || false)}
                    className={`px-2 py-1 text-xs rounded border flex items-center gap-1 ${
                      job.isHidden 
                        ? 'border-success/30 text-success hover:bg-success/10' 
                        : 'border-warning/30 text-warning hover:bg-warning/10'
                    }`}
                    disabled={isLoading}
                  >
                    {job.isHidden ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Show
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Hide
                      </>
                    )}
                  </button>
                  <button onClick={() => removeGig(job._id)} className="px-2 py-1 text-xs rounded border border-error/30 text-error">Delete</button>
                  <a href={`/admin/gigs/${job._id}/bids`} className="px-2 py-1 text-xs rounded border">View Bids</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border rounded-lg p-3 bg-card/60">
        <div className="text-sm text-muted-foreground">
          {totalResults === 0 ? 'No gigs to display' : `Showing ${showingFrom}-${showingTo} of ${totalResults} gigs`}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1">
          <button
            className="px-3 py-1 text-sm rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(page - 1)}
            disabled={isLoading || page <= 1}
          >
            Previous
          </button>
          {pageNumbers.map((item, idx) => (
            typeof item === 'number' ? (
              <button
                key={`page-${item}`}
                className={`px-3 py-1 text-sm rounded border ${
                  page === item
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input text-muted-foreground hover:bg-muted'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => handlePageChange(item)}
                disabled={isLoading || page === item}
              >
                {item}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
            )
          ))}
          <button
            className="px-3 py-1 text-sm rounded border border-input text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handlePageChange(page + 1)}
            disabled={isLoading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-error">{error}</div>}

      {(creating || editing) && (
        <div
          className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape' && !isLoading) {
              setCreating(false); setEditing(null);
            }
          }}
        >
          <div className="bg-card w-full sm:max-w-[900px] sm:w-full max-h-[90vh] rounded-t-lg sm:rounded-lg shadow-lg flex flex-col ring-1 ring-border">
            <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-card z-10">
              <div className="font-semibold">{editing ? 'Edit Gig' : 'Create Gig'}</div>
              <Button variant="ghost" size="sm" onClick={() => { if (!isLoading) { setCreating(false); setEditing(null); } }} disabled={isLoading}>Close</Button>
            </div>
            <div className="p-3 overflow-auto flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Title</label>
                  <input
                    className={`w-full border border-input bg-background rounded px-3 py-2 text-sm ${touched.title && !form.title.trim() ? 'border-error/40' : ''}`}
                    value={form.title}
                    placeholder="e.g., Build a responsive portfolio website"
                    onBlur={() => setTouched((t) => ({ ...t, title: true }))}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                  {touched.title && !form.title.trim() && (
                    <div className="text-xs text-error mt-1">Title is required</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    className={`w-full border border-input bg-background rounded px-3 py-2 text-sm ${touched.description && !form.description.trim() ? 'border-error/40' : ''}`}
                    rows={5}
                    value={form.description}
                    placeholder="Describe the scope, deliverables, timeline, and required skills"
                    onBlur={() => setTouched((t) => ({ ...t, description: true }))}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minimum 20 characters</span>
                    <span>{form.description.length} chars</span>
                  </div>
                  {touched.description && !form.description.trim() && (
                    <div className="text-xs text-error mt-1">Description is required</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select
                    className="w-full border border-input bg-background rounded px-3 py-2 text-sm"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value as Gig['category'] })}
                  >
                    {['website development','graphic design','content writing','social media management','SEO','app development','game development'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Requirements</label>
                  <div className="space-y-2">
                    {form.requirements.map((r, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          className="flex-1 border border-input bg-background rounded px-3 py-2 text-sm"
                          value={r}
                          placeholder={idx === 0 ? 'e.g., Experience with React and TailwindCSS' : 'Add another requirement'}
                          onChange={e => setForm({ ...form, requirements: form.requirements.map((x, i) => i===idx ? e.target.value : x) })}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setForm({ ...form, requirements: form.requirements.filter((_, i) => i!==idx) })}
                          disabled={isLoading}
                        >Remove</Button>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, requirements: [...form.requirements, ''] })}
                        disabled={isLoading || form.requirements.length >= 10}
                      >Add Requirement</Button>
                      <div className="text-xs text-muted-foreground">{form.requirements.filter(Boolean).length}/10</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Maximum Bids</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full border border-input bg-background rounded px-3 py-2 text-sm"
                    value={form.maxBids}
                    placeholder="e.g., 10"
                    onChange={e => setForm({ ...form, maxBids: parseInt(e.target.value) || 10 })}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Set the maximum number of bids allowed for this gig. Leave empty for unlimited.
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Primary Location</label>
                  <input
                    className="w-full border border-input bg-background rounded px-3 py-2 text-sm"
                    value={form.location}
                    placeholder="e.g., Remote, Mumbai, Hybrid"
                    onChange={e => setForm({ ...form, location: e.target.value })}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Displayed to freelancers once they unlock the gig.
                  </div>
                </div>
                
                {/* Contact Details Section */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-medium mb-3 text-foreground">Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Your Name *</label>
                      <input
                        className={`w-full border border-input bg-background rounded px-3 py-2 text-sm ${touched.contactName && !form.contactDetails.name.trim() ? 'border-error/40' : ''}`}
                        value={form.contactDetails.name}
                        placeholder="Your full name"
                        onBlur={() => setTouched((t) => ({ ...t, contactName: true }))}
                        onChange={e => setForm({ 
                          ...form, 
                          contactDetails: { ...form.contactDetails, name: e.target.value }
                        })}
                      />
                      {touched.contactName && !form.contactDetails.name.trim() && (
                        <div className="text-xs text-error mt-1">Name is required</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Your Email *</label>
                      <input
                        type="email"
                        className={`w-full border border-input bg-background rounded px-3 py-2 text-sm ${touched.contactEmail && !form.contactDetails.email.trim() ? 'border-error/40' : ''}`}
                        value={form.contactDetails.email}
                        placeholder="your.email@example.com"
                        onBlur={() => setTouched((t) => ({ ...t, contactEmail: true }))}
                        onChange={e => setForm({ 
                          ...form, 
                          contactDetails: { ...form.contactDetails, email: e.target.value }
                        })}
                      />
                      {touched.contactEmail && !form.contactDetails.email.trim() && (
                        <div className="text-xs text-error mt-1">Email is required</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Your Phone *</label>
                      <input
                        type="tel"
                        className={`w-full border border-input bg-background rounded px-3 py-2 text-sm ${touched.contactPhone && !form.contactDetails.phone.trim() ? 'border-error/40' : ''}`}
                        value={form.contactDetails.phone}
                        placeholder="+91 9876543210"
                        onBlur={() => setTouched((t) => ({ ...t, contactPhone: true }))}
                        onChange={e => setForm({ 
                          ...form, 
                          contactDetails: { ...form.contactDetails, phone: e.target.value }
                        })}
                      />
                      {touched.contactPhone && !form.contactDetails.phone.trim() && (
                        <div className="text-xs text-error mt-1">Phone is required</div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Alternate Contact (Optional)</label>
                      <input
                        className="w-full border border-input bg-background rounded px-3 py-2 text-sm"
                        value={form.contactDetails.alternateContact}
                        placeholder="WhatsApp, Telegram, etc."
                        onChange={e => setForm({ 
                          ...form, 
                          contactDetails: { ...form.contactDetails, alternateContact: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    These contact details will be shared with bidders after they successfully place a bid.
                  </div>
                </div>
                <div className="pt-2 flex items-center gap-2">
                  <Button
                    className="px-4"
                    onClick={editing ? submitEdit : submitCreate}
                    disabled={isLoading}
                  >
                    {isLoading ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Gig')}
                  </Button>
                  <Button variant="outline" onClick={() => { if (!isLoading) { setCreating(false); setEditing(null); } }} disabled={isLoading}>Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


