import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { BaseService } from '@/services/base.service';
import { auth } from '@/app/firebase/config';

export default function Page() {
    const service = new BaseService('users');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const auth = getAuth();
        signInWithEmailAndPassword(auth, username, password).then((credential: any) => console.log(credential.user));
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
                <button type="button" onClick={() => auth.signOut()}>Logout</button>
            </form>
        </div>
    );
}
