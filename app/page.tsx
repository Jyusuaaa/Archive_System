'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/app/src/utils/supabase/client'

export default function HomeGateway() {
  const [status, setStatus] = useState<string>('Verifying System Integrity...')
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const supabase = createClient()

  useEffect(() => {
    async function checkConnection() {
      try {
        // Aesthetic delay for "System Check" feel
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        const { error } = await supabase.from('archival_records').select('id').limit(1)
        
        if (error) {
          setStatus(`Offline: ${error.message}`)
          setIsConnected(false)
        } else {
          setStatus('Secure Connection Established')
          setIsConnected(true)
        }
      } catch (err) {
        setStatus('Connection Error: Check Environment Variables')
        setIsConnected(false)
      }
    }
    checkConnection()
  }, [supabase])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      
      {/* Top Security Accent */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-brand" />
      
      <div className="w-full max-w-5xl">
        
        {/* Branding Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="text-left">
            <h1 className="text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">
              Archive<span className="text-brand font-light italic">Pro</span>
            </h1>
            <p className="mt-6 text-slate-400 text-xs font-bold uppercase tracking-[0.6em] ml-1">
              National Records Management System
            </p>
          </div>
          
          <div className="hidden md:block text-right pb-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Node Status</p>
            <p className="text-slate-900 font-mono text-sm font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
              PH-V-ILOILO-SECURE
            </p>
          </div>
        </div>

        {/* Main Security Card */}
        <div className="bg-white border border-slate-200 rounded-archive p-12 md:p-20 shadow-3xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left: System Status */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] block mb-5">Access Protocol</span>
                <div className={`inline-flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all duration-500 ${
                  isConnected ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-sm font-black tracking-tight uppercase">
                    {status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Environment</p>
                  <p className="text-slate-900 text-xl font-bold">Supabase Cloud</p>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Compliance</p>
                  <p className="text-slate-900 text-xl font-bold italic">NAP Form 1-A Ready</p>
                </div>
              </div>
            </div>

            {/* Right: Authorize Action */}
            <div className="lg:col-span-5">
              <Link 
                href="/archive" 
                className={`group relative flex flex-col items-center justify-center w-full h-80 rounded-archive transition-all duration-500 ${
                  isConnected 
                  ? 'bg-slate-900 hover:bg-brand shadow-2xl transform hover:-translate-y-2' 
                  : 'bg-slate-100 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">
                  {isConnected ? '🔓' : '🔒'}
                </div>
                <span className={`text-sm font-black uppercase tracking-[0.4em] ${isConnected ? 'text-white' : 'text-slate-400'}`}>
                  {isConnected ? 'Authorize Access' : 'Secure Encrypted'}
                </span>
                
                <div className="absolute bottom-6 right-8 opacity-10 text-white text-6xl font-black italic">
                  GO
                </div>
              </Link>
            </div>

          </div>
        </div>

        {/* System Footer */}
        <div className="mt-16 flex justify-between items-center opacity-40 px-4">
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
             © 2026 Governance Asset Protection
           </p>
           <p className="text-slate-500 font-mono text-[10px]">PHILIPPINES_V2_STABLE</p>
        </div>
      </div>
    </div>
  )
}