import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import Home from './pages/Home.tsx';
import AddListing from './pages/AddListing.tsx';
import ItemDetails from './pages/ItemDetails.tsx';
import ManageListings from './pages/ManageListings.tsx';
import CategoryListings from './pages/CategoryListings.tsx';
import About from './pages/About.tsx';
import Contact from './pages/Contact.tsx';
import Sell from './pages/Sell.tsx';
import Login from './pages/Login.tsx';
import Sitemap from './pages/Sitemap.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import MFAEnroll from './pages/MFAEnroll.tsx';
import MFAVerify from './pages/MFAVerify.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsOfService from './pages/TermsOfService.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { PropertyListing } from './types.ts';
import { PropertyService } from './services/propertyService.ts';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="material-icons animate-spin text-primary text-3xl">sync</span>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);

  const logoUrl = "/Image/YGB_Logo_Trimmed.png";
  const whatsappNumber = "639467543767";
  const instagramUrl = "https://www.instagram.com/yhensproperty?igsh=MWMweTY5aWZidzhidg==";

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    const checkExpiredFeatured = async () => {
      const now = new Date().toISOString();
      let hasExpired = false;

      const updatedProperties = properties.map(property => {
        if (property.featured && property.featuredUntil && property.featuredUntil < now) {
          hasExpired = true;
          return { ...property, featured: false, featuredUntil: undefined, dateUpdated: new Date().toISOString() };
        }
        return property;
      });

      if (hasExpired) {
        for (const property of updatedProperties) {
          const original = properties.find(p => p.id === property.id);
          if (original && original.featured !== property.featured) {
            await PropertyService.update(property.id, property);
          }
        }
        await loadProperties();
      }
    };

    if (properties.length > 0) {
      checkExpiredFeatured();
      const interval = setInterval(checkExpiredFeatured, 60000);
      return () => clearInterval(interval);
    }
  }, [properties]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const data = await PropertyService.getAll();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdateProperty = async (property: PropertyListing) => {
    try {
      const existing = properties.find(p => p.id === property.id);
      if (existing) {
        await PropertyService.update(property.id, property);
      } else {
        await PropertyService.add(property);
      }
      await loadProperties();
    } catch (error) {
      console.error("Failed to save property:", error);
      throw error;
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await PropertyService.delete(id);
      await loadProperties();
    } catch (error) {
      console.error("Failed to delete property:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home properties={properties} isLoading={loading} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mfa-enroll" element={<MFAEnroll />} />
          <Route path="/mfa-verify" element={<MFAVerify />} />
          <Route path="/add" element={
            <ProtectedRoute>
              <AddListing onAdd={handleAddOrUpdateProperty} />
            </ProtectedRoute>
          } />
          <Route path="/edit/:id" element={
            <ProtectedRoute>
              <AddListing onAdd={handleAddOrUpdateProperty} isEdit />
            </ProtectedRoute>
          } />
          <Route path="/manage" element={
            <ProtectedRoute>
              <ManageListings properties={properties} onUpdate={handleAddOrUpdateProperty} onDelete={handleDeleteProperty} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/item/:id" element={<ItemDetails properties={properties} />} />
          <Route path="/category/:category" element={<CategoryListings properties={properties} />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/sitemap.xml" element={<Sitemap properties={properties} />} />
        </Routes>
      </main>

      <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm space-y-6">
              <div className="flex items-center mb-6">
                <img src={logoUrl} alt="YGB Buy Gold & Sell" className="h-12 w-auto object-contain dark:brightness-100 rounded-lg" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed font-medium">
                Premium Platform for Buying and Selling Gold Items, work directly with <span className="text-primary font-semibold">YGB</span> from <span className="text-primary font-semibold">Start</span> to <span className="text-primary font-semibold">Finish</span> where every investment and client matters.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-12">
              <div className="min-w-[120px]">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-8">Socials</h3>
                <div className="flex gap-4">
                  <a href="https://www.facebook.com/Goldelyn" target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-[#1877F2] group/fb shadow-sm" title="Follow us on Facebook">
                    <svg className="w-6 h-6 fill-zinc-600 dark:fill-zinc-400 group-hover/fb:fill-white transition-colors" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center transition-all duration-500 hover:scale-110 group/insta overflow-hidden relative shadow-sm" title="Follow us on Instagram">
                    <div className="absolute inset-0 opacity-0 group-hover/insta:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)' }}></div>
                    <svg className="w-6 h-6 relative z-10 fill-zinc-600 dark:fill-zinc-400 group-hover/insta:fill-white transition-colors" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.063 1.366-.333 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.063-2.633-.333-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.063-1.366.333-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi YGB,")}`} target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center transition-all duration-500 hover:scale-110 hover:bg-[#25D366] group/wa shadow-sm" title="Contact us on WhatsApp">
                    <svg className="w-6 h-6 fill-zinc-600 dark:fill-zinc-400 group-hover/wa:fill-white transition-colors" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="min-w-[140px]">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-8">Explore</h3>
                <ul className="space-y-4">
                  <li><Link to="/" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">Buy Items</Link></li>
                  <li><Link to="/about" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">Our Story</Link></li>
                </ul>
              </div>

              <div className="min-w-[160px]">
                <h3 className="font-bold text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-8">Management</h3>
                <ul className="space-y-4">
                  <li><Link to="/contact" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">Partner with Us</Link></li>
                  <li><Link to="/login" className="text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors">Admin Portal</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                © 2024 YGB Buy Gold & Sell. Premium Quality.
              </p>
              <div className="flex gap-8">
                <Link to="/privacy-policy" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</Link>
                <Link to="/terms-of-service" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-primary transition-colors">Terms of Service</Link>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                For Website builds like this <Link to="/contact" className="text-primary font-semibold hover:underline">Contact YGB</Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
