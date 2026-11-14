"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from './lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#F7D117', '#4ade80', '#60a5fa', '#f87171', '#c084fc', '#fb923c'];

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
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
  
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<string | null>(null);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const [devices, setDevices] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [blockedSites, setBlockedSites] = useState<any[]>([]);
  const [blockedApps, setBlockedApps] = useState<any[]>([]); 
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState<any[]>([]); 

  const [ipRules, setIpRules] = useState<any[]>([]);
  const [ipFilterEnabled, setIpFilterEnabled] = useState(false);
  const [myIp, setMyIp] = useState<string>('Checking...');
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [newIp, setNewIp] = useState('');
  const [newIpType, setNewIpType] = useState<'whitelist' | 'blacklist'>('blacklist');

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddDeviceModalOpen, setIsAddDeviceModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [isAddAppBlockModalOpen, setIsAddAppBlockModalOpen] = useState(false); 
  
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
  const [editIdleLimit, setEditIdleLimit] = useState(5);
  const [editBreakStart, setEditBreakStart] = useState('');
  const [editBreakEnd, setEditBreakEnd] = useState('');
  const [editGroupIds, setEditGroupIds] = useState<string[]>([]);
  
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupChatId, setNewGroupChatId] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('admin'); 

  const [blockSiteName, setBlockSiteName] = useState('');
  const [blockSiteUrl, setBlockSiteUrl] = useState('');
  const [blockDeviceId, setBlockDeviceId] = useState('');
  const [applyToAllSites, setApplyToAllSites] = useState(false); // 🌟 নতুন

  const [blockAppName, setBlockAppName] = useState('');
  const [blockAppProcess, setBlockAppProcess] = useState('');
  const [blockAppDeviceId, setBlockAppDeviceId] = useState('');
  const [applyToAllApps, setApplyToAllApps] = useState(false); // 🌟 নতুন

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imgPosition, setImgPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setMyIp(data.ip))
      .catch(() => setMyIp('Unknown'));

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

    const devicesSub = supabase.channel('public:devices').on('postgres_changes', { event: '*', schema: 'public', table: 'devices' }, () => { fetchData(); }).subscribe();
    const groupsSub = supabase.channel('public:telegram_groups').on('postgres_changes', { event: '*', schema: 'public', table: 'telegram_groups' }, () => { fetchData(); }).subscribe();
    const profilesSub = supabase.channel('public:profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => { fetchUserRole(session.user.id); fetchData(); }).subscribe();
    const blocksSub = supabase.channel('public:blocked_sites').on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_sites' }, () => { fetchData(); }).subscribe();
    const appBlocksSub = supabase.channel('public:blocked_apps').on('postgres_changes', { event: '*', schema: 'public', table: 'blocked_apps' }, () => { fetchData(); }).subscribe(); 
    const logsSub = supabase.channel('public:audit_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, () => { fetchData(); }).subscribe();
    const ipSub = supabase.channel('public:ip_rules').on('postgres_changes', { event: '*', schema: 'public', table: 'ip_rules' }, () => { fetchData(); }).subscribe();
    const settingsSub = supabase.channel('public:global_settings').on('postgres_changes', { event: '*', schema: 'public', table: 'global_settings' }, () => { fetchData(); }).subscribe();
    const ssLogsSub = supabase.channel('public:device_screenshot_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'device_screenshot_logs' }, () => { fetchData(); }).subscribe();
    const uptimeSub = supabase.channel('public:device_uptime_logs').on('postgres_changes', { event: '*', schema: 'public', table: 'device_uptime_logs' }, () => { fetchData(); }).subscribe();

    return () => {
      supabase.removeChannel(devicesSub);
      supabase.removeChannel(groupsSub);
      supabase.removeChannel(profilesSub);
      supabase.removeChannel(blocksSub);
      supabase.removeChannel(appBlocksSub);
      supabase.removeChannel(logsSub);
      supabase.removeChannel(ipSub);
      supabase.removeChannel(settingsSub);
      supabase.removeChannel(ssLogsSub);
      supabase.removeChannel(uptimeSub);
    };
  }, [session]);

  useEffect(() => {
    if (!session || myIp === 'Checking...' || myIp === 'Unknown') return;
    
    if (userRole === 'super_admin') {
      setIsAccessDenied(false);
      return;
    }

    if (ipFilterEnabled) {
      const whitelist = ipRules.filter(r => r.type === 'whitelist').map(r => r.ip_address);
      const blacklist = ipRules.filter(r => r.type === 'blacklist').map(r => r.ip_address);

      if (blacklist.includes(myIp)) {
        setIsAccessDenied(true);
      } else if (whitelist.length > 0 && !whitelist.includes(myIp)) {
        setIsAccessDenied(true);
      } else {
        setIsAccessDenied(false);
      }
    } else {
      setIsAccessDenied(false);
    }
  }, [ipFilterEnabled, ipRules, myIp, userRole, session]);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (data) setUserRole(data.role);
    else if (error && error.code === 'PGRST116') await handleLogout();
  };

  const fetchData = async () => {
    const { data: devicesData } = await supabase.from('devices').select('*').order('created_at', { ascending: true });
    const { data: groupsData } = await supabase.from('telegram_groups').select('*');
    const { data: membersData } = await supabase.from('profiles').select('*');
    const { data: blocksData } = await supabase.from('blocked_sites').select('*').order('created_at', { ascending: false });
    const { data: appBlocksData } = await supabase.from('blocked_apps').select('*').order('created_at', { ascending: false });
    const { data: logsData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    const { data: rulesData } = await supabase.from('ip_rules').select('*').order('created_at', { ascending: false });
    const { data: settingsData } = await supabase.from('global_settings').select('*').eq('id', 1).single();
    
    if (devicesData) setDevices(devicesData);
    if (groupsData) setGroups(groupsData);
    if (membersData) setMembers(membersData);
    if (blocksData) setBlockedSites(blocksData);
    if (appBlocksData) setBlockedApps(appBlocksData); 
    if (logsData) setAuditLogs(logsData);
    if (rulesData) setIpRules(rulesData);
    if (settingsData) setIpFilterEnabled(settingsData.ip_filter_enabled);
    
    const { data: screenshotLogs } = await supabase.from('device_screenshot_logs').select('*');
    if (screenshotLogs && devicesData) {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }).reverse();

      const processedData = last7Days.map(dateStr => {
        const dObj = new Date(dateStr);
        const dayName = dObj.toLocaleDateString('en-US', { weekday: 'short' });
        const dayData: any = { date: dayName };
        
        devicesData.forEach(device => {
          const count = screenshotLogs.filter((log: any) => {
            if (log.device_id !== device.id) return false;
            const logDate = new Date(log.created_at);
            const logDateStr = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}-${String(logDate.getDate()).padStart(2, '0')}`;
            return logDateStr === dateStr;
          }).length;
          dayData[device.device_name] = count; 
        });
        return dayData;
      });
      setChartData(processedData);
    }

    const { data: uptimeLogs } = await supabase.from('device_uptime_logs').select('*').order('log_date', { ascending: false }).limit(100);
    if (uptimeLogs && devicesData) {
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      });

      const processedUptime = devicesData.map(device => {
        let totalMins = 0;
        uptimeLogs.forEach(log => {
          if (log.device_id === device.id && last7Days.includes(log.log_date)) {
            totalMins += log.total_minutes;
          }
        });
        
        const hours = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return {
          device_name: device.device_name,
          display_time: `${hours}h ${mins}m`,
          total_minutes: totalMins
        };
      });
      setUptimeData(processedUptime);
    }
  };

  const addLog = async (action: string, details: string) => {
    if (!session?.user?.email) return;
    await supabase.from('audit_logs').insert([{ user_email: session.user.email, action: action, details: details }]);
  };

  const handleSelectLog = (id: string) => { setSelectedLogs(prev => prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]); };
  const handleSelectAllLogs = () => { if (selectedLogs.length === auditLogs.length) setSelectedLogs([]); else setSelectedLogs(auditLogs.map(log => log.id)); };

  const handleDeleteLogs = async () => {
    if (selectedLogs.length === 0) return alert("No logs selected.");
    if (confirm(`Are you sure you want to delete ${selectedLogs.length} log(s)?`)) {
      const { error } = await supabase.from('audit_logs').delete().in('id', selectedLogs);
      if (error) alert("Error deleting logs: " + error.message);
      else { setSelectedLogs([]); fetchData(); }
    }
  };

  const handleExportLogs = () => {
    if (auditLogs.length === 0) return alert("No logs to export.");
    const headers = ["Date & Time", "User", "Action", "Details"];
    const csvRows = [headers.join(",")];
    auditLogs.forEach(log => {
      const date = `"${new Date(log.created_at).toLocaleString()}"`;
      const user = `"${log.user_email}"`;
      const action = `"${log.action}"`;
      const details = `"${log.details}"`;
      csvRows.push([date, user, action, details].join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `Texan_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const toggleIpFilter = async () => {
    const newState = !ipFilterEnabled;
    await supabase.from('global_settings').update({ ip_filter_enabled: newState }).eq('id', 1);
    await addLog("IP Filter Toggled", `Turned IP Filter ${newState ? 'ON' : 'OFF'}`);
    fetchData();
  };

  const handleAddIpRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp) return;
    
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(newIp)) return alert("Please enter a valid IPv4 address (e.g. 192.168.1.1)");

    const { error } = await supabase.from('ip_rules').insert([{ ip_address: newIp, type: newIpType }]);
    if (error) alert("Error: " + error.message);
    else {
      await addLog("IP Rule Added", `Added ${newIp} to ${newIpType}`);
      setNewIp('');
      fetchData();
    }
  };

  const handleRemoveIpRule = async (id: string, ip: string) => {
    if (confirm(`Remove ${ip} from the list?`)) {
      await supabase.from('ip_rules').delete().eq('id', id);
      await addLog("IP Rule Removed", `Removed ${ip} from rules`);
      fetchData();
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setErrorMsg(error.message);
    else {
      const { data } = await supabase.auth.getSession();
      setSession(data.session); fetchData(); fetchUserRole(data.session?.user.id as string);
      setProfileImage(data.session?.user.user_metadata?.avatar_url || null);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(''); setSuccessMsg('');
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/?type=recovery` });
    if (error) setErrorMsg(error.message);
    else { setSuccessMsg("Password reset link sent!"); setTimeout(() => setIsForgotPassword(false), 3000); }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) alert(error.message);
    else {
      alert("Password set successfully!"); setIsSettingPassword(false);
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPassMsg('');
    if (newPass !== confirmPass) return setPassMsg("New passwords do not match!");
    if (newPass.length < 6) return setPassMsg("Must be at least 6 characters.");

    const { error: signInError } = await supabase.auth.signInWithPassword({ email: session.user.email, password: currentPass });
    if (signInError) return setPassMsg("Incorrect current password.");

    const { error: updateError } = await supabase.auth.updateUser({ password: newPass });
    if (updateError) setPassMsg(updateError.message);
    else { setPassMsg("Password updated successfully!"); setCurrentPass(''); setNewPass(''); setConfirmPass(''); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setSession(null); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImage(reader.result as string); setImgPosition({ x: 0, y: 0 }); setZoomLevel(1); };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart({ x: e.clientX - imgPosition.x, y: e.clientY - imgPosition.y }); };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging) return; setImgPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const handleMouseUp = () => setIsDragging(false);

  const saveProfileImage = async () => {
    if (!profileImage || !profileImage.startsWith('data:image')) return;
    try {
      const res = await fetch(profileImage); const blob = await res.blob();
      const fileExt = blob.type.split('/')[1] || 'png';
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', session.user.id);
      alert("Profile updated!"); setIsProfileModalOpen(false);
    } catch (error: any) { alert("Error: " + error.message); }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (userRole !== 'super_admin') return alert("Only Admin can change roles.");
    const memberEmail = members.find(m => m.id === memberId)?.email || 'Unknown';
    await supabase.from('profiles').update({ role: newRole }).eq('id', memberId);
    await addLog("Role Changed", `Changed role of ${memberEmail} to ${newRole}`);
    fetchData();
  };

  const handleDeleteMember = async (memberId: string) => {
    if (userRole !== 'super_admin') return alert("Only Admin can delete members.");
    if(confirm("Delete this member permanently?")) {
      try {
        const memberEmail = members.find(m => m.id === memberId)?.email || 'Unknown';
        await fetch('/api/delete-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: memberId }) });
        await addLog("Member Deleted", `Deleted member: ${memberEmail}`);
        fetchData(); 
      } catch (err) { alert("Network error."); }
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalRole = userRole === 'admin' ? 'admin' : inviteRole;
      const { error } = await supabase.auth.signUp({
        email: inviteEmail, password: 'TexanTempPass!123',
        options: { data: { role: finalRole, invited_by: session.user.id }, emailRedirectTo: `${window.location.origin}/?invite=true` }
      });
      if (error) throw error;
      await addLog("Member Invited", `Invited ${inviteEmail} as ${finalRole}`);
      alert(`Invitation sent!`); setIsInviteModalOpen(false); setInviteEmail('');
    } catch (error: any) { alert("Error: " + error.message); }
  };

  const openEditModal = (device: any) => {
    if (userRole === 'contributor') return alert("Access Denied.");
    setSelectedDevice(device); setEditDeviceName(device.device_name || ''); setEditDeviceIp(device.ip_address || '');
    setEditInterval(device.interval_minutes || 4); setEditIdleLimit(device.idle_limit ?? 5);
    setEditBreakStart(device.break_start || ''); setEditBreakEnd(device.break_end || '');
    let currentGroups = device.telegram_group_ids || [];
    if (currentGroups.length === 0 && device.telegram_group_id) currentGroups = [device.telegram_group_id];
    setEditGroupIds(currentGroups); setIsEditModalOpen(true);
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      interval_minutes: editInterval, idle_limit: editIdleLimit, break_start: editBreakStart || null, break_end: editBreakEnd || null,
      telegram_group_ids: editGroupIds, telegram_group_id: editGroupIds[0] || null, 
    };
    if (userRole === 'super_admin' || userRole === 'admin') { updateData.device_name = editDeviceName; updateData.ip_address = editDeviceIp; }
    await supabase.from('devices').update(updateData).eq('id', selectedDevice.id);
    await addLog("Device Updated", `Updated config for device: ${editDeviceName}`);
    setIsEditModalOpen(false); fetchData();
  };

  const handleDeleteDevice = async (id: string) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') return alert("Access Denied.");
    if(confirm("Delete this device permanently?")) { 
      const deviceName = devices.find(d => d.id === id)?.device_name || 'Unknown';
      await supabase.from('devices').delete().eq('id', id); 
      await addLog("Device Deleted", `Deleted device: ${deviceName}`); fetchData(); 
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') return alert("Access Denied.");
    setDevices(devices.map(d => d.id === id ? { ...d, is_active: !currentStatus } : d));
    await supabase.from('devices').update({ is_active: !currentStatus }).eq('id', id);
    const deviceName = devices.find(d => d.id === id)?.device_name || 'Unknown';
    await addLog("Device Toggled", `Turned ${!currentStatus ? 'ON' : 'OFF'} device: ${deviceName}`);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    const mac = newDeviceMac.trim() === '' ? null : newDeviceMac.trim();
    await supabase.from('devices').insert([{ device_name: newDeviceName, ip_address: newDeviceIp, mac_address: mac, is_active: true, interval_minutes: 4 }]);
    await addLog("Device Added", `Added new device: ${newDeviceName}`);
    setIsAddDeviceModalOpen(false); setNewDeviceName(''); setNewDeviceIp(''); setNewDeviceMac(''); fetchData();
  };

  // 🌟 নতুন: Global Site Blocker লজিক
  const handleAddBlockedSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyToAllSites && !blockDeviceId) return alert("Please select a device or apply to all.");
    const cleanUrl = blockSiteUrl.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    const targetDevice = applyToAllSites ? 'ALL DEVICES' : devices.find(d => d.id === blockDeviceId)?.device_name || 'Unknown';
    const finalDeviceId = applyToAllSites ? null : blockDeviceId;

    const { error } = await supabase.from('blocked_sites').insert([{ site_name: blockSiteName, site_url: cleanUrl, device_id: finalDeviceId }]);
    if (error) alert("Error: " + error.message);
    else {
      await addLog("Site Blocked", `Blocked ${cleanUrl} on ${targetDevice}`);
      setIsAddBlockModalOpen(false); setBlockSiteName(''); setBlockSiteUrl(''); setBlockDeviceId(''); setApplyToAllSites(false); fetchData();
    }
  };

  const handleRemoveBlockedSite = async (id: string) => {
    if(confirm("Are you sure you want to unblock this site?")) {
      const site = blockedSites.find(s => s.id === id);
      await supabase.from('blocked_sites').delete().eq('id', id);
      await addLog("Site Unblocked", `Unblocked ${site?.site_url}`); fetchData();
    }
  };

  // 🌟 নতুন: Global App Blocker লজিক
  const handleAddBlockedApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyToAllApps && !blockAppDeviceId) return alert("Please select a device or apply to all.");
    const processName = blockAppProcess.toLowerCase().endsWith('.exe') ? blockAppProcess.toLowerCase() : `${blockAppProcess.toLowerCase()}.exe`;
    const targetDevice = applyToAllApps ? 'ALL DEVICES' : devices.find(d => d.id === blockAppDeviceId)?.device_name || 'Unknown';
    const finalDeviceId = applyToAllApps ? null : blockAppDeviceId;

    const { error } = await supabase.from('blocked_apps').insert([{ app_name: blockAppName, process_name: processName, device_id: finalDeviceId }]);
    if (error) alert("Error: " + error.message);
    else {
      await addLog("App Blocked", `Blocked ${processName} on ${targetDevice}`);
      setIsAddAppBlockModalOpen(false); setBlockAppName(''); setBlockAppProcess(''); setBlockAppDeviceId(''); setApplyToAllApps(false); fetchData();
    }
  };

  const handleRemoveBlockedApp = async (id: string) => {
    if(confirm("Are you sure you want to unblock this app?")) {
      const app = blockedApps.find(a => a.id === id);
      await supabase.from('blocked_apps').delete().eq('id', id);
      await addLog("App Unblocked", `Unblocked ${app?.process_name}`); fetchData();
    }
  };

  const handleAddGroupClick = () => {
    if (userRole === 'editor' || userRole === 'contributor') return alert("Access Denied.");
    setIsAddGroupModalOpen(true);
  };

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('telegram_groups').insert([{ group_name: newGroupName, chat_id: newGroupChatId, created_by: session.user.id }]);
    await addLog("Group Added", `Added new Telegram Group: ${newGroupName}`);
    setIsAddGroupModalOpen(false); setNewGroupName(''); setNewGroupChatId(''); fetchData();
  };

  const openEditGroupModal = (group: any) => { setSelectedGroup(group); setEditGroupName(group.group_name); setEditGroupChatId(group.chat_id); setIsEditGroupModalOpen(true); };
  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('telegram_groups').update({ group_name: editGroupName, chat_id: editGroupChatId }).eq('id', selectedGroup.id);
    await addLog("Group Updated", `Updated Telegram Group: ${editGroupName}`);
    setIsEditGroupModalOpen(false); fetchData();
  };
  const handleRemoveGroup = async (id: string) => {
    if (userRole !== 'super_admin' && userRole !== 'admin') return alert("Access Denied.");
    if(confirm("Remove this group?")) { 
      const groupName = groups.find(g => g.id === id)?.group_name || 'Unknown';
      await supabase.from('telegram_groups').delete().eq('id', id); 
      await addLog("Group Deleted", `Deleted Telegram Group: ${groupName}`); fetchData(); 
    }
  };
  const handleGroupCheckboxChange = (groupId: string) => { setEditGroupIds(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]); };

  const isDeviceOnline = (lastHeartbeat: string) => {
    if (!lastHeartbeat) return false;
    return ((new Date().getTime() - new Date(lastHeartbeat).getTime()) / 1000 / 60) < 5; 
  };

  const filteredDevices = devices.filter((device) => {
    const matchesSearch = device.device_name.toLowerCase().includes(searchQuery.toLowerCase()) || (device.ip_address && device.ip_address.includes(searchQuery));
    if (filter === 'all') return matchesSearch;
    if (filter === 'online') return matchesSearch && isDeviceOnline(device.last_heartbeat);
    if (filter === 'offline') return matchesSearch && !isDeviceOnline(device.last_heartbeat);
    return matchesSearch;
  });

  const visibleMembers = members.filter(m => {
    if (userRole === 'super_admin') return true; 
    if (userRole === 'admin') return m.invited_by === session.user.id || m.id === session.user.id;
    return m.id === session.user.id; 
  });

  const visibleGroups = groups.filter(g => {
    if (userRole === 'super_admin') return true;
    if (!g.created_by) return true;
    const creator = members.find(m => m.id === g.created_by);
    if (creator && creator.role === 'super_admin') return false;
    if (userRole === 'admin') return g.created_by === session.user.id;
    return true;
  });

  // 🌟 নতুন: সামারি ডাটা ক্যালকুলেশন
  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => isDeviceOnline(d.last_heartbeat)).length;
  const totalBlockedSites = blockedSites.length;
  
  // আজকের স্ক্রিনশট (চার্টের সর্বশেষ ডাটা থেকে)
  let todayScreenshots = 0;
  if (chartData.length > 0) {
    const latestDayData = chartData[chartData.length - 1];
    Object.keys(latestDayData).forEach(key => {
      if (key !== 'date') todayScreenshots += latestDayData[key];
    });
  }

  const SidebarContent = () => (
    <>
      <div className="p-6"><h1 className="text-2xl font-bold tracking-wider text-white">Te<span className="text-[#F7D117]">x</span>an agency</h1></div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {['dashboard', 'devices', 'telegram', 'members', 'blocker', 'audit', 'security'].map((tab) => {
          if (tab === 'members' && userRole !== 'super_admin' && userRole !== 'admin') return null;
          if (tab === 'telegram' && userRole === 'contributor') return null;
          if (['blocker', 'audit', 'security'].includes(tab) && userRole !== 'super_admin') return null;

          return (
            <button key={tab} onClick={() => { setActiveTab(tab); setIsMobileMenuOpen(false); }} className={`w-full text-left flex items-center space-x-3 px-4 py-3 rounded-lg capitalize transition-colors ${activeTab === tab ? 'bg-[#F7D117]/10 text-[#F7D117] border border-[#F7D117]/20' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'}`}>
              {tab === 'telegram' ? 'Telegram Groups' : tab === 'members' ? 'Team Members' : tab === 'blocker' ? 'Site & App Blocker' : tab === 'audit' ? 'Audit Logs' : tab === 'security' ? 'IP Security' : tab}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between bg-[#1a1a1a] p-3 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <button onClick={() => setIsProfileModalOpen(true)} className="w-10 h-10 shrink-0 rounded-full bg-[#F7D117] flex items-center justify-center text-black font-bold overflow-hidden border border-gray-600 hover:scale-105 transition-transform">
              {profileImage ? <img src={profileImage} className="w-full h-full object-cover" style={{ transform: `scale(${zoomLevel}) translate(${imgPosition.x}px, ${imgPosition.y}px)` }} /> : session?.user?.email?.charAt(0).toUpperCase()}
            </button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.email}</p>
              <p className="text-xs text-[#F7D117] capitalize">{userRole}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 transition-colors p-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg></button>
        </div>
      </div>
    </>
  );

  if (loading || myIp === 'Checking...') return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#F7D117] font-bold text-xl">Loading Texan System...</div>;

  if (isAccessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className="bg-[#111111] border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center">
          <svg className="w-20 h-20 text-red-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">Your IP address (<span className="font-mono text-red-400">{myIp}</span>) has been blocked by the administrator.</p>
          <button onClick={handleLogout} className="px-6 py-2 bg-red-500/10 text-red-500 font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20">Logout</button>
        </div>
      </div>
    );
  }

  if (isSettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden p-4">
        <div className="w-full max-w-md p-8 bg-[#111111] rounded-2xl border border-gray-800 shadow-2xl relative z-10">
          <h1 className="text-3xl font-bold tracking-wider text-white text-center mb-2">Te<span className="text-[#F7D117]">x</span>an agency</h1>
          <p className="text-center text-gray-400 mb-6 text-sm">Set your new password to continue.</p>
          <form className="space-y-4" onSubmit={handleSetPassword}>
            <div><label className="block text-sm text-gray-400 mb-1">New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} /></div>
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
          <h1 className="text-3xl font-bold tracking-wider text-white text-center mb-8">Te<span className="text-[#F7D117]">x</span>an agency</h1>
          {errorMsg && <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-sm rounded-lg text-center">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-500/10 text-green-400 text-sm rounded-lg text-center">{successMsg}</div>}
          {isForgotPassword ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <p className="text-sm text-gray-400 text-center mb-4">Enter your email to receive a password reset link.</p>
              <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required /></div>
              <button type="submit" className="w-full py-3 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Send Reset Link</button>
              <p className="text-center mt-4"><button type="button" onClick={() => setIsForgotPassword(false)} className="text-sm text-gray-400 hover:text-white">Back to Login</button></p>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleLogin}>
              <div><label className="block text-sm text-gray-400 mb-1">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required /></div>
              <button type="submit" className="w-full py-3 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Sign In</button>
              <p className="text-center mt-4"><button type="button" onClick={() => setIsForgotPassword(true)} className="text-sm text-gray-400 hover:text-white hover:underline">Forgot Password?</button></p>
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
          <aside className="relative w-64 bg-[#111111] h-full flex flex-col shadow-2xl"><SidebarContent /></aside>
        </div>
      )}

      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex-col hidden lg:flex shrink-0"><SidebarContent /></aside>

      <main className="flex-1 flex flex-col w-full min-w-0 h-screen overflow-hidden">
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-4 md:px-8 bg-[#0a0a0a] shrink-0 gap-3 md:gap-4">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div className="relative flex-1 w-full">
            <div className="relative">
              <input type="text" placeholder="Search devices..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-gray-800 rounded-lg focus:outline-none focus:border-[#F7D117] text-sm text-white" />
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
          
          {activeTab === 'dashboard' && (
            <>
              {/* 🌟 নতুন: Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Devices</p>
                    <h3 className="text-3xl font-bold text-white">{totalDevices}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#F7D117]/10 flex items-center justify-center text-[#F7D117]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Online Now</p>
                    <h3 className="text-3xl font-bold text-green-400">{onlineDevices}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                  </div>
                </div>
                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Blocked Sites</p>
                    <h3 className="text-3xl font-bold text-red-400">{totalBlockedSites}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  </div>
                </div>
                <div className="bg-[#111111] border border-gray-800 rounded-2xl p-6 flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Today's Screenshots</p>
                    <h3 className="text-3xl font-bold text-blue-400">{todayScreenshots}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                </div>
              </div>

              <div className="mb-8 bg-[#111111] border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Weekly Screenshot Activity</h3>
                  <span className="text-xs text-gray-500">Last 7 Days</span>
                </div>
                <div className="h-72 w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height="100%" minWidth={500}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                      <XAxis dataKey="date" stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip 
                        cursor={{ fill: '#F7D117', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: '#1a1a1a', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', color: '#888' }} />
                      {devices.map((device, index) => (
                        <Bar 
                          key={device.id} 
                          dataKey={device.device_name} 
                          stackId="a" 
                          fill={COLORS[index % COLORS.length]} 
                          radius={[0, 0, 0, 0]} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mb-8 bg-[#111111] border border-gray-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Weekly Device Uptime</h3>
                  <span className="text-xs text-gray-500">Last 7 Days</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {uptimeData.map((data, idx) => (
                    <div key={idx} className="bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-gray-200">{data.device_name}</span>
                      </div>
                      <span className="text-sm font-bold text-[#F7D117]">{data.display_time}</span>
                    </div>
                  ))}
                  {uptimeData.length === 0 && <div className="text-gray-500 text-sm col-span-full">No uptime data available yet.</div>}
                </div>
              </div>
            </>
          )}

          {(activeTab === 'dashboard' || activeTab === 'devices') && (
            <>
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">{activeTab === 'dashboard' ? 'Live Devices Overview' : 'All Devices'}</h2>
                <div className="flex items-center gap-2 w-full xl:w-auto mt-2 xl:mt-0">
                  <div className="flex bg-[#111111] border border-gray-800 rounded-lg p-1 shrink-0">
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#222] text-[#F7D117]' : 'text-gray-500 hover:text-white'}`}><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
                    <button onClick={() => setViewMode('card')} className={`p-2 rounded-md transition-colors ${viewMode === 'card' ? 'bg-[#222] text-[#F7D117]' : 'text-gray-500 hover:text-white'}`}><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></button>
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
                          <img src={device.screenshots[0]} alt="Latest Screenshot" className="w-full h-full object-cover relative z-10 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => setSelectedImg(device.screenshots[0])} />
                        ) : (<span className="text-gray-600">No Screenshot Yet</span>)}
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
                            <p className="text-xs text-gray-400 mt-1">Interval: {device.interval_minutes}m | Idle: {device.idle_limit ?? 5}m</p>
                          </div>
                          <label className={`relative inline-flex items-center shrink-0 ${userRole === 'super_admin' || userRole === 'admin' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                            <input type="checkbox" checked={device.is_active} onChange={() => handleToggleActive(device.id, device.is_active)} disabled={userRole !== 'super_admin' && userRole !== 'admin'} className="sr-only peer" />
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
                          <button onClick={() => openEditModal(device)} className="w-1/3 h-12 bg-[#F7D117]/10 rounded-md flex items-center justify-center border border-[#F7D117]/20 hover:bg-[#F7D117]/20 transition-colors"><span className="text-xs text-[#F7D117]">Config</span></button>
                        </div>
                        {(userRole === 'super_admin' || userRole === 'admin') && (
                          <button onClick={() => handleDeleteDevice(device.id)} className="w-full mt-3 py-2 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-colors">Remove Device</button>
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
                          <p className="text-xs text-gray-400 mt-1">Idle: {device.idle_limit ?? 5}m</p>
                          <div className="flex items-center space-x-1 mt-2">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${isDeviceOnline(device.last_heartbeat) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-xs text-gray-400">{isDeviceOnline(device.last_heartbeat) ? 'Online' : 'Offline'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <label className={`relative inline-flex items-center shrink-0 ${userRole === 'super_admin' || userRole === 'admin' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                          <input type="checkbox" checked={device.is_active} onChange={() => handleToggleActive(device.id, device.is_active)} disabled={userRole !== 'super_admin' && userRole !== 'admin'} className="sr-only peer" />
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${member.role === 'super_admin' ? 'bg-[#F7D117]/20 text-[#F7D117]' : member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{member.role}</span>
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
                      <span className={`shrink-0 ml-2 px-2 py-1 rounded text-[10px] font-bold ${member.role === 'super_admin' ? 'bg-[#F7D117]/20 text-[#F7D117]' : member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>{member.role}</span>
                    </div>
                    {userRole === 'super_admin' && member.id !== session.user.id && (
                      <div className="flex items-center justify-end space-x-2 mt-2 pt-3 border-t border-gray-800">
                        <div className="relative">
                          <button onClick={() => setRoleDropdownOpen(roleDropdownOpen === member.id ? null : member.id)} className="flex items-center space-x-2 bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white hover:border-[#F7D117] transition-colors"><span className="capitalize">{member.role}</span><svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></button>
                          {roleDropdownOpen === member.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(null)}></div>
                              <div className="absolute right-0 mt-1 w-32 bg-[#111111] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                                {['admin', 'editor', 'contributor'].map((role) => (
                                  <button key={role} onClick={() => { handleRoleChange(member.id, role); setRoleDropdownOpen(null); }} className={`w-full text-left px-3 py-2 text-xs capitalize hover:bg-[#1a1a1a] transition-colors ${member.role === role ? 'text-[#F7D117] font-bold' : 'text-gray-300'}`}>{role}</button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <button onClick={() => handleDeleteMember(member.id)} className="w-8 h-8 flex items-center justify-center rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors text-lg">✕</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blocker' && userRole === 'super_admin' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold">Site & App Blocker</h2>
                <p className="text-sm text-gray-400 mt-1">Manage blocked websites, apps, and auto-block VPN extensions.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-white">Blocked Websites</h3>
                      <p className="text-xs text-green-400 mt-1">✓ Common VPN Extensions auto-blocked</p>
                    </div>
                    <button onClick={() => setIsAddBlockModalOpen(true)} className="px-3 py-1.5 bg-[#F7D117] text-black text-xs font-bold rounded-lg hover:bg-yellow-500 transition-colors shrink-0">+ Add Site</button>
                  </div>
                  <div className="space-y-3">
                    {blockedSites.map((site) => {
                      const targetDevice = devices.find(d => d.id === site.device_id);
                      return (
                        <div key={site.id} className="bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">{site.site_name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{site.site_url}</p>
                            <p className="text-[10px] text-[#F7D117] mt-1">Device: {site.device_id ? (targetDevice ? targetDevice.device_name : 'Unknown') : 'ALL DEVICES'}</p>
                          </div>
                          <button onClick={() => handleRemoveBlockedSite(site.id)} className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors">Unblock</button>
                        </div>
                      );
                    })}
                    {blockedSites.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No websites blocked yet.</p>}
                  </div>
                </div>

                <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Blocked Apps</h3>
                    <button onClick={() => setIsAddAppBlockModalOpen(true)} className="px-3 py-1.5 bg-[#F7D117] text-black text-xs font-bold rounded-lg hover:bg-yellow-500 transition-colors">+ Add App</button>
                  </div>
                  <div className="space-y-3">
                    {blockedApps.map((app) => {
                      const targetDevice = devices.find(d => d.id === app.device_id);
                      return (
                        <div key={app.id} className="bg-[#0a0a0a] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">{app.app_name}</h4>
                            <p className="text-xs text-gray-500 font-mono">{app.process_name}</p>
                            <p className="text-[10px] text-[#F7D117] mt-1">Device: {app.device_id ? (targetDevice ? targetDevice.device_name : 'Unknown') : 'ALL DEVICES'}</p>
                          </div>
                          <button onClick={() => handleRemoveBlockedApp(app.id)} className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 hover:bg-red-500/20 transition-colors">Unblock</button>
                        </div>
                      );
                    })}
                    {blockedApps.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No apps blocked yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && userRole === 'super_admin' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Audit Logs</h2>
                  <p className="text-sm text-gray-400 mt-1">History of all actions performed in the system.</p>
                </div>
                
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <button onClick={handleExportLogs} className="flex-1 md:flex-none px-4 py-2 bg-green-600/20 text-green-400 text-sm font-bold rounded-lg border border-green-600/30 hover:bg-green-600/30 transition-colors flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    <span>Export CSV</span>
                  </button>
                  
                  <button onClick={handleDeleteLogs} disabled={selectedLogs.length === 0} className={`flex-1 md:flex-none px-4 py-2 text-sm font-bold rounded-lg border flex items-center justify-center space-x-2 transition-colors ${selectedLogs.length > 0 ? 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30' : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Delete ({selectedLogs.length})</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead className="bg-[#1a1a1a] text-gray-400 text-sm border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-4 w-10">
                        <input type="checkbox" onChange={handleSelectAllLogs} checked={auditLogs.length > 0 && selectedLogs.length === auditLogs.length} className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded cursor-pointer" />
                      </th>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Action</th>
                      <th className="px-6 py-4 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1a1a1a]/50 transition-colors">
                        <td className="px-4 py-4">
                          <input type="checkbox" checked={selectedLogs.includes(log.id)} onChange={() => handleSelectLog(log.id)} className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded cursor-pointer" />
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-sm whitespace-nowrap">{log.user_email}</td>
                        <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F7D117]/20 text-[#F7D117]">{log.action}</span></td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {auditLogs.length === 0 && (<div className="text-center py-20 text-gray-500">No activity logs found.</div>)}
              </div>
            </div>
          )}

          {activeTab === 'security' && userRole === 'super_admin' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">IP Security</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage IP addresses allowed or blocked from accessing the dashboard.</p>
                </div>
                
                <div className="flex items-center space-x-3 bg-[#111111] px-4 py-2 rounded-xl border border-gray-800">
                  <span className="text-sm font-medium text-gray-300">Enable IP Filter</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={ipFilterEnabled} onChange={toggleIpFilter} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F7D117]"></div>
                  </label>
                </div>
              </div>

              <div className="bg-[#1a1a1a] p-4 rounded-xl mb-6 border border-gray-800 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-400">Your Current Public IP:</p>
                  <p className="text-lg font-mono text-[#F7D117]">{myIp}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${ipFilterEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  Filter is {ipFilterEnabled ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">Add IP Rule</h3>
                  <form onSubmit={handleAddIpRule} className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">IP Address</label>
                      <input type="text" required value={newIp} onChange={(e) => setNewIp(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white font-mono" placeholder="e.g. 192.168.1.100" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Rule Type</label>
                      <select value={newIpType} onChange={(e) => setNewIpType(e.target.value as any)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white">
                        <option value="blacklist">Blacklist (Block this IP)</option>
                        <option value="whitelist">Whitelist (Allow ONLY this IP)</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">Add Rule</button>
                  </form>
                </div>

                <div className="bg-[#111111] p-6 rounded-2xl border border-gray-800">
                  <h3 className="text-lg font-bold text-white mb-4">Active IP Rules</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {ipRules.map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between bg-[#0a0a0a] p-3 rounded-lg border border-gray-800">
                        <div className="flex items-center space-x-3">
                          <span className={`w-2 h-2 rounded-full ${rule.type === 'blacklist' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                          <span className="font-mono text-white">{rule.ip_address}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`text-xs font-bold uppercase ${rule.type === 'blacklist' ? 'text-red-500' : 'text-green-500'}`}>{rule.type}</span>
                          <button onClick={() => handleRemoveIpRule(rule.id, rule.ip_address)} className="text-gray-500 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    {ipRules.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No IP rules added yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-center text-white">Account Settings</h3>
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-gray-800 rounded-full mb-4 border-2 border-gray-600 overflow-hidden cursor-move flex items-center justify-center relative group" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onClick={() => !isDragging && fileInputRef.current?.click()}>
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover select-none pointer-events-none" style={{ transform: `scale(${zoomLevel}) translate(${imgPosition.x}px, ${imgPosition.y}px)` }} /> : <span className="text-xs text-gray-400 pointer-events-none">Click to Upload</span>}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              {profileImage && (
                <div className="w-full mb-4">
                  <label className="text-xs text-gray-400 mb-2 flex justify-between"><span>Zoom</span><span>Drag image to adjust position</span></label>
                  <input type="range" min="1" max="3" step="0.1" value={zoomLevel} onChange={(e) => setZoomLevel(parseFloat(e.target.value))} className="w-full accent-[#F7D117]" />
                </div>
              )}
              <button onClick={saveProfileImage} className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors">Save Profile Picture</button>
            </div>
            <hr className="border-gray-800 mb-8" />
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Change Password</h4>
              {passMsg && <div className={`p-3 mb-4 text-sm rounded-lg ${passMsg.includes('success') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{passMsg}</div>}
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div><label className="block text-sm text-gray-400 mb-1">Current Password</label><input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required /></div>
                <div><label className="block text-sm text-gray-400 mb-1">New Password</label><input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} /></div>
                <div><label className="block text-sm text-gray-400 mb-1">Confirm New Password</label><input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" required minLength={6} /></div>
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
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between"><span>Device Name</span>{userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}</label>
                  <input type="text" required value={editDeviceName} onChange={(e) => setEditDeviceName(e.target.value)} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#1a1a1a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between"><span>IP Address</span>{userRole !== 'super_admin' && <span className="text-xs text-red-400">(Locked)</span>}</label>
                  <input type="text" value={editDeviceIp} onChange={(e) => setEditDeviceIp(e.target.value)} disabled={userRole !== 'super_admin'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'super_admin' ? 'bg-[#0a0a0a] border-gray-800 text-white' : 'bg-[#1a1a1a] border-gray-700 text-gray-500'}`} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex justify-between"><span>Interval (Minutes)</span>{userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}</label>
                  <input type="number" min="1" required value={editInterval} onChange={(e) => setEditInterval(Number(e.target.value))} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#1a1a1a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1 flex justify-between"><span>Idle Limit (Minutes)</span>{userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}</label>
                    <input type="number" min="0" required value={editIdleLimit} onChange={(e) => setEditIdleLimit(Number(e.target.value))} disabled={userRole === 'editor' || userRole === 'contributor'} className={`w-full px-4 py-2 border rounded-lg ${userRole === 'editor' || userRole === 'contributor' ? 'bg-[#1a1a1a] border-gray-700 text-gray-500' : 'bg-[#0a0a0a] border-gray-800 text-white'}`} />
                    <p className="text-[10px] text-gray-500 mt-1">Set 0 to disable Idle Detection.</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Telegram Groups</label>
                  {userRole === 'super_admin' || userRole === 'admin' ? (
                    <div className="p-4 bg-[#0a0a0a] border border-gray-800 rounded-lg max-h-40 overflow-y-auto space-y-3">
                      <p className="text-xs text-gray-500 mb-2">Select multiple groups:</p>
                      {visibleGroups.map(g => (
                        <label key={g.id} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="checkbox" checked={editGroupIds.includes(g.id)} onChange={() => handleGroupCheckboxChange(g.id)} className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded" />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{g.group_name}</span>
                        </label>
                      ))}
                      {visibleGroups.length === 0 && <p className="text-xs text-gray-500">No groups available.</p>}
                    </div>
                  ) : (
                    <select value={editGroupIds[0] || ''} onChange={(e) => setEditGroupIds(e.target.value ? [e.target.value] : [])} className="relative z-50 w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white">
                      <option value="">-- Select Group --</option>
                      {visibleGroups.map(g => <option key={g.id} value={g.id}>{g.group_name}</option>)}
                    </select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800 mt-4">
                <div className="col-span-2 text-sm text-[#F7D117] font-semibold mb-1 flex justify-between"><span>Break Time</span>{userRole === 'editor' && <span className="text-xs text-red-400">(Locked)</span>}</div>
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
              <div><label className="block text-sm text-gray-400 mb-1">Device Name</label><input type="text" required value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. PC-01" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">IP Address</label><input type="text" value={newDeviceIp} onChange={(e) => setNewDeviceIp(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. 192.168.1.10" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">MAC Address (Optional)</label><input type="text" value={newDeviceMac} onChange={(e) => setNewDeviceMac(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. 123456789" /><p className="text-[10px] text-gray-500 mt-1">If you want to link this with an installed agent, enter its MAC address here.</p></div>
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
              <div><label className="block text-sm text-gray-400 mb-1">Email Address</label><input type="email" required value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" /></div>
              {userRole === 'super_admin' ? (
                <div><label className="block text-sm text-gray-400 mb-1">Assign Role</label><select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white"><option value="admin">Admin</option><option value="editor">Editor</option><option value="contributor">Contributor</option></select></div>
              ) : (
                <div className="p-3 bg-[#1a1a1a] border border-gray-800 rounded-lg"><p className="text-sm text-gray-400">Role will be assigned as <span className="text-[#F7D117] font-bold">Admin</span>.</p></div>
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
              <div><label className="block text-sm text-gray-400 mb-1">Group Name</label><input type="text" required value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Chat ID</label><input type="text" required value={newGroupChatId} onChange={(e) => setNewGroupChatId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" /></div>
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
              <div><label className="block text-sm text-gray-400 mb-1">Group Name</label><input type="text" required value={editGroupName} onChange={(e) => setEditGroupName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" /></div>
              <div><label className="block text-sm text-gray-400 mb-1">Chat ID</label><input type="text" required value={editGroupChatId} onChange={(e) => setEditGroupChatId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" /></div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4 hover:bg-yellow-500">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddBlockModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Block New Website</h3>
            <form onSubmit={handleAddBlockedSite} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Target Device</label>
                <select required={!applyToAllSites} disabled={applyToAllSites} value={blockDeviceId} onChange={(e) => setBlockDeviceId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white disabled:opacity-50">
                  <option value="">-- Choose Device --</option>
                  {devices.map(d => (<option key={d.id} value={d.id}>{d.device_name}</option>))}
                </select>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input type="checkbox" id="applyAllSites" checked={applyToAllSites} onChange={(e) => setApplyToAllSites(e.target.checked)} className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded cursor-pointer" />
                <label htmlFor="applyAllSites" className="text-sm text-[#F7D117] font-semibold cursor-pointer">Apply to All Devices</label>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Site Name</label>
                <input type="text" required value={blockSiteName} onChange={(e) => setBlockSiteName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. Facebook" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                <input type="text" required value={blockSiteUrl} onChange={(e) => setBlockSiteUrl(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. facebook.com" />
                <p className="text-[10px] text-gray-500 mt-1">Do not include https:// or www. Just the domain name.</p>
              </div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Block Site</button>
            </form>
          </div>
        </div>
      )}

      {isAddAppBlockModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-gray-800 p-6 rounded-2xl w-full max-w-md relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddAppBlockModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-[#F7D117] transition-colors">✕</button>
            <h3 className="text-xl font-bold mb-6 text-[#F7D117]">Block New App</h3>
            <form onSubmit={handleAddBlockedApp} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Select Target Device</label>
                <select required={!applyToAllApps} disabled={applyToAllApps} value={blockAppDeviceId} onChange={(e) => setBlockAppDeviceId(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white disabled:opacity-50">
                  <option value="">-- Choose Device --</option>
                  {devices.map(d => (<option key={d.id} value={d.id}>{d.device_name}</option>))}
                </select>
              </div>
              <div className="flex items-center space-x-2 py-1">
                <input type="checkbox" id="applyAllApps" checked={applyToAllApps} onChange={(e) => setApplyToAllApps(e.target.checked)} className="w-4 h-4 accent-[#F7D117] bg-[#111] border-gray-600 rounded cursor-pointer" />
                <label htmlFor="applyAllApps" className="text-sm text-[#F7D117] font-semibold cursor-pointer">Apply to All Devices</label>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">App Name</label>
                <input type="text" required value={blockAppName} onChange={(e) => setBlockAppName(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white" placeholder="e.g. Steam" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Process Name</label>
                <input type="text" required value={blockAppProcess} onChange={(e) => setBlockAppProcess(e.target.value)} className="w-full px-4 py-2 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white font-mono" placeholder="e.g. steam.exe" />
                <p className="text-[10px] text-gray-500 mt-1">Task Manager-এ গিয়ে Details ট্যাবে অ্যাপের নাম দেখে নাও (যেমন: steam.exe, vlc.exe)।</p>
              </div>
              <button type="submit" className="w-full py-2 bg-[#F7D117] text-black font-bold rounded-lg mt-4">Block App</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}