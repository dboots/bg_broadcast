
import { Session } from '@/types';
import { SupabaseService } from './base.service';

class SessionService extends SupabaseService<Session> {
  constructor() {
    super('session'); // 'users' is the table name in Supabase
  }
}

export default SessionService;
