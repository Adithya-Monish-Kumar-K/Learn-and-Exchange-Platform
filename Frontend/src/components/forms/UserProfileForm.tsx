import React, { useEffect, useRef, useState } from 'react';

export type PortfolioItem = { url: string; title?: string };

export type UserProfileFormData = {
  username: string;
  email: string;
  phone?: string;
  skills: string[];
  portfolio: PortfolioItem[];
  linkedTaskIds: string[]; // references to Tasks Component
  linkedReviewIds: string[]; // references to Reviews Module
  // Read-only fields coming from backend user model (display only)
  role?: string;
  bio?: string;
  links?: string[];
  experience?: string[];
  certifications?: string[]; // existing server-side attachments (read-only)
  certificationFiles?: File[]; // UI-only: files selected to upload
  credit?: number;
  tasksPosted?: string[];
  tasksCompleted?: string[];
  resume?: string; // existing server-side attachment (read-only)
  resumeFile?: File | null; // UI-only: selected resume to upload
  profileImage?: string; // may be URL/asset id from backend (read-only)
  profileImageFile?: File | null; // UI-only: selected new image to upload
  isActive?: boolean;
  isVerified?: boolean;
  reviews?: string[];
};

export type UserProfileFormProps = {
  initial?: Partial<UserProfileFormData>;
  onSubmit?: (data: UserProfileFormData) => void;
  onDeactivate?: () => void;
};

const emptyForm: UserProfileFormData = {
  username: '',
  email: '',
  phone: '',
  skills: [],
  portfolio: [],
  linkedTaskIds: [],
  linkedReviewIds: [],
  role: undefined,
  bio: undefined,
  links: [],
  experience: [],
  certifications: [],
  certificationFiles: [],
  credit: undefined,
  tasksPosted: [],
  tasksCompleted: [],
  resume: undefined,
  resumeFile: null,
  profileImage: undefined,
  profileImageFile: null,
  isActive: undefined,
  isVerified: undefined,
  reviews: [],
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{children}</label>;
}

function Chip({ text, onRemove, href }: { text: string; onRemove?: () => void; href?: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: '#eef2ff',
        color: '#1f2937',
        border: '1px solid #c7d2fe',
        padding: '4px 8px',
        borderRadius: 999,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" style={{ color: '#1f2937', textDecoration: 'underline' }}>
          {text}
        </a>
      ) : (
        text
      )}
      {onRemove ? (
        <button aria-label={`remove ${text}`} onClick={onRemove} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          ×
        </button>
      ) : null}
    </span>
  );
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ initial, onSubmit, onDeactivate }) => {
  const [form, setForm] = useState<UserProfileFormData>({ ...emptyForm, ...initial });
  const [skillInput, setSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  // editors for additional editable fields
  const [linkInput, setLinkInput] = useState('');
  const [expInput, setExpInput] = useState('');
  // file inputs for certifications and resume
  const certFileRef = useRef<HTMLInputElement | null>(null);
  const resumeFileRef = useRef<HTMLInputElement | null>(null);
  // profile image upload (UI-only)
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(() => {
    const v = initial?.profileImage || undefined;
    if (!v) return undefined;
    return /^(https?:\/\/|data:image\/)/i.test(v) ? v : undefined;
  });
  // preview urls for files (viewable on click)
  const [certPreviewUrls, setCertPreviewUrls] = useState<string[]>([]);
  const [resumePreviewUrl, setResumePreviewUrl] = useState<string | undefined>(undefined);
  // Only skills and portfolio are editable; the rest are read-only values from DB
  const isValid = true;

  function update<K extends keyof UserProfileFormData>(key: K, value: UserProfileFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addSkill() {
    const v = skillInput.trim();
    if (!v) return;
    if (form.skills.includes(v)) return setSkillInput('');
    update('skills', [...form.skills, v]);
    setSkillInput('');
  }

  function addPortfolio() {
    const u = portfolioUrl.trim();
    if (!u) return;
    update('portfolio', [...form.portfolio, { url: u, title: portfolioTitle.trim() || undefined }]);
    setPortfolioUrl('');
    setPortfolioTitle('');
  }

  // Editable helpers for Links, Experience, Certifications, Resume
  function addLink() {
    const v = linkInput.trim();
    if (!v) return;
    if (form.links?.includes(v)) return setLinkInput('');
    update('links', [...(form.links || []), v]);
    setLinkInput('');
  }
  function addExperience() {
    const v = expInput.trim();
    if (!v) return;
    update('experience', [...(form.experience || []), v]);
    setExpInput('');
  }
  // file handlers: certifications and resume
  function onCertFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    update('certificationFiles', [...(form.certificationFiles || []), ...files]);
  }
  function removeCertFile(index: number) {
    const next = [...(form.certificationFiles || [])];
    next.splice(index, 1);
    update('certificationFiles', next);
    if (certFileRef.current && next.length === 0) certFileRef.current.value = '';
  }
  function clearCertFiles() {
    update('certificationFiles', []);
    if (certFileRef.current) certFileRef.current.value = '';
  }
  function onResumeFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    update('resumeFile', file);
  }
  function removeResumeFile() {
    update('resumeFile', null);
    if (resumeFileRef.current) resumeFileRef.current.value = '';
  }

  // keep preview in sync if backend sends a URL and no file selected
  useEffect(() => {
    if (!form.profileImageFile && form.profileImage && /^(https?:\/\/|data:image\/)/i.test(form.profileImage)) {
      setPreviewUrl(form.profileImage);
    }
  }, [form.profileImage, form.profileImageFile]);

  // cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Build and cleanup preview URLs for certification files
  useEffect(() => {
    const urls = (form.certificationFiles || []).map((f) => URL.createObjectURL(f));
    setCertPreviewUrls(urls);
    return () => {
      urls.forEach((u) => {
        if (u && u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
    };
  }, [form.certificationFiles]);

  // Build and cleanup preview URL for resume file
  useEffect(() => {
    let url: string | undefined;
    if (form.resumeFile) {
      url = URL.createObjectURL(form.resumeFile);
      setResumePreviewUrl(url);
    } else {
      setResumePreviewUrl(undefined);
    }
    return () => {
      if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [form.resumeFile]);

  function onPickImageClick() {
    fileRef.current?.click();
  }

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // revoke existing preview url if any
    setForm((f) => ({ ...f, profileImageFile: file, profileImage: undefined }));
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return url;
    });
  }

  function removeImage() {
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(undefined);
    setForm((f) => ({ ...f, profileImageFile: null, profileImage: undefined }));
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit?.(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>User Profile</h2>

      {/* Profile image at top (editable only via upload) */}
      <section style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewUrl ? (
            <a href={previewUrl} target="_blank" rel="noreferrer" title="View full image">
              <img src={previewUrl} alt="Profile" style={{ width: '72px', height: '72px', objectFit: 'cover', display: 'block' }} />
            </a>
          ) : (
            <span style={{ fontWeight: 600, color: '#6b7280' }}>{form.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>Profile Image</FieldLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={onImageSelected} style={{ display: 'none' }} />
            <button type="button" onClick={onPickImageClick} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Change</button>
            <button type="button" onClick={removeImage} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Remove</button>
          </div>
        </div>
      </section>

      {/* Personal info */}
  <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Personal</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Username</FieldLabel>
       <input value={form.username} readOnly aria-readonly
         placeholder="e.g., adithya"
         style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
       <input type="email" value={form.email} readOnly aria-readonly
         placeholder="you@example.com"
         style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div>
            <FieldLabel>Phone</FieldLabel>
       <input value={form.phone || ''} readOnly aria-readonly
         placeholder="+91xxxxxxxxxx"
         style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
        </div>
  <p style={{ marginTop: 8, color: '#6b7280' }}>Password is hidden. You can edit Profile Image (upload), Bio, Links, Experience, Certifications, Resume, Skills, and Portfolio. Tasks and Reviews are read-only lists.</p>
      </section>

      {/* Backend User Model (mostly read-only; selected fields editable below) */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Role</FieldLabel>
            <input value={form.role || ''} readOnly aria-readonly style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div>
            <FieldLabel>Status</FieldLabel>
            <input value={(form.isActive ? 'Active' : 'Inactive') + (form.isVerified ? ' • Verified' : ' • Unverified')} readOnly aria-readonly style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div>
            <FieldLabel>Credit</FieldLabel>
            <input value={form.credit ?? ''} readOnly aria-readonly style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
          <div>
            <FieldLabel>Ratings</FieldLabel>
            <input value={form.reviews?.length ?? 0} readOnly aria-readonly style={{ width: '100%', padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, background: '#f9fafb', color: '#6b7280' }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <FieldLabel>Bio</FieldLabel>
          <textarea value={form.bio || ''} onChange={(e) => update('bio', e.target.value)} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Links</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={linkInput} onChange={(e) => setLinkInput(e.target.value)} placeholder="https://your-link.example" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <button type="button" onClick={addLink} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Add</button>
            </div>
            {(!form.links || form.links.length === 0) ? (
              <p style={{ color: '#6b7280' }}>No links</p>
            ) : (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.links.map((l, i) => (
                  <li key={`l-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <a href={l} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{l}</a>
                    <button type="button" onClick={() => update('links', form.links!.filter((x) => x !== l))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <FieldLabel>Experience</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={expInput} onChange={(e) => setExpInput(e.target.value)} placeholder="Company - Role - Years" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <button type="button" onClick={addExperience} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Add</button>
            </div>
            {(!form.experience || form.experience.length === 0) ? (
              <p style={{ color: '#6b7280' }}>No experience</p>
            ) : (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.experience.map((e, i) => (
                  <li key={`e-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{e}</span>
                    <button type="button" onClick={() => update('experience', form.experience!.filter((_, idx) => idx !== i))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Certifications (Upload files)</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input ref={certFileRef} type="file" multiple onChange={onCertFilesSelected} accept="application/pdf,image/*,.doc,.docx" style={{ display: 'none' }} />
              <button type="button" onClick={() => certFileRef.current?.click()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Choose Files</button>
              <button type="button" onClick={clearCertFiles} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Clear</button>
            </div>
            {(form.certificationFiles && form.certificationFiles.length > 0) ? (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.certificationFiles!.map((f, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <a href={certPreviewUrls[i]} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{f.name}</a>
                    <button type="button" onClick={() => removeCertFile(i)} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#6b7280' }}>No certification files selected</p>
            )}
            {form.certifications && form.certifications.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Existing (read-only):</div>
                {form.certifications.map((c) => {
                  const isUrl = /^(https?:\/\/|data:)/i.test(c);
                  return <Chip key={c} text={c} href={isUrl ? c : undefined} />;
                })}
              </div>
            ) : null}
          </div>
          <div>
            <FieldLabel>Resume (Upload file)</FieldLabel>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input ref={resumeFileRef} type="file" onChange={onResumeFileSelected} accept="application/pdf,image/*,.doc,.docx" style={{ display: 'none' }} />
              <button type="button" onClick={() => resumeFileRef.current?.click()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Choose File</button>
              <button type="button" onClick={removeResumeFile} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Clear</button>
            </div>
            <div style={{ marginTop: 8 }}>
              {form.resumeFile ? (
                <Chip text={form.resumeFile.name} onRemove={removeResumeFile} href={resumePreviewUrl} />
              ) : (
                <span style={{ color: '#6b7280' }}>No resume selected</span>
              )}
            </div>
            {form.resume ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Existing (read-only):</div>
                <Chip text={form.resume} href={/^(https?:\/\/|data:)/i.test(form.resume) ? form.resume : undefined} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Skills */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Skills</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill and press Add" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <button type="button" onClick={addSkill} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>
            Add
          </button>
        </div>
        <div>
          {form.skills.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No skills yet</p>
          ) : (
            form.skills.map((s) => <Chip key={s} text={s} onRemove={() => update('skills', form.skills.filter((x) => x !== s))} />)
          )}
        </div>
      </section>

      {/* Portfolio */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Portfolio</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://your-work.example" style={{ flex: '2 1 380px', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <input value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} placeholder="Title (optional)" style={{ flex: '1 1 220px', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <button type="button" onClick={addPortfolio} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>
            Add
          </button>
        </div>
        {form.portfolio.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No portfolio links yet</p>
        ) : (
          <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
            {form.portfolio.map((p, i) => (
              <li key={`${p.url}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div>
                  <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                    {p.title || p.url}
                  </a>
                  {p.title ? <span style={{ color: '#6b7280' }}> — {p.url}</span> : null}
                </div>
                <button type="button" onClick={() => update('portfolio', form.portfolio.filter((_, idx) => idx !== i))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '4px 8px' }}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Linked references (read-only, scrollable lists) */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Linked References</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Tasks</FieldLabel>
            <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
              {form.linkedTaskIds.length === 0 ? (
                <p style={{ color: '#6b7280', margin: 0 }}>No tasks linked</p>
              ) : (
                <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0 }}>
                  {form.linkedTaskIds.map((id) => (
                    <li key={id} style={{ marginBottom: 6 }}>{id}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <FieldLabel>Reviews</FieldLabel>
            <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: 6, padding: 8 }}>
              {form.linkedReviewIds.length === 0 ? (
                <p style={{ color: '#6b7280', margin: 0 }}>No reviews linked</p>
              ) : (
                <ul style={{ listStyle: 'disc', paddingLeft: 20, margin: 0 }}>
                  {form.linkedReviewIds.map((id) => (
                    <li key={id} style={{ marginBottom: 6 }}>{id}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onDeactivate} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #ef4444', background: '#fff', color: '#ef4444' }}>Deactivate</button>
  <button type="submit" style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Save Profile</button>
      </div>
    </form>
  );
};

export default UserProfileForm;
