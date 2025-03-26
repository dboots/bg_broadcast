import useAuth from '@/hooks/useAuth';
import ProfileService from '@/services/profile.service';
import { Profile } from '@/types';
import { useEffect, useState } from 'react';

const UserProfilePage = () => {
  const [profile, updateProfile] = useState<Profile>();
  const user = useAuth();
  const service = new ProfileService();

  useEffect(() => {
    // Fetch user data based on the userId
    const fetchUser = async () => {
      try {
        const fetchedProfile = await service.getByFieldValue(
          'user_id',
          user?.user?.id as string
        );
        if (fetchedProfile) {
          updateProfile(fetchedProfile);
        } else {
          console.warn('Fetched profile is null');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    if (user) {
      fetchUser();
    }
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>User Profile</h1>
      <p>{profile?.name}</p>
    </div>
  );
};

export default UserProfilePage;
