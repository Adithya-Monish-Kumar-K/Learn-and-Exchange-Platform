// Clean simplified component re-declared (previous version removed entirely)
import React from 'react';
import apiClient from '../../services/apiClient';
import UpdateUserProfileForm from './UpdateUserProfileForm';

// Raw backend union shapes (kept narrow to avoid 'any')
type SkillRaw =
  | { name?: string; level?: string; years?: number }
  | string
  | null
  | undefined;
type QualificationRaw =
  | { title?: string; institution?: string; year?: number }
  | null
  | undefined;
type ExperienceRaw =
  | { company?: string; role?: string; duration?: string; description?: string }
  | null
  | undefined;
type RecommendationRaw =
  | {
      fromUser?: string | { _id?: string };
      message?: string;
      date?: string | Date;
    }
  | null
  | undefined;
type IdLike = string | { _id?: string } | null | undefined;

interface BackendUserRaw {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  bio?: string;
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

export interface UserProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio?: string;
  skills: { name: string; level?: string; years?: number }[];
  qualifications: { title: string; institution: string; year: number }[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description?: string;
  }[];
  links: string[];
  tasksPosted: string[];
  tasksCompleted: string[];
  profileImage?: string;
}
const empty: UserProfileFormData = {
  name: '',
  email: '',
  phone: '',
  bio: undefined,
  skills: [],
  qualifications: [],
  experience: [],
  links: [],
  tasksPosted: [],
  tasksCompleted: [],
  profileImage: undefined,
};
// Generic card section wrapper for read-only profile view
const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: 'var(--card-background)',
      border: '1px solid var(--card-border)',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 1px 2px var(--card-shadow)',
    }}
  >
    <h3
      style={{
        margin: '0 0 14px',
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--text-primary)',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

class UserProfileFormClass extends React.Component<
  Record<string, never>,
  {
    d: UserProfileFormData;
    loading: boolean;
    error?: string;
    editing: boolean;
  }
> {
  state = {
    d: empty,
    loading: true,
    error: undefined as string | undefined,
    editing: false,
  };
  componentDidMount() {
    this.load();
  }
  async load() {
    try {
      if (!apiClient.isAuthenticated?.()) throw new Error('Not authenticated');
      const verify = await apiClient.verifyToken();
      const verifyRaw: BackendUserRaw | undefined =
        (verify?.user as BackendUserRaw) ?? (verify as BackendUserRaw);
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
          console.warn(
            '[Profile] Secondary fetch failed, using verify payload'
          );
        }
      }

      const mapSkills = (val: BackendUserRaw['skills']) =>
        (val ?? [])
          .filter(Boolean)
          .map((s) => {
            if (typeof s === 'string') return { name: s };
            if (s && typeof s === 'object') {
              const obj = s as {
                name?: string;
                level?: string;
                years?: number;
              };
              return {
                name: obj.name || '',
                level: obj.level,
                years: typeof obj.years === 'number' ? obj.years : undefined,
              };
            }
            return { name: '' };
          })
          .filter((s) => s.name);

      const mapQualifications = (val: BackendUserRaw['qualifications']) =>
        (val ?? [])
          .filter(Boolean)
          .map((q) => {
            if (q && typeof q === 'object') {
              const obj = q as {
                title?: string;
                institution?: string;
                year?: number;
              };
              return {
                title: obj.title || '',
                institution: obj.institution || '',
                year:
                  typeof obj.year === 'number'
                    ? obj.year
                    : new Date().getFullYear(),
              };
            }
            return {
              title: '',
              institution: '',
              year: new Date().getFullYear(),
            };
          })
          .filter((q) => q.title && q.institution);

      const mapExperience = (val: BackendUserRaw['experience']) =>
        (val ?? [])
          .filter(Boolean)
          .map((ex) => {
            if (ex && typeof ex === 'object') {
              const obj = ex as {
                company?: string;
                role?: string;
                duration?: string;
                description?: string;
              };
              return {
                company: obj.company || '',
                role: obj.role || '',
                duration: obj.duration || '',
                description:
                  typeof obj.description === 'string'
                    ? obj.description
                    : undefined,
              };
            }
            return { company: '', role: '', duration: '' };
          })
          .filter((ex) => ex.company && ex.role && ex.duration);

      const d: UserProfileFormData = {
        ...empty,
        name: fullRaw.name || verifyRaw.name || '',
        email: fullRaw.email || verifyRaw.email || '',
        phone: fullRaw.phone || verifyRaw.phone || '',
        bio: fullRaw.bio || undefined,
        skills: mapSkills(fullRaw.skills),
        qualifications: mapQualifications(fullRaw.qualifications),
        experience: mapExperience(fullRaw.experience),
        links: (fullRaw.links ?? []).filter(
          (l): l is string => typeof l === 'string' && !!l.trim()
        ),
        tasksPosted: (fullRaw.tasksPosted ?? [])
          .map((t) => toId(t))
          .filter((t): t is string => !!t),
        tasksCompleted: (fullRaw.tasksCompleted ?? [])
          .map((t) => toId(t))
          .filter((t): t is string => !!t),
        profileImage: toId(fullRaw.profileImage) || undefined,
      };
      this.setState({ d });
    } catch (e: unknown) {
      const message =
        e && typeof e === 'object' && 'message' in e
          ? String((e as { message?: unknown }).message)
          : 'Failed to load user';
      this.setState({ error: message });
    } finally {
      this.setState({ loading: false });
    }
  }
  handleUpdated = (updated: UserProfileFormData) => {
    this.setState({ d: updated, editing: false });
  };
  render() {
    const { d, loading, error, editing } = this.state;
    const downloadJson = (data: unknown, filename: string) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };
    const downloadProfile = () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        profile: d,
      };
      const safe = (d.name || 'user')
        .toString()
        .trim()
        .replace(/\s+/g, '_')
        .slice(0, 32);
      downloadJson(payload, `profile-${safe}-${Date.now()}.json`);
    };
    if (loading)
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
          }}
        >
          <div
            style={{
              background: 'var(--card-background)',
              padding: 28,
              borderRadius: 12,
              boxShadow: '0 1px 3px var(--card-shadow)',
              fontSize: 14,
              color: 'var(--text-primary)',
            }}
          >
            Loading profile...
          </div>
        </div>
      );
    if (error)
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
          }}
        >
          <div
            style={{
              background: 'var(--card-background)',
              padding: 28,
              border: '1px solid var(--card-border)',
              color: '#b91c1c',
              borderRadius: 12,
              maxWidth: 480,
            }}
          >
            Error: {error}
          </div>
        </div>
      );
    if (editing) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '40px 32px',
          }}
        >
          <div
            style={{
              maxWidth: 1180,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: 32,
            }}
          >
            {/* Left panel placeholder (could be used for future navigation but kept empty per instructions) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div
                style={{
                  background: 'var(--card-background)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 16,
                  padding: 24,
                  boxShadow: '0 2px 4px var(--card-shadow)',
                }}
              >
                <h2
                  style={{
                    fontSize: 18,
                    margin: 0,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Edit Profile
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    margin: '8px 0 0',
                  }}
                >
                  Update your personal information.
                </p>
                <button
                  onClick={() => this.setState({ editing: false })}
                  style={{
                    marginTop: 20,
                    background: '#eef2ff',
                    border: '1px solid #c7d2fe',
                    color: '#1d4ed8',
                    padding: '8px 14px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            <div
              style={{
                background: 'var(--card-background)',
                border: '1px solid var(--card-border)',
                borderRadius: 20,
                padding: 32,
                boxShadow: '0 4px 8px var(--card-shadow)',
              }}
            >
              <UpdateUserProfileForm
                initial={d}
                onUpdated={this.handleUpdated}
              />
            </div>
          </div>
        </div>
      );
    }
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--background)',
          padding: 32,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            display: 'grid',
            gap: 24,
            gridTemplateColumns: '280px 1fr',
          }}
        >
          {/* Sidebar / Profile Card */}
          <div
            style={{
              background: 'var(--card-background)',
              padding: 24,
              borderRadius: 16,
              boxShadow: '0 1px 3px var(--card-shadow)',
              height: 'fit-content',
              border: '1px solid var(--card-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  background: '#e2e8f0',
                  overflow: 'hidden',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 40,
                  fontWeight: 600,
                  color: '#475569',
                }}
              >
                {d.profileImage ? (
                  <img
                    src={d.profileImage}
                    alt={d.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  d.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <h1
                style={{
                  fontSize: 22,
                  margin: '0 0 4px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {d.name || 'Unnamed User'}
              </h1>
              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                }}
              >
                {d.email}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {d.phone || 'No phone provided'}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => this.setState({ editing: true })}
                  style={{
                    background: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit Profile
                </button>
                <button
                  onClick={downloadProfile}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)',
                    padding: '8px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Download Profile
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <Section title="Bio">
              {d.bio ? (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {d.bio}
                </p>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No bio
                </div>
              )}
            </Section>
            <Section title="Skills">
              {d.skills.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No skills
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {d.skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        background: '#eef2ff',
                        color: '#3730a3',
                        padding: '6px 10px',
                        borderRadius: 20,
                        fontSize: 12,
                      }}
                    >
                      {s.name}
                      {s.level ? ` (${s.level})` : ''}
                      {s.years !== undefined ? ` - ${s.years}y` : ''}
                    </span>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Qualifications">
              {d.qualifications.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No qualifications
                </div>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {d.qualifications.map((q, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.4 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {q.title}
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {q.institution} ({q.year})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Experience">
              {d.experience.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No experience
                </div>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                  {d.experience.map((ex, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.5 }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {ex.company}
                        </strong>{' '}
                        – {ex.role}{' '}
                        <span style={{ color: 'var(--text-muted)' }}>
                          ({ex.duration})
                        </span>
                      </div>
                      {ex.description && (
                        <div
                          style={{
                            marginTop: 4,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {ex.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Links">
              {d.links.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  No links
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {d.links.map((link, i) => (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none',
                        fontSize: 13,
                        wordBreak: 'break-all',
                      }}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              )}
            </Section>
            <Section title="Tasks">
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    Tasks Posted:
                  </strong>{' '}
                  {d.tasksPosted.length ? (
                    d.tasksPosted.join(', ')
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>None</span>
                  )}
                </div>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    Tasks Completed:
                  </strong>{' '}
                  {d.tasksCompleted.length ? (
                    d.tasksCompleted.join(', ')
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>None</span>
                  )}
                </div>
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
