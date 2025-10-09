// Clean simplified component re-declared (previous version removed entirely)
import React from 'react';
import apiClient from '../../services/apiClient';
import UpdateUserProfileForm from './UpdateUserProfileForm';

// Raw backend union shapes (kept narrow to avoid 'any')
type SkillRaw = { name?: string; level?: string; years?: number } | string | null | undefined;
type QualificationRaw = { title?: string; institution?: string; year?: number } | null | undefined;
type ExperienceRaw = { company?: string; role?: string; duration?: string; description?: string } | null | undefined;
type RecommendationRaw = { fromUser?: string | { _id?: string }; message?: string; date?: string | Date } | null | undefined;
type IdLike = string | { _id?: string } | null | undefined;

interface BackendUserRaw {
  name?: string; email?: string; phone?: string; role?: string; bio?: string;
  skills?: SkillRaw[];
  qualifications?: QualificationRaw[];
  experience?: ExperienceRaw[];
  certifications?: IdLike[];
  links?: (string | null | undefined)[];
  recommendations?: RecommendationRaw[];
  tasksPosted?: IdLike[];
  tasksCompleted?: IdLike[];
  resume?: IdLike;
  profileImage?: IdLike;
}

const toId = (v: unknown): string | undefined => {
  if (!v) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const obj = v as { _id?: unknown };
    if (typeof obj._id === 'string') return obj._id;
  }
  return undefined;
};

interface LinkPreview { original: string; contentType: string; objectUrl?: string; error?: string; filename?: string; }
export interface UserProfileFormData { name: string; email: string; phone: string; bio?: string; skills: { name: string; level?: string; years?: number }[]; qualifications: { title: string; institution: string; year: number }[]; experience: { company: string; role: string; duration: string; description?: string }[]; links: string[]; tasksPosted: string[]; tasksCompleted: string[]; profileImage?: string; }
const empty: UserProfileFormData = { name: '', email: '', phone: '', bio: undefined, skills: [], qualifications: [], experience: [], links: [], tasksPosted: [], tasksCompleted: [], profileImage: undefined };
// Generic card section wrapper for read-only profile view
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
    <h3 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{title}</h3>
    {children}
  </div>
);

class UserProfileFormClass extends React.Component<Record<string, never>, { d: UserProfileFormData; loading: boolean; error?: string; linkPreviews: LinkPreview[]; editing: boolean }> {
  state = { d: empty, loading: true, error: undefined as string | undefined, linkPreviews: [], editing: false };
  private revoked: string[] = [];
  componentDidMount() { this.load(); }
  componentWillUnmount() { this.revoked.forEach(u => URL.revokeObjectURL(u)); }
  async load() {
    try {
      if (!apiClient.isAuthenticated?.()) throw new Error('Not authenticated');
      const verify = await apiClient.verifyToken();
      const verifyRaw: BackendUserRaw | undefined = (verify?.user as BackendUserRaw) ?? (verify as BackendUserRaw);
      if (!verifyRaw) throw new Error('No user in session');

      // Secondary fetch to get full profile (bio, skills, etc.) since verify endpoint returns limited fields
      let fullRaw: BackendUserRaw = verifyRaw;
      if (verifyRaw.email) {
        try {
          const byEmail = await apiClient.getUserByEmail(verifyRaw.email);
          if (byEmail && typeof byEmail === 'object') {
            fullRaw = byEmail as BackendUserRaw;
          }
        } catch {
          // Non-fatal: fallback to verifyRaw
          console.warn('[Profile] Secondary fetch failed, using verify payload');
        }
      }

      const mapSkills = (val: BackendUserRaw['skills']) => (val ?? [])
        .filter(Boolean)
        .map(s => {
          if (typeof s === 'string') return { name: s };
          if (s && typeof s === 'object') {
            const obj = s as { name?: string; level?: string; years?: number };
            return { name: obj.name || '', level: obj.level, years: typeof obj.years === 'number' ? obj.years : undefined };
          }
          return { name: '' };
        })
        .filter(s => s.name);

      const mapQualifications = (val: BackendUserRaw['qualifications']) => (val ?? [])
        .filter(Boolean)
        .map(q => {
          if (q && typeof q === 'object') {
            const obj = q as { title?: string; institution?: string; year?: number };
            return { title: obj.title || '', institution: obj.institution || '', year: typeof obj.year === 'number' ? obj.year : new Date().getFullYear() };
          }
          return { title: '', institution: '', year: new Date().getFullYear() };
        })
        .filter(q => q.title && q.institution);

      const mapExperience = (val: BackendUserRaw['experience']) => (val ?? [])
        .filter(Boolean)
        .map(ex => {
          if (ex && typeof ex === 'object') {
            const obj = ex as { company?: string; role?: string; duration?: string; description?: string };
            return { company: obj.company || '', role: obj.role || '', duration: obj.duration || '', description: typeof obj.description === 'string' ? obj.description : undefined };
          }
          return { company: '', role: '', duration: '' };
        })
        .filter(ex => ex.company && ex.role && ex.duration);

      const d: UserProfileFormData = {
        ...empty,
        name: fullRaw.name || verifyRaw.name || '',
        email: fullRaw.email || verifyRaw.email || '',
        phone: fullRaw.phone || verifyRaw.phone || '',
        bio: fullRaw.bio || undefined,
        skills: mapSkills(fullRaw.skills),
        qualifications: mapQualifications(fullRaw.qualifications),
        experience: mapExperience(fullRaw.experience),
        links: (fullRaw.links ?? []).filter((l): l is string => typeof l === 'string' && !!l.trim()),
        tasksPosted: (fullRaw.tasksPosted ?? []).map(t => toId(t)).filter((t): t is string => !!t),
        tasksCompleted: (fullRaw.tasksCompleted ?? []).map(t => toId(t)).filter((t): t is string => !!t),
        profileImage: toId(fullRaw.profileImage) || undefined,
      };
      this.setState({ d }, () => this.fetchLinkPreviews());
    } catch (e: unknown) {
      const message = (e && typeof e === 'object' && 'message' in e) ? String((e as { message?: unknown }).message) : 'Failed to load user';
      this.setState({ error: message });
    } finally { this.setState({ loading: false }); }
  }
  async fetchLinkPreviews() {
    const { d } = this.state;
    const previews: LinkPreview[] = await Promise.all(d.links.map(async (link) => {
      try {
        const resp = await fetch(link, { method: 'GET' });
        const contentType = resp.headers.get('Content-Type') || 'application/octet-stream';
        if (!resp.ok) return { original: link, contentType, error: resp.status + ' ' + resp.statusText };
        // Only create object URLs for images/pdf
        if (/image\//i.test(contentType) || /pdf/i.test(contentType)) {
          const blob = await resp.blob();
            const objectUrl = URL.createObjectURL(blob);
            this.revoked.push(objectUrl);
            // try derive filename
            const disposition = resp.headers.get('Content-Disposition') || '';
            const match = disposition.match(/filename="?([^";]+)"?/i);
            return { original: link, contentType, objectUrl, filename: match ? match[1] : undefined };
        }
        return { original: link, contentType };
      } catch (err: unknown) {
        const msg = (err && typeof err === 'object' && 'message' in err) ? String((err as { message?: unknown }).message) : 'fetch failed';
        return { original: link, contentType: 'unknown', error: msg };
      }
    }));
    this.setState({ linkPreviews: previews });
  }
  handleUpdated = (updated: UserProfileFormData) => {
    this.setState({ d: updated, editing: false }, () => this.fetchLinkPreviews());
  };
  render() {
    const { d, loading, error, linkPreviews, editing } = this.state;
    if (loading) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}><div style={{ background: 'white', padding: 28, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', fontSize: 14 }}>Loading profile...</div></div>;
    if (error) return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2' }}><div style={{ background: 'white', padding: 28, border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, maxWidth: 480 }}>Error: {error}</div></div>;
    if (editing) {
      return (
        <div style={{ minHeight: '100vh', background: '#f3f5f8', padding: '40px 32px' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
            {/* Left panel placeholder (could be used for future navigation but kept empty per instructions) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
                <h2 style={{ fontSize: 18, margin: 0, fontWeight: 600, color: '#0f172a' }}>Edit Profile</h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '8px 0 0' }}>Update your personal information.</p>
                <button onClick={() => this.setState({ editing: false })} style={{ marginTop: 20, background: '#eef2ff', border: '1px solid #c7d2fe', color: '#1d4ed8', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%' }}>Cancel</button>
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 20, padding: 32, boxShadow: '0 4px 8px rgba(0,0,0,0.04)' }}>
              <UpdateUserProfileForm initial={d} onUpdated={this.handleUpdated} />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100vh', background: '#f1f5f9', padding: 32 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 24, gridTemplateColumns: '280px 1fr' }}>
          {/* Sidebar / Profile Card */}
          <div style={{ background: 'white', padding: 24, borderRadius: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', height: 'fit-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 600, color: '#475569' }}>
                {d.profileImage ? <img src={d.profileImage} alt={d.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (d.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <h1 style={{ fontSize: 22, margin: '0 0 4px', fontWeight: 700, color: '#0f172a' }}>{d.name || 'Unnamed User'}</h1>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 8 }}>{d.email}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{d.phone || 'No phone provided'}</div>
              <button onClick={() => this.setState({ editing: true })} style={{ marginTop: 16, background: '#2563eb', color: 'white', padding: '8px 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Edit Profile</button>
            </div>
          </div>

          {/* Main Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Section title="Bio">
              {d.bio ? (
                <p style={{ fontSize: 13, lineHeight: 1.5, color: '#334155', margin: 0, whiteSpace: 'pre-line' }}>{d.bio}</p>
              ) : (
                <div style={{ fontSize:12, color:'#94a3b8' }}>No bio</div>
              )}
            </Section>
            <Section title="Skills">
              {d.skills.length === 0 ? <div style={{ fontSize:12, color:'#94a3b8' }}>No skills</div> : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {d.skills.map((s,i) => <span key={i} style={{ background:'#eef2ff', color:'#3730a3', padding:'6px 10px', borderRadius: 20, fontSize:12 }}>{s.name}{s.level ? ` (${s.level})` : ''}{s.years !== undefined ? ` - ${s.years}y` : ''}</span>)}
                </div>
              )}
            </Section>
            <Section title="Qualifications">
              {d.qualifications.length === 0 ? <div style={{ fontSize:12, color:'#94a3b8' }}>No qualifications</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {d.qualifications.map((q, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <div style={{ fontWeight:600, color:'#1e293b' }}>{q.title}</div>
                      <div style={{ color:'#475569' }}>{q.institution} ({q.year})</div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Experience">
              {d.experience.length === 0 ? <div style={{ fontSize:12, color:'#94a3b8' }}>No experience</div> : (
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {d.experience.map((ex, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <div><strong style={{ color:'#1e293b' }}>{ex.company}</strong> – {ex.role} <span style={{ color:'#64748b' }}>({ex.duration})</span></div>
                      {ex.description && <div style={{ marginTop:4, color:'#475569' }}>{ex.description}</div>}
                    </div>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Links">
              {d.links.length === 0 ? <div style={{ fontSize:12, color:'#94a3b8' }}>No links</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
                  {linkPreviews.map((p: LinkPreview, i) => {
                    if (p.error) return <div key={i} style={{ border:'1px solid #fecaca', background:'#fef2f2', padding:8, borderRadius:8 }}><div style={{ fontSize:11, color:'#b91c1c' }}>{p.original}</div><div style={{ fontSize:11, color:'#dc2626' }}>{p.error}</div></div>;
                    if (p.objectUrl && /image\//i.test(p.contentType)) return <div key={i} style={{ border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden', background:'#fff' }}><a href={p.original} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:'#0f172a' }}><img src={p.objectUrl} alt={p.filename || 'link image'} style={{ width:'100%', height:120, objectFit:'cover', display:'block' }} /><div style={{ padding:'6px 8px', fontSize:11, whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{p.filename || p.original}</div></a></div>;
                    if (p.objectUrl && /pdf/i.test(p.contentType)) return <div key={i} style={{ border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', padding:8, display:'flex', flexDirection:'column', gap:6 }}><span style={{ fontSize:12, fontWeight:600 }}>PDF</span><a href={p.objectUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#2563eb', wordBreak:'break-all' }}>{p.filename || 'Open Document'}</a><a href={p.original} target="_blank" rel="noreferrer" style={{ fontSize:10, color:'#64748b' }}>Source</a></div>;
                    return <div key={i} style={{ border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', padding:8, fontSize:11, wordBreak:'break-all' }}><a href={p.original} target="_blank" rel="noreferrer" style={{ color:'#2563eb', textDecoration:'none' }}>{p.original}</a><div style={{ color:'#64748b', marginTop:4 }}>{p.contentType}</div></div>;
                  })}
                </div>
              )}
            </Section>
            <Section title="Tasks">
              <div style={{ display:'flex', flexDirection:'column', gap:12, fontSize:13 }}>
                <div><strong>Tasks Posted:</strong> {d.tasksPosted.length ? d.tasksPosted.join(', ') : <span style={{ color:'#94a3b8' }}>None</span>}</div>
                <div><strong>Tasks Completed:</strong> {d.tasksCompleted.length ? d.tasksCompleted.join(', ') : <span style={{ color:'#94a3b8' }}>None</span>}</div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    );
  }
}

export const UserProfileForm = UserProfileFormClass;
export default UserProfileFormClass;
