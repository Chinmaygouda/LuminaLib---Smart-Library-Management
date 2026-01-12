
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  tags: string[];
  status: 'available' | 'loaned' | 'reserved';
  description: string;
  coverUrl: string;
  publishYear: number;
  shelf: string; // Physical location (e.g., A-12, B-03)
}

export interface Loan {
  id: string;
  bookId: string;
  borrowerName: string;
  borrowerPhone?: string;
  dueDate: string;
  loanDate: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'member';
  joinDate: string;
  avatar?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export type View = 'dashboard' | 'catalog' | 'loans' | 'inventory-map' | 'profile';
