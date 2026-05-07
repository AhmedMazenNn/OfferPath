import { Chrome, ExternalLink, ShieldCheck, Zap, MousePointerClick } from 'lucide-react'
import { motion } from 'framer-motion'

export function ChromeExtensionBanner() {
  const extensionUrl = 'https://chromewebstore.google.com/detail/aghiahnclkjpcmdiebhpajhhbelndcmg?utm_source=item-share-cb'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-violet-600 opacity-90 transition-transform group-hover:scale-105 duration-700" />
      
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
            <Chrome className="w-3.5 h-3.5" />
            <span>Browser Extension</span>
          </div>
          
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight leading-none mb-3">
              Supercharge Your Search
            </h2>
            <p className="text-primary-100 font-medium max-w-xl text-sm md:text-base leading-relaxed">
              Automate your job application tracking directly from LinkedIn and other job boards. 
              Save time, eliminate manual data entry, and never lose track of an opportunity again.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">One-Click Save</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Secure Sync</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Auto-Detect</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <a
            href={extensionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group/btn relative inline-flex items-center gap-3 px-8 py-5 bg-white text-primary-600 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-black/20 hover:shadow-white/20 hover:-translate-y-1 transition-all duration-300"
          >
            Add to Chrome
            <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
