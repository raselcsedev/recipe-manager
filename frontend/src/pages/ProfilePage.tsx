import { useEffect, useState } from 'react';
import { fetchProfile, updateProfile, changePassword } from '../api/api';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile()
      .then(response => {
        const profile = response.data.data;
        setName(profile.name);
        setEmail(profile.email);
      })
      .catch(err => setError(err?.response?.data?.message || 'Unable to load profile'));
  }, []);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await updateProfile({ name, email });
      setMessage('Profile updated.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update profile');
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await changePassword({ currentPassword, newPassword });
      setMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to change password');
    }
  };

  return (
    <div className="card">
      <h2>Profile</h2>
      <form onSubmit={handleUpdate} className="profile-form">
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </label>
        <button type="submit">Save Profile</button>
      </form>
      <form onSubmit={handlePasswordChange} className="profile-form">
        <label>
          Current Password
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
        </label>
        <label>
          New Password
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </label>
        <button type="submit">Change Password</button>
      </form>
      {message && <div className="success">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ProfilePage;
