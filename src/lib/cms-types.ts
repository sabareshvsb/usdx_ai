export type PublishStatus = "draft" | "published";

export type ContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "divider" };

export interface CmsSection {
  id: string;
  key: string;
  title: string;
  heading: string;
  subheading: string;
  body: ContentBlock[];
  image_url: string;
  button_text: string;
  button_link: string;
  enabled: boolean;
  status: PublishStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsInstruction {
  id: string;
  title: string;
  description: string;
  image_url: string;
  item_date: string | null;
  link_text: string;
  link_url: string;
  status: PublishStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsAnnouncement {
  id: string;
  title: string;
  message: string;
  link_text: string;
  link_url: string;
  status: PublishStatus;
  sort_order: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsMedia {
  id: string;
  name: string;
  alt_text: string;
  folder: string;
  storage_path: string;
  url: string;
  size_bytes: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  is_banner: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  two_factor_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface CmsAdminSession {
  id: string;
  created_at: string;
  expires_at: string;
  user_agent: string | null;
  ip: string | null;
}

export interface CmsLeaderboardEntry {
  id: string;
  name: string;
  business_volume: number;
  rank: number;
  change_24h: number;
  avatar_url: string;
  status: PublishStatus;
  enabled: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicContent {
  sections: CmsSection[];
  instructions: CmsInstruction[];
  announcements: CmsAnnouncement[];
  leaderboard: CmsLeaderboardEntry[];
  settings: Record<string, string>;
}

export interface CmsSettings {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_telegram?: string;
  contact_x?: string;
}

export interface CmsSettingsRow {
  key: string;
  value: string;
  updated_at: string;
}

export const SECTION_KEYS = [
  "home",
  "about",
  "services",
  "instructions",
  "announcements",
  "gallery",
  "contact",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];