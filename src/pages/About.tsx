import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO.tsx';

const About: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <SEO
        title="About Yhen - Expert Gold Merchant in the Philippines | YGB Gold"
        description="Meet Yhen Oria, founder of YGB Gold. Offering boutique personal service for buying and selling premium gold, coins, and precious metals in the Philippines."
        url="https://ygbgold.com/about"
      />
      <div className="w-full bg-white dark:bg-zinc-950 min-h-screen">
      {/* Signature Split Hero Section */}
      <section className="flex flex-col lg:flex-row h-auto lg:h-[600px]">

        {/* Left Side: Editorial Portrait */}
        <div className="w-full lg:w-1/2 h-[300px] lg:h-full relative bg-zinc-900 group flex items-center justify-center overflow-hidden">
          <img
            src="/Image/White_suit_manila_background_for_about_pic_720p_.png"
            alt="Yhen - Property Pro Founder"
            loading="eager"
            width="1280"
            height="720"
            className={`w-full h-full object-cover object-center transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
            onLoad={() => setIsLoaded(true)}
          />

          {/* Luxury cinematic overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>

          {/* Portrait Label - Glassmorphism */}
          <div className="absolute bottom-12 left-12 z-20 hidden md:block">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[40px] shadow-2xl max-w-xs ring-1 ring-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-zinc-900 shadow-lg">
                  <span className="material-icons text-2xl font-bold">verified</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">Yhen</h2>
                  <p className="text-primary font-bold text-[9px] uppercase tracking-[0.3em]">Founder & Director</p>
                </div>
              </div>
              <p className="text-white/70 text-sm leading-relaxed font-medium italic">
                "A proud driven Morena with 10 years selling authentic gold jewelry — shipping across the Philippines and worldwide, where my local roots meet global standards."
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Editorial Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 lg:p-20 bg-zinc-50 dark:bg-zinc-900 relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

          <div className="relative z-10 text-center">
            <h1 className="sr-only">About YGB Gold - Boutique Personal Driven Expertise</h1>
            <div className="flex items-center justify-center gap-6 md:gap-8 mb-12">
              <div className="w-1 bg-primary" style={{height: '240px'}}></div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight" aria-hidden="true">
                <span className="text-primary italic">Boutique</span> <br />
                <span className="dark:text-white">Personal</span> <br />
                <span className="text-primary italic">Driven</span> <br />
                <span className="dark:text-white">Expertise</span>
              </div>
              <div className="w-1 bg-primary" style={{height: '240px'}}></div>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:gap-10 border-t border-primary/20 pt-8">
              <div>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-black dark:text-white tracking-tighter">10 Years</h4>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black mt-1 sm:mt-2">Experience</p>
              </div>
              <div>
                <h4 className="text-2xl sm:text-3xl md:text-4xl font-black dark:text-white tracking-tighter">Gold Specialist</h4>
                <p className="text-[9px] sm:text-[10px] text-zinc-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-black mt-1 sm:mt-2">Expert Precious Metals Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="w-full bg-white dark:bg-zinc-950 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20">
          <div className="space-y-6">
            <p className="text-xl md:text-2xl text-primary dark:text-primary font-bold leading-relaxed tracking-tight mb-8 italic">
              "Specialising in helping clients secure, verify, and liquidate gold investments since 2019."
            </p>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium tracking-tight">
              As the founder of YGB Gold, Yhen Oria is a dedicated force in the precious metals industry, committed to bridging the gap between high-value bullion and the people seeking to secure their wealth.
            </p>
            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium tracking-tight">
              With a sharp eye for market potential and a reputation for integrity, she provides clients with a seamless, end-to-end experience—whether they are searching for investment-grade coins or liquidating a strategic gold portfolio.
            </p>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium tracking-tight">
              Beyond the trade, Yhen's expertise is bolstered by her role as a serial entrepreneur, where she manages multiple premium service portfolios.
            </p>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium tracking-tight">
              Supported by her diverse background as a serial entrepreneur—including her leadership at YGB Gold Buy & Sell—Yhen brings a high-level, "hands-on" approach to every transaction.
            </p>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default About;
