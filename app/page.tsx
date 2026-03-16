'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/app/src/utils/supabase/client'

export default function TestConnection() {
  const [status, setStatus] = useState<string>('Checking system health...')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkConnection() {
      // Elegant loading pause
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { error } = await supabase.from('archival_records').select('id').limit(1)
      if (error) {
        setStatus(`Connection failed: ${error.message}`)
        setIsConnected(false)
      } else {
        setStatus('System ready and secure')
        setIsConnected(true)
      }
    }
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-100">
      
      {/* Subtle background gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent pointer-events-none" />

      <div className="z-10 w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-500">
        {/* Branding Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm mb-6 text-2xl">
            📂
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            Archive<span className="text-blue-600 font-light italic">Pro</span>
          </h1>
          <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em]">
            Records Management Interface
          </p>
        </div>

        {/* Connection Card */}
        <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center mb-8">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">System Protocol</span>
            <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border transition-all ${
              isConnected ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className={`text-[11px] font-bold tracking-tight ${isConnected ? 'text-emerald-700' : 'text-slate-500'}`}>
                {status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
              <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Database</p>
              <p className="text-slate-800 text-xs font-black italic uppercase">Supabase</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
              <p className="text-slate-400 text-[9px] font-bold uppercase mb-1">Standard</p>
              <p className="text-slate-800 text-xs font-black italic uppercase">NAP Form 1</p>
            </div>
          </div>

          <Link 
            href="/archive" 
            className={`group flex items-center justify-center w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] transition-all duration-300 ${
              isConnected 
              ? 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98]' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isConnected ? 'Enter Archive System' : 'System Offline'}
            <span className="ml-3 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-10 flex flex-col items-center gap-4 opacity-50">
          <div className="w-12 h-[1px] bg-slate-200" />
          <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">
            Digital Governance Asset
          </p>
        </div>
      </div>
    </div>
  )
}