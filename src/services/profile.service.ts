import { Profile } from '@/types';
import { SupabaseService } from './base.service';

class ProfileService extends SupabaseService<Profile> {
  constructor() {
    super('profile'); // 'users' is the table name in Supabase
  }
}

export default ProfileService;
