"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Auth States
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filter, setFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Dropdown State for Mobile Member Role
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [devices, setDevices] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupChatId, setEditGroupChatId] = useState('');
  
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIp, setNewDeviceIp] = useState('');
  const [newDeviceMac, setNewDeviceMac] = useState(''); 
  
  const [editDeviceName, setEditDeviceName] = useState('');
  const [editDeviceIp, setEditDeviceIp] = useState('');
  const [editInterval, setEditInterval] = useState(4);
  const [editBreakStart, setEditBreakStart] = useState('');
  const [editBreakEnd, setEditBreakEnd] = useState('');
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupChatId, setNewGroupChatId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin'); 

  // Profile & Image States
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change States
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    const url = window.location.href;
    if (url.includes('invite=true') || url.includes('type=invite') || url.includes('type=recovery')) {
      setIsSettingPassword(true);
    }

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session);
      setLoading(false);
      if (session) {
        fetchData();
        fetchUserRole(session.user.id);
        setProfileImage(session.user.user_metadata?.avatar_url || null);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsSettingPassword(true);
      }
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setSession(session);
        if (session) {
          fetchData();
          fetchUserRole(session.user.id);
          setProfileImage(session.user.user_metadata?.avatar_url || null);
        }
      }
    });
    return () => { authListener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => { fetchData(); }, 20000); 
    return () => clearInterval(interval);
  }, [session]);

  const fetchUserRole = async (userId: string) => {
    const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
  };

  const fetchData = async () => {
    const { data: devicesData } = await supabase.from('devices').select('*').order('created_at', { ascending: true });
    const { data: groupsData } = await supabase.from('telegram_groups').select('*');
    const { data: membersData } = await supabase.from('profiles').select('*');
    
    if (devicesData) setDevices(devicesData);
    if (groupsData) setGroups(groupsData);
    if (membersData) setMembers(membersData);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    else {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      fetchData();
      fetchUserRole(data.session?.user.id as string);
      setProfileImage(data.session?.user.user_metadata?.avatar_url || null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/?type=recovery`,
    });

    if (error) setErrorMsg(error.message);
    else {
      setSuccessMsg("Password reset link sent to your email!");
      setTimeout(() => setIsForgotPassword(false), 3000);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert("Password set successfully! Welcome to Texan.");
      setIsSettingPassword(false);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  // 🌟 নতুন আপডেট: কারেন্ট পাসওয়ার্ড ভেরিফিকেশন সহ পাসওয়ার্ড চেঞ্জ
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg('');
    
    if (newPass !== confirmPass) {
      return setPassMsg("New passwords do not match!");
    }
    if (newPass.length < 6) {
      return setPassMsg("New password must be at least 6 characters.");
    }

    // ১. কারেন্ট পাসওয়ার্ড ভেরিফাই করা (লগইন চেক)
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: session.user.email,
      password: currentPass
    });

    if (signInError) {
      return setPassMsg("Incorrect current password.");
    }

    // ২. নতুন পাসওয়ার্ড সেভ করা
    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
    
    if (updateError) {
      setPassMsg(updateError.message);
    } else {
      setPassMsg("Password updated successfully!");
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        setImgPosition({ x: 0, y: 0 });
        setZoomLevel(1);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - imgPosition.x, y: e.clientY - imgPosition.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setImgPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  const handleMouseUp = () => setIsDragging(false);

  const saveProfileImage = async () => {
    if (!profileImage || !profileImage.startsWith('data:image')) return;
    try {
      const res = await fetch(profileImage);
      const blob = await res.blob();
      const fileExt = blob.type.split('/')[1] || 'png';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id);

      alert("Profile updated successfully!");
      setIsProfileModalOpen(false);
    } catch (error: any) {
      alert("Error uploading image: " + error.message);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (userRole !== 'super_admin') return alert("Only Admin can change roles.");
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', memberId);
    if (error) alert(error.message);
    else {
      alert("Role updated successfully!");
      fetchData();
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (userRole !== 'super_admin') return alert("Only Admin can delete members.");
    
    if(confirm("Are you sure you want to delete this member? (This will permanently delete their account and access)")) {
      try {
        const response = await fetch('/api/delete-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: memberId })
        });

        const result = await response.json();

        if (result.error) {
          alert("Error deleting member: " + result.error);
        } else {
          alert("Member deleted completely from server!");
          fetchData(); 
        }
      } catch (err) {
        alert("Network error occurred while deleting member.");
      }
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalRole = userRole === 'admin' ? 'admin' : inviteRole;

      const { error } = await supabase.auth.signUp({
        email: inviteEmail,
        password: 'TexanTempPass!123',
        options: { 
          data: { 
            role: finalRole,
            invited_by: session.user.id
          }, 
          emailRedirectTo: `${window.location.origin}/?invite=true` 
        }
      });
      if (error) throw error;
      alert(`Invitation sent to ${inviteEmail}!`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
    } catch (error: any) {
      alert("Error sending invite: " + error.message);
    }
  };

  const openEditModal = (device: any) => {
    if (userRole === 'contributor') {
      return alert("Access Denied: Only Admin or Editor can access device configuration.");
    }

    setSelectedDevice(device);
    setEditDeviceName(device.device_name || '');
    setEditDeviceIp(device.ip_address || '');
    setEditInterval(device.interval_minutes || 4);
    setEditBreakStart(device.break_start || '');
    setEditBreakEnd(device.break_end || '');
    
    let currentGroups = device.telegram_group_ids || [];
    if (currentGroups.length === 0 && device.telegram_group_id) {
      currentGroups = [device.telegram_group_id];
    }
    setEditGroupIds(currentGroups);
    
    setIsEditModalOpen(true);
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      interval_minutes: editInterval,
      break_start: editBreakStart || null,
      break_end: editBreakEnd || null,
      telegram_group_ids: editGroupIds, 
      telegram_group_id: editGroupIds[0] || null, 
    };
    
    if (userRole === 'super_admin' || userRole === 'admin') {
      updateData.device_name = editDeviceName;
      updateData.ip_address = editDeviceIp;
    }

    const { error } = await supabase.from('devices').update(updateData).eq('id', selectedDevice.id);
    if (error) alert("Error: " + error.message);
    else {
      setIsEditModalOpen(false);
      fetchData();
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') return alert("Only Admin can delete devices.");
    if(confirm("Are you sure you want to delete this device permanently?")) {
      const { error } = await supabase.from('devices').delete().eq('id', id);
      if (error) alert("Error: " + error.message);
      else fetchData();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') {
      return alert("Access Denied: Only Admin can change device status.");
    }
    setDevices(devices.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
    await supabase.from('devices').update({ is_active: !currentStatus }).eq('id', id);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const mac = newDeviceMac.trim() === '' ? null : newDeviceMac.trim();
    
    await supabase.from('devices').insert([{ 
      device_name: newDeviceName, 
      ip_address: newDeviceIp, 
      mac_address: mac,
      is_active: true, 
      interval_minutes: 4 
    }]);
    setIsAddDeviceModalOpen(false);
    setNewDeviceName(''); 
    setNewDeviceIp('');
    setNewDeviceMac('');
    fetchData();
  };

  const handleAddGroupClick = () => {
    if (userRole === 'editor' || userRole === 'contributor') {
      return alert("Access Denied: Only Admin can add new groups.");
    }
    setIsAddGroupModalOpen(true);
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('telegram_groups').insert([{ 
      group_name: newGroupName, 
      chat_id: newGroupChatId,
      created_by: session.user.id
    }]);
    setIsAddGroupModalOpen(false);
    setNewGroupName(''); setNewGroupChatId('');
    fetchData();
  };

  const openEditGroupModal = (group: any) => {
    setSelectedGroup(group);
    setEditGroupName(group.group_name);
    setEditGroupChatId(group.chat_id);
    setIsEditGroupModalOpen(true);
  };

  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('telegram_groups').update({
      group_name: editGroupName,
      chat_id: editGroupChatId
    }).eq('id', selectedGroup.id);
    
    if (error) alert("Error: " + error.message);
    else {
      setIsEditGroupModalOpen(false);
      fetchData();
    }
  };

  const handleRemoveGroup = async (id: string) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') return alert("Access Denied: Only Admin can remove groups.");
    if(confirm("Are you sure you want to remove this group?")) {
      await supabase.from('telegram_groups').delete().eq('id', id);
      fetchData();
    }
  };

  const handleGroupCheckboxChange = (groupId: string) => {
    setEditGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const isDeviceOnline = (lastHeartbeat: string) => {
    if (!lastHeartbeat) return false;
    const lastPing = new Date(lastHeartbeat).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - lastPing) / 1000 / 60;
    return diffInMinutes < 5; 
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (device.ip_address && device.ip_address.includes(searchQuery));
    if (filter === 'all') return matchesSearch;
    if (filter === 'online') return matchesSearch && isDeviceOnline(device.last_heartbeat);
    if (filter === 'offline') return matchesSearch && !isDeviceOnline(device.last_heartbeat);
    return matchesSearch;
  });

  const visibleMembers = members.filter(m => {
    if (userRole === 'super_admin') return true; 
    if (userRole === 'admin') {
      return m.invited_by === session.user.id || m.id === session.user.id;
    }
    return m.id === session.user.id; 
  });

  const visibleGroups = groups.filter(g => {
    if (userRole === 'super_admin') return true;
    if (!g.created_by) return true;
    const creator = members.find(m => m.id === g.created_by);
    if (creator && creator.role === 'super_admin') return false;
    if (userRole === 'admin') {
      return g.created_by === session.user.id;
    }
    return true;
  });

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wider text-white">Texan<span className="text-[#F7D117]">.</span></h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {['dashboard', 'devices', 'telegram', 'members'].map((tab) => {
          if (tab === 'members' && userRole !== 'super_admin' && userRole !== 'admin') return null;
          if (tab === 'telegram' && userRole === 'contributor') return null;
          
          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-[#F7D117]/10 text-[#F7D117] border border-[#F7D117]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}>
              {tab === 'telegram' ? 'Telegram Groups' : tab === 'members' ? 'Team Members' : tab}
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button onClick={() => setIsProfileModalOpen(true)} className="w-10 h-10 shrink-0 rounded-full bg-[#F7D117] flex items-center justify-center text-black font-bold overflow-hidden border border-gray-600 hover:scale-105 transition-transform">
              {profileImage ? (
                <img src={profileImage} className="w-full h-full object-cover" style={{ transform: `scale(${zoomLevel}) translate(${imgPosition.x}px, ${imgPosition.y}px)` }} />
              ) : (
                session?.user?.email?.charAt(0).toUpperCase()
              )}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
              <p className="text-xs text-[#F7D117] capitalize">{userRole}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2" title="Logout">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>
    </>
  );

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#F7D117] font-bold text-xl">Loading Texan System...</div>;

  if (isSettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
        <div className="w-full max-w-md p-8 bg-[#111111] rounded-2xl border border-gray-800 shadow-2xl relative z-10">
          <h1 className="text-3xl font-bold tracking-wider text-white text-center mb-2">Texan<span className="text-[#F7D117]">.</span></h1>
          <p className="text-center text-gray-400 mb-6 text-sm">Set your new password to continue.</p>
          <form className="space-y-4" onSubmit={handleSetPassword}>
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} />
            </div>
            <button type="submit" className="w-full py-3 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Save Password & Login</button>
          </form>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
        <div className="w-full max-w-md p-8 bg-[#111111] rounded-2xl border border-gray-800 shadow-2xl relative z-10">
          <h1 className="text-3xl font-bold tracking-wider text-white text-center mb-8">Texan<span className="text-[#F7D117]">.</span></h1>
          
          {errorMsg && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg text-center">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-500/10 text-green-400 text-sm rounded-lg text-center">{successMsg}</div>}

          {isForgotPassword ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <p className="text-sm text-gray-400 text-center mb-4">Enter your email to receive a password reset link.</p>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required />
              </div>
              <button type="submit" className="w-full py-3 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Send Reset Link</button>
              <p className="text-center mt-4">
                <button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm text-gray-400 hover:text-white">Back to Login</button>
              </p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required />
              </div>
              <button type="submit" className="w-full py-3 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Sign In</button>
              <p className="text-center mt-4">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-gray-400 hover:text-white hover:underline">Forgot Password?</button>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] overflow-hidden">
      
      {selectedImg && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} alt="Full Screen" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <aside className="relative w-64 bg-[#111111] h-full flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex-col hidden lg:flex shrink-0">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden">
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0a] shrink-0 gap-3 md:gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <div className="relative flex-1 w-full">
            <div className="relative">
              <input 
                type="text" placeholder="Search devices by name or IP..." value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-gray-800 rounded-lg focus:outline-none focus:border-[#F7D117] text-sm text-white" 
              />
              <svg className="w-5 h-5 text-gray-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            {showSuggestions && searchQuery.length > 0 && filteredDevices.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-[#111111] border border-gray-800 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                {filteredDevices.map(device => (
                  <div key={device.id} onClick={() => { setSearchQuery(device.device_name); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-[#1a1a1a] cursor-pointer flex justify-between items-center border-b border-gray-800 last:border-0">
                    <span className="text-white font-medium text-sm">{device.device_name}</span>
                    <span className="text-xs text-gray-500 font-mono">{device.ip_address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button onClick={() => setIsProfileModalOpen(true)} className="w-10 h-10 shrink-0 rounded-full bg-[#F7D117] flex items-center justify-center text-black font-bold overflow-hidden border border-gray-600">
            {profileImage ? <img src={profileImage} className="w-full h-full object-cover" style={{ transform: `scale(${zoomLevel}) translate(${imgPosition.x}px, ${imgPosition.y}px)` }} /> : session.user.email?.charAt(0).toUpperCase()}
          </button>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto flex-1">
          
          {(activeTab === 'dashboard' || activeTab === 'devices') && (
            <>
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">{activeTab === 'dashboard' ? 'Live Devices Overview' : 'All Devices'}</h2>
                
                <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                  <div className="flex bg-[#111111] border border-gray-800 rounded-lg p-1 shrink-0">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#222] text-[#F7D117]' : 'text-gray-500 hover:text-white'}`}>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-[#222] text-[#F7D117]' : 'text-gray-500 hover:text-white'}`}>
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </button>
                  </div>
                  
                  <div className="flex bg-[#111111] border border-gray-800 rounded-lg p-1 shrink-0">
                    {['all', 'online', 'offline'].map((f) => (
                      <button key={f} onClick={() => setFilter(f as any)} className={`px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm rounded-md capitalize transition-colors ${filter === f ? 'bg-[#222] text-white' : 'text-gray-400 hover:text-white'}`}>{f}</button>
                    ))}
                  </div>
                  
                  {(userRole === 'super_admin' || userRole === 'admin') && (
                    <button onClick={() => setIsAddDeviceModalOpen(true)} className="flex items-center justify-center px-3 py-2 md:px-4 bg-[#F7D117] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shrink-0 ml-auto xl:ml-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      <span className="hidden md:inline ml-1 text-sm">Add Device</span>
                    </button>
                  )}
                </div>
              </div>

              {filteredDevices.length === 0 ? (
                <div className="text-center py-20 text-gray-500">No devices found.</div>
              ) : viewMode === 'card' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredDevices.map((device) => (
                    <div key={device.id} className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden group hover:border-[#F7D117]/50 transition-all flex flex-col">
                      <div className="relative h-48 bg-gray-900 flex items-center justify-center shrink-0">
                        {device.screenshots && device.screenshots.length > 0 ? (
                          <img 
                            src={device.screenshots[0]} 
                            alt="Latest Screenshot" 
                            className="w-full h-full object-cover relative z-10 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" 
                            onClick={() => setSelectedImg(device.screenshots[0])}
                          />
                        ) : (
                          <span className="text-gray-600">No Screenshot Yet</span>
                        )}
                        <div className="absolute top-3 right-3 z-20 flex items-center space-x-1 bg-black/60 px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                          <div className={`w-2 h-2 rounded-full ${isDeviceOnline(device.last_heartbeat) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className="text-xs font-medium text-white">{isDeviceOnline(device.last_heartbeat) ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div className="flex justify-between items-start mb-4">
                          <div className="min-w-0 pr-2">
                            <h3 className="text-lg font-bold text-white truncate">{device.device_name}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-1 truncate">IP: {device.ip_address || 'Not set'}</p>
                            <p className="text-xs text-gray-400 mt-1">Interval: {device.interval_minutes}m</p>
                          </div>
                          <label className={`relative inline-flex items-center shrink-0 ${userRole === 'super_admin' || userRole === 'admin' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                            <input 
                              type="checkbox" 
                              checked={device.is_active} 
                              onChange={() => handleToggleActive(device.id, device.is_active)} 
                              disabled={userRole !== 'super_admin' && userRole !== 'admin'}
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7D117]"></div>
                          </label>
                        </div>
                        <div className="flex space-x-2 mt-4 w-full">
                          <div className="w-1/3 h-12 bg-gray-800 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => device.screenshots?.[1] && setSelectedImg(device.screenshots[1])}>
                            {device.screenshots?.[1] && <img src={device.screenshots[1]} className="w-full h-full object-cover" alt="prev1" />}
                          </div>
                          <div className="w-1/3 h-12 bg-gray-800 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => device.screenshots?.[2] && setSelectedImg(device.screenshots[2])}>
                            {device.screenshots?.[2] && <img src={device.screenshots[2]} className="w-full h-full object-cover" alt="prev2" />}
                          </div>
                          <button onClick={() => openEditModal(device)} className="w-1/3 h-12 bg-[#F7D117]/10 rounded-md flex items-center justify-center border border-[#F7D117]/20 hover:bg-[#F7D117]/20 transition-colors">
                            <span className="text-xs text-[#F7D117]">Config</span>
                          </button>
                        </div>
                        {(userRole === 'super_admin' || userRole === 'admin') && (
                          <button onClick={() => handleDeleteDevice(device.id)} className="w-full mt-3 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">
                            Remove Device
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                   {filteredDevices.map((device) => (
                    <div key={device.id} className="bg-[#111111] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#F7D117]/50 transition-all">
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-24 h-16 md:w-32 md:h-20 bg-gray-900 rounded-lg flex items-center justify-center text-xs text-gray-600 overflow-hidden cursor-pointer shrink-0" onClick={() => device.screenshots?.[0] && setSelectedImg(device.screenshots[0])}>
                          {device.screenshots?.[0] ? <img src={device.screenshots[0]} className="w-full h-full object-cover" alt="Latest" /> : 'No Image'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{device.device_name}</h3>
                          <p className="text-xs text-gray-500 font-mono mt-1 truncate">IP: {device.ip_address || 'Not set'}</p>
                          <div className="flex items-center space-x-1 mt-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isDeviceOnline(device.last_heartbeat) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-400">{isDeviceOnline(device.last_heartbeat) ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <label className={`relative inline-flex items-center shrink-0 ${userRole === 'super_admin' || userRole === 'admin' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                          <input 
                            type="checkbox" 
                            checked={device.is_active} 
                            onChange={() => handleToggleActive(device.id, device.is_active)} 
                            disabled={userRole !== 'super_admin' && userRole !== 'admin'}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7D117]"></div>
                        </label>
                        <button onClick={() => openEditModal(device)} className="px-4 py-2 bg-[#F7D117]/10 text-[#F7D117] text-sm rounded-lg hover:bg-[#F7D117]/20 border border-[#F7D117]/20 whitespace-nowrap">Config</button>
                        {(userRole === 'super_admin' || userRole === 'admin') && (
                          <button onClick={() => handleDeleteDevice(device.id)} className="px-4 py-2 bg-red-500/10 text-red-500 text-sm font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap">Remove</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'telegram' && (
             <div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                 <h2 className="text-2xl font-semibold">Telegram Groups</h2>
                 <button onClick={handleAddGroupClick} className="px-4 py-2 bg-[#F7D117] text-black text-sm font-bold rounded-lg hover:bg-yellow-500 shrink-0 w-full sm:w-auto">+ Add Group</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {visibleGroups.map((group) => (
                   <div key={group.id} className="bg-[#111111] p-6 rounded-2xl border border-gray-800 flex flex-col sm:flex-row justify-between items-start gap-4">
                     <div className="min-w-0 w-full">
                       <h3 className="text-lg font-bold text-white mb-1 truncate">{group.group_name}</h3>
                       <p className="text-xs text-gray-500 font-mono truncate">Chat ID: {group.chat_id}</p>
                     </div>
                     <div className="flex space-x-2 shrink-0 self-end sm:self-start">
                       <button onClick={() => openEditGroupModal(group)} className="text-xs text-[#F7D117] bg-[#F7D117]/10 px-3 py-1 rounded-full border border-[#F7D117]/20 hover:bg-[#F7D117]/20 transition-colors">Edit</button>
                       {(userRole === 'super_admin' || userRole === 'admin') && (
                         <button onClick={() => handleRemoveGroup(group.id)} className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors">Remove</button>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h2 className="text-2xl font-semibold">Team Members</h2>
                {(userRole === 'super_admin' || userRole === 'admin') && (
                  <button onClick={() => setIsInviteModalOpen(true)} className="px-4 py-2 bg-[#F7D117] text-black text-sm font-bold rounded-lg hover:bg-yellow-500 shrink-0 w-full sm:w-auto">+ Invite Member</button>
                )}
              </div>

              <div className="hidden md:block bg-[#111111] border border-gray-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-[#1a1a1a] text-gray-400 text-sm border-b border-gray-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Email</th>
                      <th className="px-6 py-4 font-medium">Role</th>
                      {userRole === 'super_admin' && <th className="px-6 py-4 font-medium text-right">Actions (Admin)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {visibleMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                        <td className="px-6 py-4 text-gray-300 font-mono text-sm whitespace-nowrap">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            member.role === 'super_admin' ? 'bg-[#F7D117]/20 text-[#F7D117]' : 
                            member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>{member.role}</span>
                        </td>
                        {userRole === 'super_admin' && (
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {member.id !== session.user.id ? (
                              <div className="flex items-center justify-end space-x-2">
                                <select value={member.role} onChange={(e) => handleRoleChange(member.id, e.target.value)} className="bg-[#0a0a0a] border border-gray-700 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:border-[#F7D117]">
                                  <option value="admin">Admin</option>
                                  <option value="editor">Editor</option>
                                  <option value="contributor">Contributor</option>
                                </select>
                                <button onClick={() => handleDeleteMember(member.id)} className="px-2 py-1 bg-red-500/10 text-red-500 text-xs rounded border border-red-500/20 hover:bg-red-500/20">Delete</button>
                              </div>
                            ) : <span className="text-xs text-gray-500 italic">That's You</span>}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden flex flex-col gap-4">
                {visibleMembers.map((member) => (
                  <div key={member.id} className="bg-[#111111] border border-gray-800 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-300 font-mono text-sm break-all">{member.email}</span>
                      <span className={`shrink-0 ml-2 px-2 py-1 rounded text-[10px] font-bold ${
                        member.role === 'super_admin' ? 'bg-[#F7D117]/20 text-[#F7D117]' : 
                        member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{member.role}</span>
                    </div>
                    
                    {userRole === 'super_admin' && member.id !== session.user.id && (
                      <div className="flex items-center justify-end space-x-2 mt-2 pt-3 border-t border-gray-800">
                        <div className="relative">
                          <button 
                            onClick={() => setRoleDropdownOpen(roleDropdownOpen === member.id ? null : member.id)}
                            className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white hover:border-[#F7D117] transition-colors"
                          >
                            <span className="capitalize">{member.role}</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </button>
                          
                          {roleDropdownOpen === member.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(null)}></div>
                              <div className="absolute right-0 mt-1 w-32 bg-[#111111] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                                {['admin', 'editor', 'contributor'].map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => {
                                      handleRoleChange(member.id, role);
                                      setRoleDropdownOpen(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 text-xs capitalize hover:bg-[#1a1a1a] transition-colors ${member.role === role ? 'text-[#F7D117] font-bold' : 'text-gray-300'}`}
                                  >
                                    {role}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        <button 
                          onClick={() => handleDeleteMember(member.id)} 
                          className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-lg"
                          title="Delete Member"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 🌟 Profile Modal with Password Change & Image Panning */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-center text-white">Account Settings</h3>
            
            {/* 1. Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div 
                className="w-32 h-32 bg-gray-800 rounded-full mb-4 border-2 border-gray-600 overflow-hidden cursor-move flex items-center justify-center relative group"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => !isDragging && fileInputRef.current?.click()}
              >
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover select-none pointer-events-none" 
                    style={{ transform: `scale(${zoomLevel}) translate(${imgPosition.x}px, ${imgPosition.y}px)` }} 
                  />
                ) : (
                  <span className="text-xs text-gray-400 pointer-events-none">Click to Upload</span>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              
              {profileImage && (
                <div className="w-full mb-4">
                  <label className="text-xs text-gray-400 mb-2 flex justify-between">
                    <span>Zoom</span>
                    <span>Drag image to adjust position</span>
                  </label>
                  <input type="range" min="1" max="3" step="0.1" value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))} className="w-full accent-[#F7D117]" />
                </div>
              )}
              
              <button onClick={saveProfileImage} className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">Save Profile Picture</button>
            </div>

            <hr className="border-gray-800 mb-8" />

            {/* 2. Change Password Section */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
              {passMsg && <div className={`p-3 mb-4 text-sm rounded-lg ${passMsg.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{passMsg}</div>}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                  <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                  <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} />
                </div>
                <button type="submit" className="w-full py-2 bg-[#222] border border-gray-700 text-white font-bold rounded-lg hover:bg-[#333] transition-colors">Update Password</button>
              </form>
            </div>

          </div>
        </div>
      )}

      {isEditModalOpen && selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-lg relative my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pr-6 gap-2">
              <h3 className="text-xl font-bold text-[#F7D117] whitespace-nowrap">Device Configuration</h3>
              <span className="text-xs bg-[#222] px-2 py-1 rounded text-gray-400">Role: {userRole}</span>
            </div>

            <form onSubmit={handleEditDevice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                    <span>Device Name</span>
                    {userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}
                  </label>
                  <input type="text" required value={editDeviceName} onChange={(e) => setEditDeviceName(e.target.value)} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#1a1a1a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                    <span>IP Address</span>
                    {userRole !== 'super_admin' && <span className="text-xs text-red-400">(Locked)</span>}
                  </label>
                  <input type="text" value={editDeviceIp} onChange={(e) => setEditDeviceIp(e.target.value)} disabled={userRole !== 'super_admin'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'super_admin' ? 'bg-[#0a0a0a] border-gray-800 text-white' : 'bg-[#1a1a1a] border-gray-700 text-gray-500'}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                    <span>Interval (Minutes)</span>
                    {userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}
                  </label>
                  <input type="number" min="1" required value={editInterval} onChange={(e) => setEditInterval(Number(e.target.value))} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#1a1a1a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telegram Groups</label>
                  
                  {userRole === 'super_admin' || userRole === 'admin' ? (
                    <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-lg max-h-40 overflow-y-auto space-y-3">
                      <p className="text-xs text-gray-500 mb-2">Select multiple groups:</p>
                      {visibleGroups.map(g => (
                        <label key={g.id} className="flex items-center space-x-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={editGroupIds.includes(g.id)}
                            onChange={() => handleGroupCheckboxChange(g.id)}
                            className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded"
                          />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{g.group_name}</span>
                        </label>
                      ))}
                      {visibleGroups.length === 0 && <p className="text-xs text-gray-500">No groups available.</p>}
                    </div>
                  ) : (
                    <select 
                      value={editGroupIds[0] || ''} 
                      onChange={(e) => setEditGroupIds(e.target.value ? [e.target.value] : [])} 
                      className="relative z-50 w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white"
                    >
                      <option value="">-- Select Group --</option>
                      {visibleGroups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                    </select>
                  )}
                </div>

              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800 mt-4">
                <div className="col-span-2 text-sm text-[#F7D117] font-semibold mb-1 flex justify-between">
                  <span>Break Time</span>
                  {userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Start</label>
                  <input type="time" value={editBreakStart} onChange={(e) => setEditBreakStart(e.target.value)} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#0a0a0a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">End</label>
                  <input type="time" value={editBreakEnd} onChange={(e) => setEditBreakEnd(e.target.value)} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#0a0a0a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Save Configuration</button>
            </form>
          </div>
        </div>
      )}

      {isAddDeviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddDeviceModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Add New Device</h3>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Device Name</label>
                <input type="text" required value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. PC-01" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">IP Address</label>
                <input type="text" value={newDeviceIp} onChange={(e) => setNewDeviceIp(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. 192.168.1.10" />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">MAC Address (Optional)</label>
                <input type="text" value={newDeviceMac} onChange={(e) => setNewDeviceMac(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. 123456789" />
                <p className="text-[10px] text-gray-500 mt-1">If you want to link this with an installed agent, enter its MAC address here.</p>
              </div>

              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Save Device</button>
            </form>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Invite New Member</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" />
              </div>
              
              {userRole === 'super_admin' ? (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Assign Role</label>
                  <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white">
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="contributor">Contributor</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-[#1a1a1a] border border-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400">Role will be assigned as <span className="text-[#F7D117] font-bold">Admin</span>.</p>
                </div>
              )}

              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Send Invitation</button>
            </form>
          </div>
        </div>
      )}

      {isAddGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddGroupModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Add Telegram Group</h3>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Group Name</label>
                <input type="text" required value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Chat ID</label>
                <input type="text" required value={newGroupChatId} onChange={(e) => setNewGroupChatId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Save Group</button>
            </form>
          </div>
        </div>
      )}

      {isEditGroupModalOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsEditGroupModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Edit Telegram Group</h3>
            <form onSubmit={handleEditGroup} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Group Name</label>
                <input type="text" required value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Chat ID</label>
                <input type="text" required value={editGroupChatId} onChange={(e) => setEditGroupChatId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4 hover:bg-yellow-500">Save Changes</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}