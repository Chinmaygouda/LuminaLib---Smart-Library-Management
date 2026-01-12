
import React, { useState, useRef, useEffect } from 'react';
import { Book, Loan } from '../types';

interface CatalogProps {
  books: Book[];
  loans: Loan[];
  onAddBook: (book: Book) => void;
  onCheckOut: (bookId: string, borrowerName: string, borrowerPhone: string, dueDate: string) => void;
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
}

const CustomDropdown = ({ 
  label, 
  options, 
  selected, 
  onSelect, 
  className = "" 
}: { 
  label: string; 
  options: { value: string; label: string }[]; 
  selected: string; 
  onSelect: (val: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === selected)?.label || label;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all font-bold text-sm ${
          isOpen ? 'border-indigo-400 bg-white shadow-xl' : 'border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100'
        }`}
      >
        <span className="truncate">{selectedLabel}</span>
        <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-[70] max-h-[400px] overflow-y-auto no-scrollbar animate-slideUp">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                selected === option.value 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Catalog: React.FC<CatalogProps> = ({ 
  books, 
  loans, 
  onAddBook, 
  onCheckOut, 
  isRegisterModalOpen, 
  setIsRegisterModalOpen 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'none' | 'shelf-asc' | 'year-desc' | 'year-asc'>('none');
  
  const [checkingOutBook, setCheckingOutBook] = useState<Book | null>(null);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Registration Form State
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Fiction',
    tags: '',
    shelf: '',
    description: '',
    publishYear: new Date().getFullYear(),
    coverUrl: 'https://images.unsplash.com/photo-1543004471-240ce4775d3b?auto=format&fit=crop&q=80&w=400'
  });

  const categoryOptions: { value: string; label: string }[] = [
    { value: 'All', label: 'All Genres' },
    ...Array.from(new Set(books.map(b => b.category))).sort().map((c: string) => ({ value: c, label: c }))
  ];

  const sortOptions = [
    { value: 'none', label: 'Default Order' },
    { value: 'shelf-asc', label: 'Sort by Shelf (Asc)' },
    { value: 'year-desc', label: 'Sort by Year (Newest)' },
    { value: 'year-asc', label: 'Sort by Year (Oldest)' }
  ];

  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'loaned', label: 'Currently Loaned' }
  ];

  const today = new Date();
  const minDate = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const setPresetDate = (days: number) => {
    const d = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.shelf) {
      alert("Please fill in required fields: Title, Author, and Shelf Location.");
      return;
    }

    const bookToAdd: Book = {
      ...newBook,
      id: Math.random().toString(36).substr(2, 9),
      tags: newBook.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      status: 'available',
      publishYear: Number(newBook.publishYear),
      isbn: newBook.isbn || `REF-${Math.floor(Math.random() * 1000000)}`
    };

    onAddBook(bookToAdd);
    setIsRegisterModalOpen(false);
    // Reset form
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: 'Fiction',
      tags: '',
      shelf: '',
      description: '',
      publishYear: new Date().getFullYear(),
      coverUrl: 'https://images.unsplash.com/photo-1543004471-240ce4775d3b?auto=format&fit=crop&q=80&w=400'
    });
  };

  let filteredBooks = books.filter(book => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      book.title.toLowerCase().includes(searchLower) ||
      book.author.toLowerCase().includes(searchLower) ||
      book.shelf.toLowerCase().includes(searchLower) ||
      book.tags.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || book.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (sortBy === 'shelf-asc') {
    filteredBooks = [...filteredBooks].sort((a, b) => a.shelf.localeCompare(b.shelf, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (sortBy === 'year-desc') {
    filteredBooks = [...filteredBooks].sort((a, b) => b.publishYear - a.publishYear);
  } else if (sortBy === 'year-asc') {
    filteredBooks = [...filteredBooks].sort((a, b) => a.publishYear - b.publishYear);
  }

  const getActiveLoan = (bookId: string) => {
    return loans.find(l => l.bookId === bookId);
  };

  const handleCheckOutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = borrowerPhone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert("Invalid Phone Number: Please enter exactly 10 digits.");
      return;
    }
    onCheckOut(checkingOutBook!.id, borrowerName, borrowerPhone, dueDate);
    setCheckingOutBook(null);
    setBorrowerName('');
    setBorrowerPhone('');
    setDueDate('');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Locate items, manage returns, and browse the physical collection.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              placeholder="Search by Title, Author, Shelf ID, or Tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all text-slate-800 placeholder-slate-400 font-bold"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <CustomDropdown 
              label="Sort By"
              options={sortOptions}
              selected={sortBy}
              onSelect={(val) => setSortBy(val as any)}
              className="min-w-[200px]"
            />
            <CustomDropdown 
              label="All Genres"
              options={categoryOptions}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              className="min-w-[180px]"
            />
            <CustomDropdown 
              label="All Status"
              options={statusOptions}
              selected={selectedStatus}
              onSelect={setSelectedStatus}
              className="min-w-[160px]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-10 pb-20">
        {filteredBooks.map((book) => {
          const loan = getActiveLoan(book.id);
          const isLoaned = book.status === 'loaned';
          return (
            <div key={book.id} className="group bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col relative">
              <div className="p-8 flex-1">
                <div className="flex gap-8">
                  <div className="w-32 h-44 flex-shrink-0 relative">
                    <img src={book.coverUrl} className="w-full h-full object-cover rounded-2xl shadow-xl bg-slate-100" alt="" />
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-50">
                      <i className={`fas ${book.status === 'available' ? 'fa-check text-emerald-500' : 'fa-clock text-orange-500'} text-sm`}></i>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">{book.category}</span>
                      <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-md">
                        <i className="fas fa-map-pin text-[10px] text-indigo-400"></i>
                        <span className="text-[11px] font-black">{book.shelf}</span>
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 truncate group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                    <p className="text-sm text-slate-500 font-bold mb-1">by {book.author}</p>
                    <p className="text-xs font-bold text-slate-400 mb-4 italic">Released {book.publishYear}</p>
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</p>
                      <p className={`text-sm font-black ${book.status === 'available' ? 'text-emerald-600' : 'text-orange-600'}`}>
                        {book.status === 'available' ? 'On Shelf' : 'Currently Borrowed'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference</p>
                      <p className="text-sm font-black text-slate-700">{book.isbn.split('-').pop()}</p>
                    </div>
                  </div>

                  {isLoaned && loan && (
                    <div className="mb-6 p-6 rounded-3xl bg-orange-50/40 border border-orange-100/50">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Borrower Info</p>
                      <p className="text-sm font-black text-slate-900 mb-2">{loan.borrowerName}</p>
                      <div className="flex items-center gap-2 text-slate-500">
                        <i className="far fa-calendar-alt text-xs"></i>
                        <span className="text-xs font-bold">Return by {loan.dueDate}</span>
                      </div>
                    </div>
                  )}

                  <button 
                    disabled={isLoaned}
                    onClick={() => setCheckingOutBook(book)}
                    className={`w-full py-4 text-center rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      isLoaned 
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/20'
                    }`}
                  >
                    Check Out Item
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {checkingOutBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={() => setCheckingOutBook(null)}></div>
          <div className="relative bg-white w-full max-w-[480px] rounded-[2.5rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
                  <i className="fas fa-book-reader text-xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">Check Out</h2>
                  <p className="text-slate-500 text-sm font-semibold opacity-70 truncate max-w-[280px]">{checkingOutBook.title}</p>
                </div>
              </div>
              <form onSubmit={handleCheckOutSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Borrower Name</label>
                  <input type="text" value={borrowerName} onChange={(e) => setBorrowerName(e.target.value)} placeholder="e.g. Alice Johnson" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="tel" value={borrowerPhone} onChange={(e) => setBorrowerPhone(e.target.value)} placeholder="10 digit number" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-1 ml-1">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Due Date</label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setPresetDate(3)} className="px-3 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600">3d</button>
                      <button type="button" onClick={() => setPresetDate(7)} className="px-3 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-600">7d</button>
                    </div>
                  </div>
                  <input type="date" value={dueDate} min={minDate} max={maxDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-slate-800" required />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setCheckingOutBook(null)} className="flex-1 py-4 text-sm font-black text-slate-500 bg-slate-100 rounded-2xl hover:bg-slate-200 uppercase tracking-widest">Cancel</button>
                  <button type="submit" className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-indigo-200">Confirm</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Register New Book Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsRegisterModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-[900px] rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                  <i className="fas fa-book-medical text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Resource</h2>
                  <p className="text-slate-400 text-sm font-semibold">Integrate a new item into the master inventory system.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-300 hover:text-slate-500 transition-colors p-3 hover:bg-slate-50 rounded-full"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmitRegistration} className="p-10">
              <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                        <i className="fas fa-heading"></i>
                      </div>
                      <input 
                        type="text" 
                        name="title" 
                        value={newBook.title} 
                        onChange={handleRegistrationInputChange} 
                        placeholder="e.g. Project Hail Mary" 
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Author / Publisher</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                        <i className="fas fa-user-edit"></i>
                      </div>
                      <input 
                        type="text" 
                        name="author" 
                        value={newBook.author} 
                        onChange={handleRegistrationInputChange} 
                        placeholder="e.g. Andy Weir" 
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Genre / Category</label>
                      <select 
                        name="category"
                        value={newBook.category}
                        onChange={handleRegistrationInputChange}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="Fiction">Fiction</option>
                        <option value="Science Fiction">Science Fiction</option>
                        <option value="History">History</option>
                        <option value="Self-Help">Self-Help</option>
                        <option value="Technology">Technology</option>
                        <option value="Fantasy">Fantasy</option>
                        <option value="Classic">Classic</option>
                        <option value="Mystery">Mystery</option>
                      </select>
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Shelf ID</label>
                      <input 
                        type="text" 
                        name="shelf" 
                        value={newBook.shelf} 
                        onChange={handleRegistrationInputChange} 
                        placeholder="e.g. SF-01-A" 
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder-slate-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-6">
                  <div className="space-y-2 flex-1 flex flex-col">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Summary / Description</label>
                    <textarea 
                      name="description"
                      value={newBook.description}
                      onChange={handleRegistrationInputChange}
                      placeholder="Write a brief overview of the resource content..."
                      className="w-full flex-1 px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-600 placeholder-slate-300 resize-none leading-relaxed"
                    ></textarea>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Cover URL (Image)</label>
                    <input 
                      type="url" 
                      name="coverUrl" 
                      value={newBook.coverUrl} 
                      onChange={handleRegistrationInputChange} 
                      placeholder="https://..." 
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none transition-all font-bold text-slate-800 placeholder-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-5 mt-12 pt-8 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsRegisterModalOpen(false)} 
                  className="px-10 py-4 text-sm font-black text-slate-500 bg-white border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors uppercase tracking-widest"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all"
                >
                  Finalize Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
