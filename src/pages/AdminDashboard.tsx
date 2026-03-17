import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient.ts';
import { useAuth } from '../context/AuthContext.tsx';
import MFAManageCard from '../components/MFAManageCard.tsx';
import InquiryManagement from '../components/InquiryManagement.tsx';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'user';
  login_enabled: boolean;
  created_at: string;
}

const roleLabel = (role: 'admin' | 'user') => role === 'admin' ? 'Admin' : 'Team';

type ModalType = 'create' | 'change_password' | 'delete' | null;

const AdminDashboard: React.FC = () => {
  const { profile: currentProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [changePassword, setChangePassword] = useState('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) setUsers(data as Profile[]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setNewEmail('');
    setNewPassword('');
    setNewDisplayName('');
    setNewRole('user');
    setModalType('create');
  };

  const openChangePassword = (user: Profile) => {
    setSelectedUser(user);
    setChangePassword('');
    setModalType('change_password');
  };

  const openDelete = (user: Profile) => {
    setSelectedUser(user);
    setModalType('delete');
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'create',
          email: newEmail,
          password: newPassword,
          display_name: newDisplayName,
          role: newRole,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || `Failed to create user (${response.status})`);
      await loadUsers();
      closeModal();
      showToast(`Account created for ${newEmail}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'change_password',
          user_id: selectedUser.id,
          password: changePassword,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to change password');
      closeModal();
      showToast('Password updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          user_id: selectedUser.id,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete user');
      await loadUsers();
      closeModal();
      showToast('User deleted. Their listings are preserved.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const callAdminFunction = async (body: object) => {
    const session = (await supabase.auth.getSession()).data.session;
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || result.msg || result.message || `Error ${response.status}`);
    return result;
  };

  const handleToggleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await callAdminFunction({ action: 'update_role', user_id: user.id, role: newRole });
      await loadUsers();
      showToast(`${user.display_name || user.email} is now ${newRole === 'admin' ? 'an Admin' : 'a Team user'}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update role', 'error');
    }
  };

  const handleToggleLogin = async (user: Profile) => {
    try {
      await callAdminFunction({ action: 'toggle_login', user_id: user.id, login_enabled: !user.login_enabled });
      await loadUsers();
      showToast(`Login ${!user.login_enabled ? 'enabled' : 'disabled'} for ${user.display_name || user.email}`, 'success');
    } catch (err: any) {
      showToast('Failed to update login status', 'error');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-sm font-bold animate-in slide-in-from-right-5 duration-300 ${
          toast.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          <span className="material-icons text-lg">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/Image/LimeLogo2.png" alt="Yhen's Property" className="h-10 w-auto rounded-lg" />
            <div>
              <h1 className="text-lg font-black text-zinc-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-zinc-400">Signed in as <span className="font-bold text-primary">{currentProfile?.email}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all"
            >
              <span className="material-icons text-base">home</span>
              View Site
            </button>
            <button
              onClick={() => navigate('/manage')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary transition-all"
            >
              <span className="material-icons text-base">home_work</span>
              Listings
            </button>
            <button
              onClick={handleSignOut}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all"
            >
              <span className="material-icons text-base">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: users.length, icon: 'group', color: 'text-blue-500' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: 'admin_panel_settings', color: 'text-primary' },
            { label: 'Team', value: users.filter(u => u.role === 'user').length, icon: 'badge', color: 'text-sky-500' },
            { label: 'Disabled', value: users.filter(u => !u.login_enabled).length, icon: 'block', color: 'text-red-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className={`material-icons text-2xl ${stat.color}`}>{stat.icon}</span>
                <span className="text-3xl font-black text-zinc-900 dark:text-white">{stat.value}</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900 dark:text-white">User Accounts</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Manage who can access the admin portal</p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-zinc-900 rounded-xl font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              <span className="material-icons text-base">person_add</span>
              Add User
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <span className="material-icons animate-spin text-primary text-3xl">sync</span>
            </div>
          ) : (
            <>
              {/* Mobile */}
              <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map(user => (
                  <div key={user.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>
                          {(user.display_name || user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm dark:text-white">{user.display_name || '—'}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-sky-50 text-sky-600'
                        }`}>{roleLabel(user.role)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          user.login_enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                        }`}>{user.login_enabled ? 'Active' : 'Disabled'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {user.id !== currentProfile?.id && currentProfile?.role === 'admin' && (
                        <button
                          onClick={() => handleToggleRole(user)}
                          title={user.role === 'admin' ? 'Demote to Team' : 'Promote to Admin'}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                            user.role === 'admin'
                              ? 'border-primary/30 bg-primary/10 text-primary hover:bg-red-50 hover:border-red-300 hover:text-red-500'
                              : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-primary/30 hover:bg-primary/10 hover:text-primary'
                          }`}
                        >
                          <span className="material-icons text-sm">{user.role === 'admin' ? 'admin_panel_settings' : 'badge'}</span>
                          {user.role === 'admin' ? 'Admin' : 'Team'}
                        </button>
                      )}
                      <button onClick={() => handleToggleLogin(user)} title={user.login_enabled ? 'Disable Login' : 'Enable Login'}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                          user.login_enabled
                            ? 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-300'
                            : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50'
                        }`}>
                        <span className="material-icons text-base">{user.login_enabled ? 'block' : 'check_circle'}</span>
                      </button>
                      {currentProfile?.role === 'admin' && (
                        <button onClick={() => openChangePassword(user)} title="Change Password"
                          className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-primary hover:border-primary transition-all">
                          <span className="material-icons text-base">key</span>
                        </button>
                      )}
                      {user.id !== currentProfile?.id && currentProfile?.role === 'admin' && (
                        <button onClick={() => openDelete(user)} title="Delete User"
                          className="w-9 h-9 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-300 transition-all">
                          <span className="material-icons text-base">person_remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">User</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Login Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">Created</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                              user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}>
                              {(user.display_name || user.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm dark:text-white">{user.display_name || '—'}</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            user.role === 'admin'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 border border-sky-200 dark:border-sky-800'
                          }`}>{roleLabel(user.role)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-bold w-fit ${
                            user.login_enabled ? 'text-emerald-600' : 'text-red-500'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${user.login_enabled ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            {user.login_enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-zinc-500">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {user.id !== currentProfile?.id && currentProfile?.role === 'admin' && (
                              <button
                                onClick={() => handleToggleRole(user)}
                                title={user.role === 'admin' ? 'Demote to Team' : 'Promote to Admin'}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                                  user.role === 'admin'
                                    ? 'border-primary/30 bg-primary/10 text-primary hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-500'
                                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-primary/30 hover:bg-primary/10 hover:text-primary'
                                }`}
                              >
                                <span className="material-icons text-sm">{user.role === 'admin' ? 'admin_panel_settings' : 'badge'}</span>
                                {user.role === 'admin' ? 'Admin' : 'Team'}
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleLogin(user)}
                              title={user.login_enabled ? 'Disable Login' : 'Enable Login'}
                              className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all ${
                                user.login_enabled
                                  ? 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-300'
                                  : 'border-emerald-200 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                            >
                              <span className="material-icons text-sm">{user.login_enabled ? 'block' : 'check_circle'}</span>
                            </button>
                            {currentProfile?.role === 'admin' && (
                              <button
                                onClick={() => openChangePassword(user)}
                                title="Change Password"
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-primary hover:border-primary transition-all"
                              >
                                <span className="material-icons text-sm">key</span>
                              </button>
                            )}
                            {user.id !== currentProfile?.id && currentProfile?.role === 'admin' && (
                              <button
                                onClick={() => openDelete(user)}
                                title="Delete User"
                                className="w-9 h-9 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500 hover:border-red-300 transition-all"
                              >
                                <span className="material-icons text-sm">person_remove</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Inquiry Management */}
        <InquiryManagement />

        {/* MFA Card */}
        <MFAManageCard onToast={showToast} />

        {/* Info Card */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex items-start gap-4">
          <span className="material-icons text-amber-500 text-xl mt-0.5">info</span>
          <div>
            <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Listings are preserved when users are deleted</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">When you delete a user account, all of their property listings remain in the database and will still be visible on the site. They will no longer be linked to any account.</p>
          </div>
        </div>
      </div>

      {/* Modal Backdrop */}
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-900/70 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">

            {/* Create User Modal */}
            {modalType === 'create' && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black dark:text-white">Create New Account</h2>
                  <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="material-icons text-lg text-zinc-500">close</span>
                  </button>
                </div>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                    <input type="text" value={newDisplayName} onChange={e => setNewDisplayName(e.target.value)} required placeholder="e.g. Maria Santos"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                    <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required placeholder="agent@example.com"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Role</label>
                    <div className="relative">
                      <select
                        value={newRole}
                        onChange={e => setNewRole(e.target.value as 'admin' | 'user')}
                        className="w-full appearance-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer pr-10"
                      >
                        <option value="user">Team — Can add &amp; edit listings</option>
                        <option value="admin">Admin — Full access</option>
                      </select>
                      <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-base pointer-events-none">expand_more</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {newRole === 'admin'
                        ? 'Admin can manage users, delete listings, and change passwords.'
                        : 'Team users can add and edit listings but cannot delete them or change passwords.'}
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal}
                      className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl bg-primary text-zinc-900 font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {actionLoading ? <span className="material-icons animate-spin text-base">sync</span> : <span className="material-icons text-base">person_add</span>}
                      {actionLoading ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Change Password Modal */}
            {modalType === 'change_password' && selectedUser && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black dark:text-white">Change Password</h2>
                    <p className="text-xs text-zinc-400 mt-0.5">{selectedUser.email}</p>
                  </div>
                  <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <span className="material-icons text-lg text-zinc-500">close</span>
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">New Password</label>
                    <input type="password" value={changePassword} onChange={e => setChangePassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters"
                      className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={closeModal}
                      className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                      Cancel
                    </button>
                    <button type="submit" disabled={actionLoading}
                      className="flex-1 py-3 rounded-xl bg-primary text-zinc-900 font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      {actionLoading ? <span className="material-icons animate-spin text-base">sync</span> : <span className="material-icons text-base">key</span>}
                      {actionLoading ? 'Updating...' : 'Update'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Delete User Modal */}
            {modalType === 'delete' && selectedUser && (
              <>
                <div className="flex flex-col items-center text-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="material-icons text-3xl text-red-500">person_remove</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black dark:text-white">Delete Account</h2>
                    <p className="text-sm text-zinc-500 mt-2">Are you sure you want to delete <span className="font-bold text-zinc-700 dark:text-zinc-300">{selectedUser.display_name || selectedUser.email}</span>?</p>
                    <p className="text-xs text-zinc-400 mt-2">Their listings will be preserved in the database.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeModal}
                    className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleDeleteUser} disabled={actionLoading}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {actionLoading ? <span className="material-icons animate-spin text-base">sync</span> : <span className="material-icons text-base">delete</span>}
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
