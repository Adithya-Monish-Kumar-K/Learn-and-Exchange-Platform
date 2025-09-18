import React from 'react';

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

class UserProfileFormClass extends React.Component<UserProfileFormProps, {
  form: UserProfileFormData;
  skillInput: string;
  portfolioUrl: string;
  portfolioTitle: string;
  linkInput: string;
  expInput: string;
  previewUrl?: string;
  certPreviewUrls: string[];
  resumePreviewUrl?: string;
  original: UserProfileFormData; // snapshot to detect changes
  errors: { phone?: string; submit?: string };
  dirty: boolean;
}> {
  private certFileRef = React.createRef<HTMLInputElement>();
  private resumeFileRef = React.createRef<HTMLInputElement>();
  private fileRef = React.createRef<HTMLInputElement>();

  constructor(props: UserProfileFormProps) {
    super(props);
    const initial = { ...emptyForm, ...(props.initial || {}) } as UserProfileFormData;
    let preview: string | undefined;
    if (initial.profileImage && /^(https?:\/\/|data:image\/)/i.test(initial.profileImage)) preview = initial.profileImage;
    this.state = {
      form: initial,
      skillInput: '',
      portfolioUrl: '',
      portfolioTitle: '',
      linkInput: '',
      expInput: '',
      previewUrl: preview,
      certPreviewUrls: [],
      resumePreviewUrl: undefined,
      original: { ...initial },
      errors: {},
      dirty: false,
    };
  }

  componentDidUpdate(_prevProps: UserProfileFormProps, prevState: Readonly<typeof this.state>) {
    // Sync preview if backend profileImage changes and no file selected
    if (!this.state.form.profileImageFile && this.state.form.profileImage !== prevState.form.profileImage) {
      const v = this.state.form.profileImage;
      if (v && /^(https?:\/\/|data:image\/)/i.test(v)) {
        this.setState({ previewUrl: v });
      }
    }
    // Rebuild certification previews if file list changed
    if (prevState.form.certificationFiles !== this.state.form.certificationFiles) {
      prevState.certPreviewUrls.forEach((u) => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); });
      const urls = (this.state.form.certificationFiles || []).map(f => URL.createObjectURL(f));
      this.setState({ certPreviewUrls: urls });
    }
    // Rebuild resume preview
    if (prevState.form.resumeFile !== this.state.form.resumeFile) {
      if (prevState.resumePreviewUrl && prevState.resumePreviewUrl.startsWith('blob:')) URL.revokeObjectURL(prevState.resumePreviewUrl);
      if (this.state.form.resumeFile) {
        const url = URL.createObjectURL(this.state.form.resumeFile);
        this.setState({ resumePreviewUrl: url });
      } else {
        this.setState({ resumePreviewUrl: undefined });
      }
    }
  }

  componentWillUnmount(): void {
    const { previewUrl, certPreviewUrls, resumePreviewUrl } = this.state;
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    certPreviewUrls.forEach(u => { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); });
    if (resumePreviewUrl && resumePreviewUrl.startsWith('blob:')) URL.revokeObjectURL(resumePreviewUrl);
  }

  update<K extends keyof UserProfileFormData>(key: K, value: UserProfileFormData[K]) {
    this.setState(s => {
      const next = { ...s.form, [key]: value };
      const dirty = !this.shallowEqual(next, s.original);
      const errors = { ...s.errors };
      if (key === 'phone') {
        errors.phone = this.validatePhone(next.phone || '');
      }
      return { form: next, dirty, errors };
    });
  }
  shallowEqual(a: UserProfileFormData, b: UserProfileFormData): boolean {
    const keys = new Set([ ...Object.keys(a), ...Object.keys(b) ]);
    for (const k of keys) {
      const av = (a as Record<string, unknown>)[k];
      const bv = (b as Record<string, unknown>)[k];
      if (Array.isArray(av) && Array.isArray(bv)) {
        if (av.length !== bv.length) return false;
        for (let i=0;i<av.length;i++) { if (JSON.stringify(av[i]) !== JSON.stringify(bv[i])) return false; }
      } else if (JSON.stringify(av) !== JSON.stringify(bv)) {
        return false;
      }
    }
    return true;
  }
  validatePhone(v: string): string | undefined {
    if (!v) return 'Phone is required';
    const digits = v.replace(/\D/g,'');
    if (digits.length !== 10) return 'Phone must be exactly 10 digits';
    return undefined;
  }
  addSkill = () => {
    const v = this.state.skillInput.trim();
    if (!v) return;
    if (this.state.form.skills.includes(v)) return this.setState({ skillInput: '' });
    this.update('skills', [...this.state.form.skills, v]);
    this.setState({ skillInput: '' });
  };
  addPortfolio = () => {
    const u = this.state.portfolioUrl.trim();
    if (!u) return;
    this.update('portfolio', [...this.state.form.portfolio, { url: u, title: this.state.portfolioTitle.trim() || undefined }]);
    this.setState({ portfolioUrl: '', portfolioTitle: '' });
  };
  addLink = () => {
    const v = this.state.linkInput.trim();
    if (!v) return;
    if (this.state.form.links?.includes(v)) return this.setState({ linkInput: '' });
    this.update('links', [...(this.state.form.links || []), v]);
    this.setState({ linkInput: '' });
  };
  addExperience = () => {
    const v = this.state.expInput.trim();
    if (!v) return;
    this.update('experience', [...(this.state.form.experience || []), v]);
    this.setState({ expInput: '' });
  };
  onCertFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    this.update('certificationFiles', [...(this.state.form.certificationFiles || []), ...files]);
  };
  removeCertFile = (index: number) => {
    const next = [...(this.state.form.certificationFiles || [])];
    next.splice(index, 1);
    this.update('certificationFiles', next);
    if (this.certFileRef.current && next.length === 0) this.certFileRef.current.value = '';
  };
  clearCertFiles = () => {
    this.update('certificationFiles', []);
    if (this.certFileRef.current) this.certFileRef.current.value = '';
  };
  onResumeFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    this.update('resumeFile', file);
  };
  removeResumeFile = () => {
    this.update('resumeFile', null);
    if (this.resumeFileRef.current) this.resumeFileRef.current.value = '';
  };
  onPickImageClick = () => {
    this.fileRef.current?.click();
  };
  onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    this.setState(s => ({ form: { ...s.form, profileImageFile: file, profileImage: undefined } }));
    const url = URL.createObjectURL(file);
    this.setState(prev => {
      if (prev.previewUrl && prev.previewUrl.startsWith('blob:')) URL.revokeObjectURL(prev.previewUrl);
      return { previewUrl: url } as Pick<typeof this.state, 'previewUrl'>;
    });
  };
  removeImage = () => {
    const { previewUrl } = this.state;
    if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    this.setState(s => ({ previewUrl: undefined, form: { ...s.form, profileImageFile: null, profileImage: undefined } }));
    if (this.fileRef.current) this.fileRef.current.value = '';
  };
  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { errors, form, dirty } = this.state;
    const phoneError = this.validatePhone(form.phone || '');
    const nextErrors = { ...errors, phone: phoneError };
    if (phoneError || !dirty) {
      if (!dirty) nextErrors.submit = 'Please edit at least one field before saving';
      this.setState({ errors: nextErrors });
      return;
    }
    this.setState({ errors: {} });
    this.props.onSubmit?.(form);
  };

  render() {
    const { onDeactivate } = this.props;
    const { form, skillInput, portfolioUrl, portfolioTitle, linkInput, expInput, previewUrl, certPreviewUrls, resumePreviewUrl, errors, dirty } = this.state;
    return (
    <form onSubmit={this.handleSubmit} style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>User Profile</h2>
      {errors.submit && <p style={{ color: '#dc2626', marginTop: 0 }}>{errors.submit}</p>}

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
            <input ref={this.fileRef} type="file" accept="image/*" onChange={this.onImageSelected} style={{ display: 'none' }} />
            <button type="button" onClick={this.onPickImageClick} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Change</button>
            <button type="button" onClick={this.removeImage} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Remove</button>
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
  <div>
    <input value={form.phone || ''}
           onChange={(e) => {
             // sanitize to allow digits, +, spaces, dashes but validate digits count
             const raw = e.target.value;
             this.update('phone', raw);
           }}
           placeholder="10 digit phone"
           style={{ width: '100%', padding: 8, border: '1px solid ' + (errors.phone ? '#dc2626' : '#e5e7eb'), borderRadius: 6 }} />
    {errors.phone && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errors.phone}</div>}
  </div>
          </div>
        </div>
      </section>

      {/* Backend User Model (mostly read-only; selected fields editable below) */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Profile Details</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
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
          <textarea value={form.bio || ''} onChange={(e) => this.update('bio', e.target.value)} rows={3} style={{ width: '100%', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
        </div>
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div>
            <FieldLabel>Links</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={linkInput} onChange={(e) => this.setState({ linkInput: e.target.value })} placeholder="https://your-link.example" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <button type="button" onClick={this.addLink} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Add</button>
            </div>
            {(!form.links || form.links.length === 0) ? (
              <p style={{ color: '#6b7280' }}>No links</p>
            ) : (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.links.map((l, i) => (
                  <li key={`l-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <a href={l} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{l}</a>
                    <button type="button" onClick={() => this.update('links', form.links!.filter((x) => x !== l))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <FieldLabel>Experience</FieldLabel>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={expInput} onChange={(e) => this.setState({ expInput: e.target.value })} placeholder="Company - Role - Years" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
              <button type="button" onClick={this.addExperience} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Add</button>
            </div>
            {(!form.experience || form.experience.length === 0) ? (
              <p style={{ color: '#6b7280' }}>No experience</p>
            ) : (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.experience.map((e, i) => (
                  <li key={`e-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span>{e}</span>
                    <button type="button" onClick={() => this.update('experience', form.experience!.filter((_, idx) => idx !== i))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
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
              <input ref={this.certFileRef} type="file" multiple onChange={this.onCertFilesSelected} accept="application/pdf,image/*,.doc,.docx" style={{ display: 'none' }} />
              <button type="button" onClick={() => this.certFileRef.current?.click()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Choose Files</button>
              <button type="button" onClick={this.clearCertFiles} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Clear</button>
            </div>
            {(form.certificationFiles && form.certificationFiles.length > 0) ? (
              <ul style={{ listStyle: 'disc', paddingLeft: 20 }}>
                {form.certificationFiles!.map((f, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                    <a href={certPreviewUrls[i]} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{f.name}</a>
                    <button type="button" onClick={() => this.removeCertFile(i)} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '2px 8px' }}>Remove</button>
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
              <input ref={this.resumeFileRef} type="file" onChange={this.onResumeFileSelected} accept="application/pdf,image/*,.doc,.docx" style={{ display: 'none' }} />
              <button type="button" onClick={() => this.resumeFileRef.current?.click()} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>Choose File</button>
              <button type="button" onClick={this.removeResumeFile} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: 'white' }}>Clear</button>
            </div>
            <div style={{ marginTop: 8 }}>
              {form.resumeFile ? (
                <Chip text={form.resumeFile.name} onRemove={this.removeResumeFile} href={resumePreviewUrl} />
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
          <input value={skillInput} onChange={(e) => this.setState({ skillInput: e.target.value })} placeholder="Add a skill and press Add" style={{ flex: 1, padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <button type="button" onClick={this.addSkill} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>
            Add
          </button>
        </div>
        <div>
          {form.skills.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No skills yet</p>
          ) : (
            form.skills.map((s) => <Chip key={s} text={s} onRemove={() => this.update('skills', form.skills.filter((x) => x !== s))} />)
          )}
        </div>
      </section>

      {/* Portfolio */}
      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Portfolio</h3>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <input value={portfolioUrl} onChange={(e) => this.setState({ portfolioUrl: e.target.value })} placeholder="https://your-work.example" style={{ flex: '2 1 380px', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <input value={portfolioTitle} onChange={(e) => this.setState({ portfolioTitle: e.target.value })} placeholder="Title (optional)" style={{ flex: '1 1 220px', padding: 8, border: '1px solid #d1d5db', borderRadius: 6 }} />
          <button type="button" onClick={this.addPortfolio} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#111827', color: 'white' }}>
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
                <button type="button" onClick={() => this.update('portfolio', form.portfolio.filter((_, idx) => idx !== i))} style={{ border: '1px solid #d1d5db', background: 'white', borderRadius: 6, padding: '4px 8px' }}>
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
  <button type="submit" disabled={!!errors.phone || !dirty} style={{ padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: (!!errors.phone || !dirty) ? '#6b7280' : '#111827', color: 'white', cursor: (!!errors.phone || !dirty) ? 'not-allowed' : 'pointer' }}>Save Profile</button>
      </div>
    </form>
    );
  }
}

export const UserProfileForm = UserProfileFormClass;
export default UserProfileFormClass;
