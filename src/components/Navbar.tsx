import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const isAddPage = location.pathname === '/add';
  const isManage = location.pathname === '/manage';
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isRentOpen, setIsRentOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoUrl = "/Image/YGB_Logo_Trimmed.png";
  const whatsappNumber = "639467543767";
  const facebookUrl = "https://www.facebook.com/Goldelyn";
  const instagramUrl = "https://www.instagram.com/yhensproperty?igsh=MWMweTY5aWZidzhidg==";

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img src={logoUrl} alt="YGB Buy Gold & Sell" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg" />
        </Link>

        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {/* Buy Dropdown */}
          <div className="relative group h-full flex items-center"
            onMouseEnter={() => setIsBuyOpen(true)}
            onMouseLeave={() => setIsBuyOpen(false)}>
            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-2">
              Buy
              <span className={`material-icons text-xs transition-transform duration-200 ${isBuyOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`absolute top-full left-0 w-56 pt-2 transition-all duration-200 origin-top-left ${isBuyOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-2 p-1.5 ring-1 ring-black/5">
                <Link to="/category/buy-condos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsBuyOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">monetization_on</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Buy Gold Coins</span>
                </Link>
                <Link to="/category/buy-houses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsBuyOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">view_week</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Buy Gold Bars</span>
                </Link>
                <Link to="/category/buy-land" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsBuyOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">diamond</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Buy Jewelry</span>
                </Link>
                <Link to="/category/buy-commercial" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsBuyOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">category</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Buy Collectibles</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/sell" className="text-sm font-medium hover:text-primary transition-colors">Sell</Link>

          {/* Rent Dropdown */}
          <div className="relative group h-full flex items-center"
            onMouseEnter={() => setIsRentOpen(true)}
            onMouseLeave={() => setIsRentOpen(false)}>
            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors py-2">
              Rent
              <span className={`material-icons text-xs transition-transform duration-200 ${isRentOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`absolute top-full left-0 w-56 pt-2 transition-all duration-200 origin-top-left ${isRentOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}`}>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-2 p-1.5 ring-1 ring-black/5">
                <Link to="/category/rent-condos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsRentOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">monetization_on</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Lease Gold Coins</span>
                </Link>
                <Link to="/category/rent-houses" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsRentOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">view_week</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Lease Gold Bars</span>
                </Link>
                <Link to="/category/rent-land" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsRentOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">diamond</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Lease Jewelry</span>
                </Link>
                <Link to="/category/rent-commercial" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 group/item transition-colors" onClick={() => setIsRentOpen(false)}>
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover/item:bg-primary group-hover/item:text-zinc-900 transition-colors"><span className="material-icons text-sm">category</span></div>
                  <span className="text-sm font-semibold dark:text-zinc-300">Lease Collectibles</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">Contact</Link>

          <div className="flex items-center gap-3 pl-4 border-l border-zinc-100 dark:border-zinc-800 h-6">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#1877F2] group shadow-sm bg-zinc-50 dark:bg-zinc-800" title="Facebook">
              <svg className="w-4 h-4 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group relative overflow-hidden shadow-sm bg-zinc-50 dark:bg-zinc-800" title="Instagram">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}></div>
              <svg className="w-4 h-4 relative z-10 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.063-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi YGB, I'm reaching out from the website.")}`} target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-[#25D366] group shadow-sm bg-zinc-50 dark:bg-zinc-800" title="WhatsApp">
              <svg className="w-4 h-4 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <>
              {isAdmin && (
                <Link to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg font-bold text-xs md:text-sm transition-all bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-primary hover:text-zinc-900">
                  <span className="material-icons text-sm">group</span>
                  Users
                </Link>
              )}
              <Link to="/manage"
                className={`hidden sm:block px-3 md:px-4 lg:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all shadow-lg ${
                  isManage ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-primary/20 text-primary hover:bg-primary hover:text-zinc-900'
                }`}>
                Manage
              </Link>
              <Link to="/add"
                className={`hidden sm:block px-3 md:px-4 lg:px-5 py-2 rounded-lg font-bold text-xs md:text-sm transition-all shadow-lg ${
                  isAddPage ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-primary text-zinc-900 hover:brightness-110 shadow-primary/20'
                }`}>
                List Item
              </Link>
              <button onClick={handleSignOut}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                <span className="material-icons text-sm">logout</span>
                Sign Out
              </button>
            </>
          )}

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" aria-label="Toggle menu">
            <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-screen border-t border-zinc-200 dark:border-zinc-800' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-2 bg-white dark:bg-zinc-900">
          <div>
            <button onClick={() => setIsBuyOpen(!isBuyOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <span className="font-semibold text-sm">Buy</span>
              <span className={`material-icons text-xs transition-transform ${isBuyOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${isBuyOpen ? 'max-h-64' : 'max-h-0'}`}>
              <div className="pl-4 space-y-1 mt-1">
                <Link to="/category/buy-condos" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">monetization_on</span><span className="text-sm">Buy Gold Coins</span>
                </Link>
                <Link to="/category/buy-houses" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">view_week</span><span className="text-sm">Buy Gold Bars</span>
                </Link>
                <Link to="/category/buy-land" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">diamond</span><span className="text-sm">Buy Jewelry</span>
                </Link>
                <Link to="/category/buy-commercial" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">category</span><span className="text-sm">Buy Collectibles</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/sell" className="block px-4 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>Sell</Link>

          <div>
            <button onClick={() => setIsRentOpen(!isRentOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
              <span className="font-semibold text-sm">Rent</span>
              <span className={`material-icons text-xs transition-transform ${isRentOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${isRentOpen ? 'max-h-64' : 'max-h-0'}`}>
              <div className="pl-4 space-y-1 mt-1">
                <Link to="/category/rent-condos" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">monetization_on</span><span className="text-sm">Lease Gold Coins</span>
                </Link>
                <Link to="/category/rent-houses" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">view_week</span><span className="text-sm">Lease Gold Bars</span>
                </Link>
                <Link to="/category/rent-land" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">diamond</span><span className="text-sm">Lease Jewelry</span>
                </Link>
                <Link to="/category/rent-commercial" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800" onClick={() => setIsMobileMenuOpen(false)}>
                  <span className="material-icons text-sm text-primary">category</span><span className="text-sm">Lease Collectibles</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about" className="block px-4 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
          <Link to="/contact" className="block px-4 py-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 font-semibold text-sm" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>

          <div className="pt-2 space-y-2 sm:hidden">
            {user && (
              <>
                {isAdmin && (
                  <Link to="/admin"
                    className="flex items-center justify-center gap-2 w-full text-center px-4 py-3 rounded-lg font-bold text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="material-icons text-sm">group</span>
                    Manage Users
                  </Link>
                )}
                <Link to="/manage"
                  className={`block w-full text-center px-4 py-3 rounded-lg font-bold text-sm transition-all ${isManage ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-primary/20 text-primary'}`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  Manage
                </Link>
                <Link to="/add"
                  className={`block w-full text-center px-4 py-3 rounded-lg font-bold text-sm transition-all ${isAddPage ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-primary text-zinc-900'}`}
                  onClick={() => setIsMobileMenuOpen(false)}>
                  List Item
                </Link>
                <button onClick={handleSignOut}
                  className="w-full px-4 py-3 rounded-lg font-bold text-sm text-red-500 border border-red-200 hover:bg-red-50 transition-all">
                  Sign Out
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <a href={facebookUrl} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-[#1877F2] group shadow-sm bg-zinc-50 dark:bg-zinc-800">
              <svg className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 group relative overflow-hidden shadow-sm bg-zinc-50 dark:bg-zinc-800">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}></div>
              <svg className="w-5 h-5 relative z-10 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.063-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi YGB, I'm reaching out from the website.")}`} target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:bg-[#25D366] group shadow-sm bg-zinc-50 dark:bg-zinc-800">
              <svg className="w-5 h-5 fill-zinc-400 group-hover:fill-white transition-colors" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
