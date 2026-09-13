"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Smartphone,
  LogOut,
  Save,
} from "lucide-react";
import { api, fmtDate } from "@/lib/api-client";
import {
  Badge,
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Spinner,
  useToast,
} from "@/components/admin/ui";
import type { AdminUser, CmsAdminSession } from "@/lib/cms-types";

export default function AccountManager() {
  const toast = useToast();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [sessions, setSessions] = useState<CmsAdminSession[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await api<{ admin: AdminUser; sessions: CmsAdminSession[] }>(
        "/api/admin/account"
      );
      setAdmin(res.admin);
      setSessions(res.sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load account");
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.resolve();
      if (cancelled) return;
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <Card>
        <p className="text-[13px] text-error">Failed to load account: {error}</p>
        <Button className="mt-3" onClick={load}>
          Retry
        </Button>
      </Card>
    );
  }
  if (!admin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Manage your account name, password, and multi-factor authentication."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <NameCard
            admin={admin}
            onSaved={(name) => setAdmin({ ...admin, name })}
          />
          <PasswordCard />
        </div>
        <div className="space-y-6">
          <TwoFactorCard
            admin={admin}
            onToggle={(enabled) => setAdmin({ ...admin, two_factor_enabled: enabled })}
          />
          <SessionsCard
            sessions={sessions}
            onRevoked={async () => {
              const res = await api<{ admin: AdminUser; sessions: CmsAdminSession[] }>(
                "/api/admin/account"
              );
              setSessions(res.sessions);
            }}
          />
        </div>
      </div>
    </div>
  );
}

function NameCard({
  admin,
  onSaved,
}: {
  admin: AdminUser;
  onSaved: (name: string) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(admin.name);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      toast("Name cannot be empty", "error");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/account", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });
      toast("Name updated", "success");
      onSaved(name.trim());
    } catch (err) {
      toast(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-accent-blue" />
        <h2 className="text-[13px] font-semibold text-text-primary">Profile</h2>
      </div>
      <div className="flex items-center gap-3 rounded-lg bg-bg-base p-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan text-[18px] font-bold text-white">
          {admin.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-[13px] font-medium text-text-primary">{admin.name}</p>
          <p className="text-[12px] text-text-muted">{admin.email}</p>
        </div>
      </div>
      <Field label="Display name" className="mt-4">
        <div className="flex gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={save} loading={saving} disabled={name === admin.name}>
            <Save className="h-4 w-4" /> Save
          </Button>
        </div>
      </Field>
    </Card>
  );
}

function PasswordCard() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const save = async () => {
    if (next !== confirm) {
      toast("New passwords do not match", "error");
      return;
    }
    if (next.length < 8) {
      toast("New password must be at least 8 characters", "error");
      return;
    }
    setSaving(true);
    try {
      await api("/api/admin/account/password", {
        method: "POST",
        body: JSON.stringify({ current, next }),
      });
      toast("Password changed", "success");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Lock className="h-4 w-4 text-accent-amber" />
        <h2 className="text-[13px] font-semibold text-text-primary">Password</h2>
      </div>
      <div className="space-y-3">
        <Field label="Current password">
          <Input
            type={showCurrent ? "text" : "password"}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <Input
            type={showNew ? "text" : "password"}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className="pr-10"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm new password">
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Button
          onClick={save}
          loading={saving}
          disabled={!current || !next || !confirm || next !== confirm}
        >
          Change password
        </Button>
      </div>
    </Card>
  );
}

function TwoFactorCard({
  admin,
  onToggle,
}: {
  admin: AdminUser;
  onToggle: (enabled: boolean) => void;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secret: string; uri: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [action, setAction] = useState<"idle" | "setup" | "verify-enable" | "disable-confirm">(
    admin.two_factor_enabled ? "idle" : "idle"
  );

  const startSetup = async () => {
    setLoading(true);
    try {
      const res = await api<{ secret: string; uri: string }>("/api/admin/account/2fa/setup", {
        method: "POST",
      });
      setSetupData(res);
      setAction("verify-enable");
      toast("Scan the QR code with your authenticator app", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to start 2FA setup", "error");
    } finally {
      setLoading(false);
    }
  };

  const enable = async () => {
    if (!setupData || !/^\d{6}$/.test(verifyCode)) {
      toast("Enter a 6-digit code from your authenticator", "error");
      return;
    }
    setLoading(true);
    try {
      await api("/api/admin/account/2fa", {
        method: "POST",
        body: JSON.stringify({ secret: setupData.secret, code: verifyCode }),
      });
      toast("Two-factor authentication enabled", "success");
      setAction("idle");
      setSetupData(null);
      setVerifyCode("");
      onToggle(true);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to enable 2FA", "error");
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    if (!disablePassword || !/^\d{6}$/.test(disableCode)) {
      toast("Enter your password and authenticator code", "error");
      return;
    }
    setLoading(true);
    try {
      await api("/api/admin/account/2fa", {
        method: "DELETE",
        body: JSON.stringify({ password: disablePassword, code: disableCode }),
      });
      toast("Two-factor authentication disabled", "success");
      setAction("idle");
      setDisablePassword("");
      setDisableCode("");
      onToggle(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to disable 2FA", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-success" />
        <h2 className="text-[13px] font-semibold text-text-primary">
          Two-factor authentication
        </h2>
        <Badge tone={admin.two_factor_enabled ? "success" : "warning"}>
          {admin.two_factor_enabled ? "enabled" : "disabled"}
        </Badge>
      </div>

      {action === "idle" && (
        <p className="mb-4 text-[13px] text-text-secondary">
          {admin.two_factor_enabled
            ? "Two-factor authentication is active on your account."
            : "Add an extra layer of security by requiring a code from your authenticator app at sign-in."}
        </p>
      )}

      {action === "idle" && !admin.two_factor_enabled && (
        <Button onClick={startSetup} loading={loading}>
          <Smartphone className="h-4 w-4" /> Enable 2FA
        </Button>
      )}
      {action === "idle" && admin.two_factor_enabled && (
        <Button variant="danger" onClick={() => setAction("disable-confirm")}>
          Disable 2FA
        </Button>
      )}

      {action === "verify-enable" && setupData && (
        <div className="space-y-4">
          <p className="text-[13px] text-text-secondary">
            Add this secret to your authenticator app, or scan the URI below:
          </p>
          <div className="rounded-lg border border-border-subtle bg-bg-base p-3 text-center">
            <p className="mb-1 text-[11px] font-medium text-text-muted">Secret</p>
            <p className="select-all break-all font-mono text-[13px] font-bold text-accent-blue">
              {setupData.secret}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-base p-3">
            <p className="mb-1 text-[11px] font-medium text-text-muted">URI</p>
            <p className="break-all font-mono text-[11px] text-text-secondary">
              {setupData.uri}
            </p>
          </div>
          <Field label="6-digit verification code">
            <Input
              inputMode="numeric"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              autoComplete="one-time-code"
              className="font-mono tracking-widest"
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => { setAction("idle"); setSetupData(null); }}>
              Cancel
            </Button>
            <Button onClick={enable} loading={loading} disabled={verifyCode.length !== 6}>
              Enable 2FA
            </Button>
          </div>
        </div>
      )}

      {action === "disable-confirm" && (
        <div className="space-y-4">
          <p className="text-[13px] text-text-secondary">
            To disable 2FA, enter your current password and a valid authenticator code.
          </p>
          <Field label="Current password">
            <Input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field label="Authenticator code">
            <Input
              inputMode="numeric"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="font-mono tracking-widest"
            />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setAction("idle")}>
              Cancel
            </Button>
            <Button variant="danger" onClick={disable} loading={loading}>
              Disable 2FA
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function SessionsCard({
  sessions,
  onRevoked,
}: {
  sessions: CmsAdminSession[];
  onRevoked: () => void;
}) {
  const toast = useToast();
  const [busyId, setBusyId] = useState<string | null>(null);

  const revoke = async (id: string) => {
    setBusyId(id);
    try {
      await api(`/api/admin/account/sessions/${id}`, { method: "DELETE" });
      toast("Session revoked", "success");
      await onRevoked();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Revoke failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  const revokeAll = async () => {
    setBusyId("all");
    try {
      await api("/api/admin/account/sessions/all", { method: "DELETE" });
      toast("All other sessions revoked", "success");
      await onRevoked();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Revoke failed", "error");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-text-muted" />
          <h2 className="text-[13px] font-semibold text-text-primary">Active sessions</h2>
          <Badge>{sessions.length}</Badge>
        </div>
        {sessions.length > 1 && (
          <Button size="sm" variant="danger" onClick={revokeAll} loading={busyId === "all"}>
            Revoke all others
          </Button>
        )}
      </div>
      {sessions.length === 0 ? (
        <p className="text-[13px] text-text-muted">No active sessions.</p>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-base px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-text-primary" title={s.user_agent ?? "Unknown device"}>
                  {s.user_agent || "Unknown device"}
                </p>
                <p className="text-[11px] text-text-muted">
                  Created {fmtDate(s.created_at)} · Expires {fmtDate(s.expires_at)}
                  {s.ip && ` · IP ${s.ip}`}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => revoke(s.id)}
                loading={busyId === s.id}
                title="Revoke session"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}