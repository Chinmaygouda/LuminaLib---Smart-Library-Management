
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Catalog from './components/Catalog';
import AIAssistant from './components/AIAssistant';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { View, Book, Loan, User } from './types';
import { INITIAL_BOOKS, INITIAL_LOANS } from './constants';

const App: React.FC = () => {
  const [currentView, setView] = useState<View>('catalog');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [activeRenewId, setActiveRenewId] = useState<string | null>(null);
  const [selectedLoanForDetail, setSelectedLoanForDetail] = useState<Loan | null>(null);
  const [user, setUser] = useState<User | null>({
    id: 'staff-01',
    name: 'Main Librarian',
    email: 'librarian@luminalib.com',
    role: 'admin',
    joinDate: '2024-01-01',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=librarian'
  });
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [loans, setLoans] = useState<Loan[]>(INITIAL_LOANS);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const handleAddBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
  };

  const handleCheckOut = (bookId: string, borrowerName: string, borrowerPhone: string, dueDate: string) => {
    const newLoan: Loan = {
      id: Math.random().toString(36).substr(2, 9),
      bookId,
      borrowerName,
      borrowerPhone,
      loanDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'active'
    };
    setLoans(prev => [...prev, newLoan]);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, status: 'loaned' } : b));
  };

  const handleReturn = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    setLoans(prev => prev.filter(l => l.id !== loanId));
    setBooks(prev => prev.map(b => b.id === loan.bookId ? { ...b, status: 'available' } : b));
  };

  const handleRenew = (loanId: string, days: number) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const currentDueDate = new Date(l.dueDate);
        const newDueDate = new Date(currentDueDate.getTime() + days * 24 * 60 * 60 * 1000);
        return { 
          ...l, 
          dueDate: newDueDate.toISOString().split('T')[0],
          status: 'active' as const
        };
      }
      return l;
    }));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard books={books} loans={loans} setView={setView} />;
      case 'catalog':
        return (
          <Catalog 
            books={books} 
            loans={loans} 
            onAddBook={handleAddBook} 
            onCheckOut={handleCheckOut} 
            isRegisterModalOpen={isRegisterModalOpen}
            setIsRegisterModalOpen={setIsRegisterModalOpen}
          />
        );
      case 'ai-assistant':
        return <AIAssistant books={books} />;
      case 'profile':
        return <Profile user={user} onUpdate={setUser} />;
      case 'loans':
        return (
          <div className="space-y-10 animate-fadeIn">
            <header>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Active Lending Log</h1>
              <p className="text-slate-500 mt-2 font-medium">Current book checkouts and return tracking.</p>
            </header>
            
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Borrower</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Issued</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Due Date</th>
                      <th className="px-10 py-7 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loans.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-10 py-20 text-center text-slate-400 font-bold text-lg italic">No active loans found.</td>
                      </tr>
                    ) : (
                      loans.map((loan) => {
                        const book = books.find(b => b.id === loan.bookId);
                        const isOverdue = loan.status === 'overdue';
                        return (
                          <tr key={loan.id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-10 py-8">
                              <div className="flex items-center space-x-6">
                                <img src={book?.coverUrl} className="w-12 h-16 object-cover rounded-xl shadow-md bg-slate-100 group-hover:scale-105 transition-transform" alt="" />
                                <div>
                                  <p className="font-black text-slate-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">{book?.title}</p>
                                  <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 bg-indigo-50 inline-block px-2 py-0.5 rounded-md">SHELF {book?.shelf}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                              <button 
                                onClick={() => setSelectedLoanForDetail(loan)}
                                className="flex items-center gap-4 group/borrower text-left hover:bg-slate-50 -ml-4 pl-4 pr-6 py-2 rounded-2xl transition-all"
                              >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 border-2 border-slate-200 group-hover/borrower:border-indigo-200 group-hover/borrower:bg-indigo-50 transition-all">
                                  {loan.borrowerName.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-black text-slate-800 block text-sm group-hover/borrower:text-indigo-600">{loan.borrowerName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">{loan.borrowerPhone}</span>
                                </div>
                              </button>
                            </td>
                            <td className="px-10 py-8">
                               <span className="text-sm font-bold text-slate-500">{loan.loanDate}</span>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col">
                                 <span className={`text-sm font-black ${isOverdue ? 'text-red-500' : 'text-slate-900'}`}>
                                   {loan.dueDate}
                                 </span>
                                 {isOverdue && (
                                   <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">Expired</span>
                                 )}
                               </div>
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                  <button 
                                    onClick={() => setActiveRenewId(activeRenewId === loan.id ? null : loan.id)}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-3 border-2 ${
                                      activeRenewId === loan.id 
                                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' 
                                      : 'bg-indigo-50 text-indigo-600 border-transparent hover:border-indigo-100'
                                    }`}
                                  >
                                    Renew
                                    <i className={`fas fa-chevron-down text-[8px] transition-transform ${activeRenewId === loan.id ? 'rotate-180' : ''}`}></i>
                                  </button>
                                  {activeRenewId === loan.id && (
                                    <>
                                      <div className="fixed inset-0 z-[55]" onClick={() => setActiveRenewId(null)}></div>
                                      <div className="absolute bottom-full mb-4 right-0 bg-white shadow-2xl rounded-[1.5rem] p-3 border border-slate-100 z-[60] flex flex-col gap-1 min-w-[160px] animate-slideUp">
                                        <p className="text-[9px] font-black text-slate-400 uppercase px-4 py-2 border-b border-slate-50 mb-2">Renewal Period</p>
                                        {[3, 5, 8].map(days => (
                                          <button key={days} onClick={() => { handleRenew(loan.id, days); setActiveRenewId(null); }} className="text-left px-4 py-3 text-[11px] font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all flex justify-between items-center group/opt">
                                            {days} Days
                                            <i className="fas fa-plus-circle text-[10px] opacity-0 group-hover/opt:opacity-100 transition-opacity"></i>
                                          </button>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                                <button 
                                  onClick={() => handleReturn(loan.id)}
                                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest"
                                >
                                  Return Item
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Borrower Details Modal */}
            {selectedLoanForDetail && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLoanForDetail(null)}></div>
                <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
                  <div className="p-10">
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-20 h-20 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-3xl font-black text-indigo-600">
                        {selectedLoanForDetail.borrowerName.charAt(0)}
                      </div>
                      <button onClick={() => setSelectedLoanForDetail(null)} className="text-slate-300 hover:text-slate-500">
                        <i className="fas fa-times text-xl"></i>
                      </button>
                    </div>
                    
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedLoanForDetail.borrowerName}</h2>
                    <p className="text-indigo-500 font-bold mb-8">Verified Member Details</p>
                    
                    <div className="space-y-6 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-400">
                          <i className="fas fa-phone-alt"></i>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                          <p className="text-sm font-black text-slate-700">{selectedLoanForDetail.borrowerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-400">
                          <i className="far fa-calendar-check"></i>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Loan ID</p>
                          <p className="text-sm font-black text-slate-700">#{selectedLoanForDetail.id.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-400">
                          <i className="fas fa-book"></i>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Borrowed Resource</p>
                          <p className="text-sm font-black text-slate-700 truncate max-w-[200px]">
                            {books.find(b => b.id === selectedLoanForDetail.bookId)?.title}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedLoanForDetail(null)}
                      className="w-full mt-8 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                    >
                      Close Profile
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return (
          <Catalog 
            books={books} 
            loans={loans} 
            onAddBook={handleAddBook} 
            onCheckOut={handleCheckOut} 
            isRegisterModalOpen={isRegisterModalOpen}
            setIsRegisterModalOpen={setIsRegisterModalOpen}
          />
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        user={user} 
        onOpenRegisterModal={() => {
          setView('catalog');
          setIsRegisterModalOpen(true);
        }}
      />
      <main className="flex-1 ml-64 p-12 overflow-y-auto min-h-screen">
        <div className="max-w-[1400px] mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
