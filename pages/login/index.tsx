import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';

export default function Page() {
  const supabase = getSupabaseClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    });

    console.log(data, error);
  };

  return (
    <div className='container m-auto bg-red-500'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor='username'>Username</label>
          <input
            type='text'
            id='username'
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          <input
            type='password'
            id='password'
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <button type='submit'>Login</button>
        <button type='button' onClick={() => supabase.auth.signOut()}>
          Logout
        </button>
      </form>
    </div>
  );
}
