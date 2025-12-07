import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Save, Camera } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { TopBar } from './shared/TopBar';
import { useEffect } from 'react';
import { api, updateMe } from "../lib/api";

interface SettingsPageProps {
  onLogout: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

interface ProfileData {
  name: string;
  email: string;
  bio: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SettingsPage({ onLogout, isDarkMode, onToggleTheme }: SettingsPageProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Fitness enthusiast on a journey to better health.',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarImage, setAvatarImage] = useState<string>('');
  const [profileErrors, setProfileErrors] = useState<Partial<ProfileData>>({});
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordData>>({});
  const [isSaving, setIsSaving] = useState(false);
// ✅ تحميل بيانات المستخدم عند فتح الصفحة
useEffect(() => {
  async function loadProfile() {
    try {
      const res = await api<{ user: any }>("/api/auth/me");
      if (res.user) {
        setProfileData({
          name: res.user.firstName + " " + res.user.lastName,
          email: res.user.email,
          bio: res.user.bio || "",
        });
        setAvatarImage(res.user.avatar || "");
        console.log("✅ Loaded user profile:", res.user);
      }
    } catch (err) {
      console.error("❌ Failed to load profile:", err);
    }
  }
  loadProfile();
}, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateProfile = (): boolean => {
    const errors: Partial<ProfileData> = {};

    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      errors.email = 'Email is invalid';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = (): boolean => {
    const errors: Partial<PasswordData> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

const handleProfileSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateProfile()) return;

  setIsSaving(true);

  try {
    const [firstName, ...rest] = profileData.name.split(" ");
    const lastName = rest.join(" ");

    const payload = {
      firstName,
      lastName,
      email: profileData.email,
      bio: profileData.bio,
      avatar: avatarImage
    };

    const res = await api<{ ok: boolean }>("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("✅ Profile updated!");
    }
  } catch (err) {
    console.error("❌ Failed to update profile:", err);
    alert("⚠️ Failed to save profile.");
  }

  setIsSaving(false);
};



const handlePasswordSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validatePassword()) return;

  setIsSaving(true);
  try {
    const res = await api<{ ok: boolean }>("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    });

    if (res.ok) {
      alert("✅ Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  } catch (err) {
    console.error("❌ Failed to change password:", err);
    alert("⚠️ Failed to change password.");
  } finally {
    setIsSaving(false);
  }
};


  return (
    <div className="h-screen flex flex-col bg-background">
      
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-background via-accent/5 to-secondary/20">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="text-center space-y-3 py-6">
            <div className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-8 py-4 rounded-2xl">
              <User className="h-8 w-8 text-primary" />
              <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Settings & Profile
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Information Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-accent/10">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                    {avatarImage ? (
                      <img 
                        src={avatarImage} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent">
                        <User className="h-12 w-12 text-primary" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-primary/20 hover:border-primary/40 shadow-sm"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  {avatarImage && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setAvatarImage('')}
                      className="ml-2 text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    JPG, PNG or GIF. Max size 2MB
                  </p>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className={profileErrors.name ? 'border-destructive' : 'border-primary/20'}
                  />
                  {profileErrors.name && (
                    <p className="text-sm text-destructive">{profileErrors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className={profileErrors.email ? 'border-destructive' : 'border-primary/20'}
                  />
                  {profileErrors.email && (
                    <p className="text-sm text-destructive">{profileErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    className="border-primary/20"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-secondary/20">
            <CardHeader className="bg-gradient-to-r from-secondary/50 to-transparent border-b">
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5 text-primary" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={passwordErrors.currentPassword ? 'border-destructive' : 'border-primary/20'}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={passwordErrors.newPassword ? 'border-destructive' : 'border-primary/20'}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={passwordErrors.confirmPassword ? 'border-destructive' : 'border-primary/20'}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
