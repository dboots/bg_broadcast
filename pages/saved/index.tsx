import useAuth from '@/hooks/useAuth';
import { Listing } from '@/models/listing.model';
import { Profile } from '@/models/profile.model';
import { BaseService } from '@/services/base.service';
import { UserService } from '@/services/user.service';
import React, { use, useEffect, useState } from 'react';

const SavedPage: React.FC = () => {
  const [profile, updateProfile] = useState<Profile | undefined>();
  const user = useAuth();
  const userService = new UserService();

  useEffect(() => {
    if (user) {
      const initProfile = async () => {
        console.log('init');
        updateProfile(await userService.single<Profile>(user.uid));
      };

      initProfile();
    }
  }, [user, userService]);

  useEffect(() => {
    console.log('profile', profile);
  }, [profile]);
  return (
    <div>
      <h1>Saved Page</h1>
      {profile?.listings?.map((listing) => (
        <div key={listing.id}>{listing.title}</div>
      ))}
      {/* Add your page content here */}
    </div>
  );
};

export default SavedPage;
