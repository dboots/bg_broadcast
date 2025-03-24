import useAuth from '@/hooks/useAuth';
import { Profile } from '@/models/profile.model';
import { UserService } from '@/services/user.service';
import { useEffect, useState } from 'react';

const UserProfilePage = () => {
  const [profile, updateProfile] = useState<Profile | undefined>();
  const user = useAuth();
  const service = new UserService();

  useEffect(() => {
    // Fetch user data based on the userId
    const fetchUser = async () => {
      try {
        updateProfile(await service.single<Profile>(user?.uid as string));
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

  const createStripeId = async () => {
    const customer = await fetch('/api/stripe/create-customer');
    const res = await customer.json();

    await service.update(
      {
        stripeId: res.body,
      },
      user.uid
    );
    updateProfile({
      ...profile,
      uid: user.uid,
      stripeId: res.body,
    });
  };

  return (
    <div>
      <h1>User Profile</h1>
      {profile?.stripeId ? (
        <>{profile?.stripeId}</>
      ) : (
        <button onClick={createStripeId}>Create Stripe Id</button>
      )}
    </div>
  );
};

export default UserProfilePage;
