import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  BookOpen, Trophy, BarChart3, Users, PlayCircle, 
  CheckCircle2, ArrowRight, Star, ChevronDown 
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/common/Avatar';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const modulesRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Animations (Entrance)
      const tl = gsap.timeline();
      tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' })
        .from('.hero-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
        .from('.hero-desc', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.6')
        .from('.hero-btns', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4')
        .from('.hero-image-wrapper', { y: 40, opacity: 0, scale: 0.95, duration: 1, ease: 'power4.out' }, '-=0.2');

      // 2. Social Proof
      gsap.from('.social-logo', {
        scrollTrigger: {
          trigger: socialRef.current,
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out'
      });

      // 3. Features
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
        y: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
      });

      // 4. Why GLMS
      gsap.from('.why-text > *', {
        scrollTrigger: {
          trigger: whyRef.current,
          start: 'top 75%',
        },
        x: -30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
      gsap.from('.why-image', {
        scrollTrigger: {
          trigger: whyRef.current,
          start: 'top 75%',
        },
        x: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });

      // 5. Modules
      gsap.from('.module-item', {
        scrollTrigger: {
          trigger: modulesRef.current,
          start: 'top 80%',
        },
        scale: 0.9,
        opacity: 0,
        stagger: 0.05,
        duration: 0.5,
        ease: 'back.out(1.5)'
      });

      // 6. Stats Counter
      gsap.from('.stat-number', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
        },
        innerText: 0,
        duration: 2,
        snap: { innerText: 1 },
        ease: 'power2.out',
        stagger: 0.2
      });
      gsap.from('.stat-label', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 85%',
        },
        y: 10,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.2
      });

      // 7. Footer Animation
      gsap.from('.footer-anim', {
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 95%',
        },
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power2.out'
      });

    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden font-body">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">R</div>
            <span className="font-heading font-bold text-xl tracking-tight">RDIS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#modules" className="hover:text-primary transition-colors">Modules</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to={`/${user?.role.toLowerCase()}`} className="flex items-center gap-3 group">
                <span className="hidden sm:block text-sm font-semibold group-hover:text-primary transition-colors">
                  Go to Dashboard
                </span>
                <Avatar 
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'} 
                  src={user?.avatarUrl || undefined}
                  size="sm"
                />
              </Link>
            ) : (
              <>
                <Link to="/auth/login" className="text-sm font-semibold hover:text-primary transition-colors">Log in</Link>
                <Link to="/auth/register">
                  <Button className="text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section ref={heroRef} className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-sm font-medium mb-8 border border-blue-100 dark:border-blue-800">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          The Future of Learning is Here
        </div>
        
        <h1 className="hero-title font-heading text-5xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1] max-w-4xl mx-auto">
          Make learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">addictive</span> for your students.
        </h1>
        
        <p className="hero-desc text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          A premium Learning Management System that combines powerful academic tools with engaging gamification to boost student success.
        </p>
        
        <div className="hero-btns flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/auth/register">
            <Button size="lg" className="h-14 px-8 text-base text-white">Start for free</Button>
          </Link>
          <a href="#demo">
            <Button size="lg" variant="outline" className="h-14 px-8 text-base gap-2 bg-white dark:bg-slate-900">
              <PlayCircle className="w-5 h-5" />
              Watch Demo
            </Button>
          </a>
        </div>

        <div className="hero-image-wrapper mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-transparent to-transparent z-10 bottom-0 h-1/2 pointer-events-none" />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 aspect-video flex items-center justify-center relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-90"></div>
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"></div>
            <div className="z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-xl flex gap-6 items-center">
               <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg">
                  <Trophy className="text-white w-8 h-8" />
               </div>
               <div className="text-left">
                 <p className="text-sm font-bold text-amber-500 tracking-wider uppercase">Level Up!</p>
                 <h3 className="text-xl font-heading font-bold dark:text-white text-slate-900">Master Scholar</h3>
                 <p className="text-sm text-slate-500">+500 XP Earned</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Social Proof */}
      <section ref={socialRef} className="py-10 border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Trusted by innovative schools worldwide</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock Logos */}
            {['EduTech', 'Learnify', 'AcademyX', 'SkillHub', 'MindForge'].map((logo, i) => (
              <div key={i} className="social-logo flex items-center gap-2 font-heading font-bold text-xl md:text-2xl text-slate-800 dark:text-slate-300">
                <div className="w-6 h-6 bg-slate-800 dark:bg-slate-300 rounded" />
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Features */}
      <section id="features" ref={featuresRef} className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Everything you need to teach effectively.</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">A complete suite of tools designed to reduce admin work and increase student engagement.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <BookOpen className="text-blue-500" />, title: 'Course Builder', desc: 'Create rich, engaging lessons with videos, PDFs, and interactive content.', color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50' },
            { icon: <Trophy className="text-amber-500" />, title: 'Gamification Engine', desc: 'XP, levels, badges, and streaks to keep students motivated and coming back.', color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/50' },
            { icon: <BarChart3 className="text-emerald-500" />, title: 'Advanced Analytics', desc: 'Identify struggling students early with comprehensive performance tracking.', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50' },
          ].map((feature, i) => (
            <div key={i} className={`feature-card rounded-2xl p-8 border bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 border ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-heading mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Why RDIS (Split Layout) */}
      <section ref={whyRef} className="py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div className="why-text space-y-8">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Built for the modern classroom.</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">Traditional LMS platforms are clunky and boring. We built RDIS to feel like the apps students already love using.</p>
            </div>
            
            <ul className="space-y-4">
              {[
                'Beautiful, intuitive interface',
                'Blazing fast performance',
                'Mobile-first responsive design',
                'Real-time progress tracking'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 className="text-primary w-5 h-5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="outline" className="gap-2">
              Learn more about our design <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="why-image relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-indigo-500/20 rounded-2xl blur-3xl" />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 shadow-xl">
              <div className="rounded-xl overflow-hidden aspect-[4/3] relative">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Students using RDIS in a modern classroom" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-slate-900/10 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modules Grid */}
      <section id="modules" ref={modulesRef} className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Everything is connected.</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">Our modular architecture means data flows seamlessly between classes, gamification, and analytics.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'Classes & Subjects', 'Course Builder', 'Video Lessons', 'Assignments',
            'Quiz Engine', 'Automated Grading', 'Attendance Tracking', 'XP & Levels',
            'Badges & Streaks', 'Leaderboards', 'Analytics', 'Role Management'
          ].map((module, i) => (
            <div key={i} className="module-item p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center font-medium text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors cursor-default">
              {module}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Statistics / Impact */}
      <section ref={statsRef} className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-bold font-number mb-2"><span className="stat-number">98</span>%</div>
              <div className="stat-label text-blue-100 font-medium">Student Completion Rate</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-bold font-number mb-2"><span className="stat-number">45</span>%</div>
              <div className="stat-label text-blue-100 font-medium">Increase in Engagement</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-bold font-number mb-2"><span className="stat-number">12</span>hrs</div>
              <div className="stat-label text-blue-100 font-medium">Saved per Teacher / Week</div>
            </div>
            <div className="py-4 md:py-0">
              <div className="text-4xl md:text-5xl font-bold font-number mb-2"><span className="stat-number">2.5</span>x</div>
              <div className="stat-label text-blue-100 font-medium">Faster Grading</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer ref={footerRef} className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 footer-anim">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl">R</div>
                <span className="font-heading font-bold text-xl tracking-tight">RDIS</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                A premium Learning Management System designed to make education addictive, engaging, and powerful for both students and teachers.
              </p>
            </div>
            
            <div className="footer-anim">
              <h4 className="font-heading font-semibold mb-4 text-slate-900 dark:text-white">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            
            <div className="footer-anim">
              <h4 className="font-heading font-semibold mb-4 text-slate-900 dark:text-white">Resources</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            <div className="footer-anim">
              <h4 className="font-heading font-semibold mb-4 text-slate-900 dark:text-white">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-anim pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Rukmani Devi International School / RDIS. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
