
import React from 'react';
import { Book, Loan, View } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  books: Book[];
  loans: Loan[];
  setView: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ books, loans, setView }) => {
  const stats = [
    { label: 'Registered Items', value: books.length, icon: 'fa-database', color: 'bg-blue-500', target: 'catalog' as View },
    { label: 'Checked Out', value: books.filter(b => b.status === 'loaned').length, icon: 'fa-truck-loading', color: 'bg-indigo-500', target: 'loans' as View },
    { label: 'Overdue Returns', value: loans.filter(l => l.status === 'overdue').length, icon: 'fa-exclamation-triangle', color: 'bg-red-500', target: 'loans' as View },
    { label: 'Available Stock', value: books.filter(b => b.status === 'available').length, icon: 'fa-boxes', color: 'bg-emerald-500', target: 'catalog' as View },
  ];

  const categoryData = Object.entries(
    books.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  return (
    <div className="space-y-10 animate-fadeIn">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Administrative Console</h1>
        <p className="text-slate-500 mt-1 font-medium">Monitoring collection health and physical inventory circulation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => setView(stat.target)}
            className="cursor-pointer bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center space-x-6 hover:translate-y-[-4px] hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <i className="fas fa-chart-bar text-indigo-500"></i>
            Collection Breakdown by Genre
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '15px' }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2">
            <i className="fas fa-history text-orange-500"></i>
            Recent Activity
          </h3>
          <div className="space-y-6">
            {loans.slice(0, 4).map((loan) => {
               const book = books.find(b => b.id === loan.bookId);
               return (
                 <div key={loan.id} className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                     <i className="fas fa-exchange-alt"></i>
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-xs font-bold text-slate-800 truncate">{book?.title}</p>
                     <p className="text-[10px] text-slate-400 font-bold">Issued to {loan.borrowerName}</p>
                   </div>
                   <span className="text-[9px] font-black text-slate-400">{loan.loanDate.split('-').slice(1).join('/')}</span>
                 </div>
               );
            })}
            <button 
              onClick={() => setView('loans')}
              className="w-full py-4 mt-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Export Full Activity Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
