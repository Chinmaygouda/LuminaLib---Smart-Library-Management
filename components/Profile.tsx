
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate({ ...user, name, email });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
        <p className="text-slate-500">Manage your profile and security preferences</p>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="h-32 bg-indigo-600"></div>
        <div className="px-8 pb-8">
          <div className="relative -mt-12 mb-6 flex items-end justify-between">
            <div className="relative">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                alt={user.name} 
                className="w-24 h-24 rounded-2xl border-4 border-white shadow-md bg-white"
              />
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600">
                <i className="fas fa-camera text-xs"></i>
              </button>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors border border-slate-200"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-white text-slate-500 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-800">{user.name}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                ) : (
                  <p className="text-lg font-semibold text-slate-800">{user.email}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Account Role</label>
                <div className="flex items-center space-x-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold capitalize">
                     {user.role}
                   </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Member Since</label>
                <p className="text-lg font-semibold text-slate-800">{user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Security</h3>
        <div className="flex items-center justify-between py-4 border-b border-slate-50">
          <div>
            <p className="font-semibold text-slate-700">Change Password</p>
            <p className="text-sm text-slate-500">Update your account password regularly for safety</p>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:underline">Update</button>
        </div>
        <div className="flex items-center justify-between py-4">
          <div>
            <p className="font-semibold text-slate-700">Two-Factor Authentication</p>
            <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
          </div>
          <button className="text-indigo-600 font-bold text-sm hover:underline">Enable</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
