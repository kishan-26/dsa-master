"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch, ApiError } from "@/lib/utils/api-fetch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, setSession, accessToken, clearSession } = useAuthStore();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [changingPassword, setChangingPassword] = useState(false);

  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await apiFetch<{ user: any }>("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      if (accessToken) setSession(data.user, accessToken);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify(passwords) });
      toast.success("Password updated. Please log in again.");
      clearSession();
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Password change failed");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleLogoutAll() {
    setLoggingOutAll(true);
    try {
      await apiFetch("/api/auth/logout-all", { method: "POST" });
      toast.success("Logged out of all devices");
      clearSession();
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to log out other devices");
    } finally {
      setLoggingOutAll(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      await apiFetch("/api/profile", { method: "DELETE" });
      toast.success("Account deleted");
      clearSession();
      router.push("/signup");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Manage your account details and security.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>Your name and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-gradient text-xl font-semibold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="text-sm text-muted-foreground">
                Avatar upload lands with question/notes image support in Phase 2.
              </div>
            </div>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} disabled />
            </div>
            <Button type="submit" loading={savingProfile}>
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>You&apos;ll be logged out everywhere after this.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              />
            </div>
            <Button type="submit" variant="secondary" loading={changingPassword}>
              Update password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Signed into this device. Log out everywhere if something looks off.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleLogoutAll} loading={loggingOutAll}>
            Log out of all devices
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>Deleting your account removes all your data permanently.</CardDescription>
        </CardHeader>
        <CardContent>
          {!confirmDelete ? (
            <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">Are you sure? This can&apos;t be undone.</p>
              <Button variant="destructive" onClick={handleDeleteAccount} loading={deleting}>
                Yes, delete everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
