import React, { useEffect, useState } from 'react';
import apiClient from '../../services/apiClient';
import type { UserProfileFormData } from './UserProfileForm';

// Editable keys (excluding email, tasks, profileImage)
interface EditableUserFields {
  email: string; // required for PATCH per backend contract
  name?: string;
  phone?: string;
  bio?: string;
  links?: string[];
  skills?: { name: string; level?: string; years?: number }[];
  qualifications?: { title: string; institution: string; year: number }[];
  experience?: { company: string; role: string; duration: string; description?: string }[];
}

const fieldLabel: Record<string, string> = { name: 'Name', phone: 'Phone', bio: 'Bio' };

interface Props { onUpdated?: (user: UserProfileFormData) => void; initial?: UserProfileFormData | null; }

const UpdateUserProfileForm: React.FC<Props> = ({ onUpdated, initial }) => {
  const [form, setForm] = useState<EditableUserFields>(() => ({
    email: initial?.email || '',
    name: initial?.name || '',
    phone: initial?.phone || '',
    bio: initial?.bio || '',
    links: [...(initial?.links || [])],
    skills: [...(initial?.skills || [])],
    qualifications: [...(initial?.qualifications || [])],
    experience: [...(initial?.experience || [])],
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  // If initial changes later (e.g., after refetch) sync once
  useEffect(() => {
    if (initial) {
      setForm({
        email: initial.email,
        name: initial.name,
        phone: initial.phone,
        bio: initial.bio,
        links: [...initial.links],
        skills: [...initial.skills],
        qualifications: [...initial.qualifications],
        experience: [...initial.experience],
      });
    }
  }, [initial]);

  const updatePrimitive = (key: keyof EditableUserFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
  };

  const addArrayItem = (key: 'links' | 'skills' | 'qualifications' | 'experience') => () => {
    setForm(f => {
      const clone: EditableUserFields = { ...f };
      const ensure = <T,>(arr: T[] | undefined, fallback: T[]): T[] => (arr ? [...arr] : [...fallback]);
      switch (key) {
        case 'links': clone.links = ensure(clone.links, []); clone.links.push(''); break;
        case 'skills': clone.skills = ensure(clone.skills, []); clone.skills.push({ name: '' }); break;
        case 'qualifications': clone.qualifications = ensure(clone.qualifications, []); clone.qualifications.push({ title: '', institution: '', year: new Date().getFullYear() }); break;
        case 'experience': clone.experience = ensure(clone.experience, []); clone.experience.push({ company: '', role: '', duration: '', description: '' }); break;
      }
      return { ...clone };
    });
  };

  const updateArrayItem = (key: 'links' | 'skills' | 'qualifications' | 'experience', index: number, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm(f => {
      const next: EditableUserFields = { ...f };
      if (key === 'links') {
        const arr = [...(next.links || [])];
        arr[index] = value;
        next.links = arr;
      } else if (key === 'skills') {
        const arr = [...(next.skills || [])];
        const existing = { ...arr[index] } as { name: string; level?: string; years?: number };
        if (field === 'years') {
          existing.years = value === '' ? undefined : Number(value);
        } else if (field === 'name') {
          existing.name = value;
        } else if (field === 'level') {
          existing.level = value;
        }
        arr[index] = existing;
        next.skills = arr;
      } else if (key === 'qualifications') {
        const arr = [...(next.qualifications || [])];
        const existing = { ...arr[index] } as { title: string; institution: string; year: number };
        if (field === 'year') {
          existing.year = Number(value);
        } else if (field === 'title') {
          existing.title = value;
        } else if (field === 'institution') {
          existing.institution = value;
        }
        arr[index] = existing;
        next.qualifications = arr;
      } else if (key === 'experience') {
        const arr = [...(next.experience || [])];
        const existing = { ...arr[index] } as { company: string; role: string; duration: string; description?: string };
        if (field === 'company' || field === 'role' || field === 'duration' || field === 'description') {
          (existing as Record<string, string | undefined>)[field] = value;
        }
        arr[index] = existing;
        next.experience = arr;
      }
      return next;
    });
  };

  const removeArrayItem = (key: 'links' | 'skills' | 'qualifications' | 'experience', index: number) => () => {
    setForm(f => {
      const arr = [...(f[key] || [])];
      console.log(arr, index);
      arr.splice(index, 1);
      return { ...f, [key]: arr };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined); setSuccess(undefined);
    setLoading(true);
    try {
      if (!form.email) throw new Error('Missing email for update');
      const payload: EditableUserFields = { ...form };

      // Clean arrays: remove empties
      if (payload.links) payload.links = payload.links.filter(l => typeof l === 'string' && l.trim());
      if (payload.skills) payload.skills = payload.skills.filter(s => s && s.name && s.name.trim());
      if (payload.qualifications) payload.qualifications = payload.qualifications.filter(q => q && q.title && q.institution && q.year);
      if (payload.experience) payload.experience = payload.experience.filter(ex => ex && ex.company && ex.role && ex.duration);

      const updatedRaw = await apiClient.updateUserByEmail(form.email, payload as unknown as Record<string, unknown>);
      // Map minimal subset back to UserProfileFormData shape for callback
      const mapped: UserProfileFormData = {
        name: String(updatedRaw.name || form.name || ''),
        email: form.email,
        phone: typeof (updatedRaw as { phone?: unknown }).phone === 'string' ? (updatedRaw as { phone?: string }).phone! : (form.phone || ''),
        bio: typeof updatedRaw.bio === 'string' ? updatedRaw.bio : form.bio,
        skills: Array.isArray(updatedRaw.skills) ? (updatedRaw.skills as { name: string; level?: string; years?: number }[]) : (form.skills || []),
        qualifications: Array.isArray(updatedRaw.qualifications) ? (updatedRaw.qualifications as { title: string; institution: string; year: number }[]) : (form.qualifications || []),
        experience: Array.isArray(updatedRaw.experience) ? (updatedRaw.experience as { company: string; role: string; duration: string; description?: string }[]) : (form.experience || []),
        links: Array.isArray(updatedRaw.links) ? (updatedRaw.links as string[]) : (form.links || []),
        tasksPosted: initial?.tasksPosted || [],
        tasksCompleted: initial?.tasksCompleted || [],
        profileImage: initial?.profileImage,
      };
      setSuccess('Profile updated');
      if (onUpdated) onUpdated(mapped);
    } catch (err) {
      const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : 'Failed to update';
      // Attempt to extract backend message (narrow type)
      const backendMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(backendMsg || msg);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: 'transparent', padding: 0, borderRadius: 0, boxShadow: 'none', maxWidth: '100%', margin: 0 }}>
      <h2 style={{ marginTop: 0, fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>Personal Information</h2>
      <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
        {(['name','phone'] as (keyof EditableUserFields)[]).map(key => (
          <label key={key} style={{ display: 'flex', flexDirection: 'column', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '.3px' }}>
            <span style={{ marginBottom: 6 }}>{fieldLabel[key as string]}</span>
            <input value={String(form[key] || '')} onChange={updatePrimitive(key)} style={{ padding: '10px 12px', border: '1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 13, outline: 'none', boxShadow: '0 1px 2px var(--card-shadow)' }} />
          </label>
        ))}
      </div>
      <label style={{ display: 'flex', flexDirection: 'column', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginTop: 16 }}>
        Bio
        <textarea value={form.bio || ''} onChange={updatePrimitive('bio')} rows={4} style={{ resize: 'vertical', marginTop: 6, padding: '10px 12px', border: '1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 13, lineHeight: 1.5, outline: 'none', boxShadow: '0 1px 2px var(--card-shadow)' }} />
      </label>

      {/* Links */}
      <section style={{ marginTop: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight:600, color:'var(--text-primary)' }}>Links</h3>
        {(form.links || []).map((l, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input value={l} onChange={updateArrayItem('links', i, 'value')} placeholder="https://..." style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12, outline:'none' }} />
            <button type="button" onClick={removeArrayItem('links', i)} style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 8, fontSize: 12, cursor:'pointer' }}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={addArrayItem('links')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight:500, cursor:'pointer' }}>Add Link</button>
      </section>

      {/* Skills */}
      <section style={{ marginTop: 32 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight:600, color:'var(--text-primary)' }}>Skills</h3>
        {(form.skills || []).map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr)) 70px', gap: 10, marginBottom: 10 }}>
            <input value={s.name} placeholder="Name" onChange={e => updateArrayItem('skills', i, 'name')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={s.level || ''} placeholder="Level" onChange={e => updateArrayItem('skills', i, 'level')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={s.years?.toString() || ''} placeholder="Years" onChange={e => updateArrayItem('skills', i, 'years')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <button type="button" onClick={removeArrayItem('skills', i)} style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 10, fontSize: 11, cursor:'pointer' }}>X</button>
          </div>
        ))}
        <button type="button" onClick={addArrayItem('skills')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight:500, cursor:'pointer' }}>Add Skill</button>
      </section>

      {/* Qualifications */}
      <section style={{ marginTop: 32 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, color:'var(--text-primary)', fontWeight:600 }}>Qualifications</h3>
        {(form.qualifications || []).map((q, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr)) 60px', gap: 10, marginBottom: 10 }}>
            <input value={q.title} placeholder="Title" onChange={e => updateArrayItem('qualifications', i, 'title')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={q.institution} placeholder="Institution" onChange={e => updateArrayItem('qualifications', i, 'institution')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={q.year.toString()} placeholder="Year" onChange={e => updateArrayItem('qualifications', i, 'year')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <button type="button" onClick={removeArrayItem('qualifications', i)} style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 10, fontSize: 11, cursor:'pointer' }}>X</button>
          </div>
        ))}
        <button type="button" onClick={addArrayItem('qualifications')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight:500, cursor:'pointer' }}>Add Qualification</button>
      </section>

      {/* Experience */}
      <section style={{ marginTop: 32 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, color:'var(--text-primary)', fontWeight:600 }}>Experience</h3>
        {(form.experience || []).map((ex, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr)) 80px', gap: 10, marginBottom: 10 }}>
            <input value={ex.company} placeholder="Company" onChange={e => updateArrayItem('experience', i, 'company')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={ex.role} placeholder="Role" onChange={e => updateArrayItem('experience', i, 'role')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={ex.duration} placeholder="Duration" onChange={e => updateArrayItem('experience', i, 'duration')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <input value={ex.description || ''} placeholder="Description" onChange={e => updateArrayItem('experience', i, 'description')(e)} style={{ padding: '8px 10px', border:'1px solid var(--card-border)', background:'var(--card-background)', color: 'var(--text-primary)', borderRadius: 10, fontSize: 12 }} />
            <button type="button" onClick={removeArrayItem('experience', i)} style={{ background: 'var(--card-background)', border: '1px solid var(--card-border)', color: 'var(--text-secondary)', padding: '6px 10px', borderRadius: 10, fontSize: 11, cursor:'pointer' }}>X</button>
          </div>
        ))}
        <button type="button" onClick={addArrayItem('experience')} style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight:500, cursor:'pointer' }}>Add Experience</button>
      </section>

      <div style={{ marginTop: 40, display: 'flex', gap: 16, alignItems: 'center' }}>
        <button type="submit" disabled={loading} style={{ background: '#1d4ed8', color: 'white', padding: '14px 36px', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: .3, boxShadow:'0 4px 10px -2px rgba(29,78,216,0.35)', transition:'background .15s', opacity: loading ? .7 : 1 }}>
          {loading ? 'Saving...' : 'Update'}
        </button>
        {success && <span style={{ fontSize: 12, color: '#059669' }}>{success}</span>}
        {error && <span style={{ fontSize: 12, color: '#b91c1c' }}>{error}</span>}
      </div>
  <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>Email, tasks posted/completed, and profile image are not editable here.</p>
    </form>
  );
};

export default UpdateUserProfileForm;
