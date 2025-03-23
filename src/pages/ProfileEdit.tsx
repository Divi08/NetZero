import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, Image, User } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user, refreshUserProfile } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    education: '',
    email: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        username: user.username || '',
        bio: user.bio || '',
        education: user.education || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage || !auth.currentUser) return null;
    
    const storage = getStorage();
    const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}/${profileImage.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, profileImage);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Validate username (only letters, numbers, and underscores)
      if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
        toast.error('Username can only contain letters, numbers, and underscores');
        return;
      }
      
      // Upload profile image if one was selected
      let photoURL = user.photoURL;
      if (profileImage) {
        const uploadedURL = await uploadProfileImage();
        if (uploadedURL) {
          photoURL = uploadedURL;
        }
      }
      
      // Update the user document in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username?.toLowerCase(),
        usernameDisplay: formData.username,
        bio: formData.bio,
        education: formData.education,
        photoURL: photoURL
      });
      
      // Refresh the user context
      await refreshUserProfile();
      
      toast.success('Profile updated successfully');
      navigate('/profile/' + formData.username);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!formData.firstName && !formData.lastName) return '';
    return (formData.firstName?.[0] || '') + (formData.lastName?.[0] || '');
  };

  if (!user) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
            
            <form onSubmit={handleSubmit}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Upload a new profile picture or keep your current one</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={profileImagePreview || user.photoURL || undefined} 
                        alt={user.usernameDisplay} 
                      />
                      <AvatarFallback className="bg-primary text-white text-2xl">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="relative">
                      <Input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('profileImage')?.click()}
                      >
                        <Image className="mr-2 h-4 w-4" />
                        Choose Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">
                      Username
                    </label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Choose a username"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Only letters, numbers, and underscores allowed.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="education" className="block text-sm font-medium mb-1">
                      Education
                    </label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="Enter your education background"
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>About You</CardTitle>
                  <CardDescription>Tell others about yourself</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell others about yourself..."
                      className="resize-none"
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Briefly describe yourself, your interests, or your expertise in climate issues.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
} 