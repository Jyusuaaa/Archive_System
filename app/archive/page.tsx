'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/app/src/utils/supabase/client'
import * as XLSX from 'xlsx'

export default function ArchiveSystem() {
  const supabase = createClient()
  
  // App Logic States
  const [viewMode, setViewMode] = useState<'active' | 'backup'>('active')
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // Search & Filter States
  const [search, setSearch] = useState('')
  const [timeFilter, setTimeFilter] = useState('All')
  const [utilityFilter, setUtilityFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedYear, setSelectedYear] = useState('All')

  const years = Array.from({ length: 21 }, (_, i) => (2010 + i).toString())

  const fetchRecords = async () => {
    setLoading(true)
    const tableName = viewMode === 'active' ? 'archival_records' : 'archival_records_backup'
    
    let query = supabase.from(tableName).select('*')

    if (timeFilter !== 'All') query = query.eq('time_value', timeFilter)
    if (utilityFilter !== 'All') query = query.eq('utility_value', utilityFilter)

    if (selectedYear !== 'All') {
      query = query
        .gte('date_prepared', `${selectedYear}-01-01`)
        .lte('date_prepared', `${selectedYear}-12-31`)
    }

    if (search.trim()) {
      const term = `%${search.trim()}%`
      query = query.or(`office_name.ilike.${term},series_title_description.ilike.${term}`)
    }

    query = query.order('date_prepared', { ascending: sortOrder === 'asc' })
    const { data, error } = await query
    
    if (!error) setRecords(data || [])
    setLoading(false)
  }

  useEffect(() => {
    const handler = setTimeout(() => { fetchRecords() }, 400) 
    return () => clearTimeout(handler)
  }, [search, timeFilter, utilityFilter, sortOrder, selectedYear, viewMode])

  const handleBulkDelete = async () => {
    if (viewMode === 'backup') {
        if (!confirm("Permanently delete these items from backup? This cannot be undone.")) return
    } else {
        if (!confirm(`Move ${selectedIds.length} items to backup?`)) return
    }
    
    setLoading(true)

    if (viewMode === 'active') {
      const itemsToBackup = records.filter(r => selectedIds.includes(r.id))
      const { error: backupError } = await supabase.from('archival_records_backup').insert(itemsToBackup)

      if (!backupError) {
        await supabase.from('archival_records').delete().in('id', selectedIds)
      }
    } else {
      await supabase.from('archival_records_backup').delete().in('id', selectedIds)
    }

    setSelectedIds([])
    fetchRecords()
    setLoading(false)
  }

  const handleRestore = async () => {
    if (!confirm(`Restore ${selectedIds.length} items to active inventory?`)) return
    setLoading(true)
    
    const itemsToRestore = records.filter(r => selectedIds.includes(r.id))
    const { error: restoreError } = await supabase.from('archival_records').insert(itemsToRestore)

    if (!restoreError) {
      await supabase.from('archival_records_backup').delete().in('id', selectedIds)
      setSelectedIds([])
      fetchRecords()
    }
    setLoading(false)
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(records.map((r) => r.id))
    else setSelectedIds([])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const bstr = evt.target?.result
      const wb = XLSX.read(bstr, { type: 'binary' })
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      const { error } = await supabase.from('archival_records').insert(data)
      if (error) alert("Upload Error.")
      else fetchRecords()
    }
    reader.readAsBinaryString(file)
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(records)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, viewMode === 'active' ? "Archive" : "Backup")
    XLSX.writeFile(wb, `${viewMode}_Export_${selectedYear}.xlsx`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Archive<span className="text-blue-600 font-light not-italic">Pro</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <button 
              onClick={() => {setViewMode('active'); setSelectedIds([]);}}
              className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase transition ${viewMode === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              Active Inventory
            </button>
            <button 
              onClick={() => {setViewMode('backup'); setSelectedIds([]);}}
              className={`text-[10px] px-3 py-1 rounded-full font-black tracking-widest uppercase transition ${viewMode === 'backup' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-500'}`}
            >
              Backup / Trash
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          {/* CONDITIONALLY RENDER IMPORT BUTTON */}
          {viewMode === 'active' && (
            <>
              <input type="file" id="xl-input" className="hidden" onChange={handleFileUpload} accept=".xlsx" />
              <label htmlFor="xl-input" className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 font-bold transition text-sm shadow-sm">
                Import Excel
              </label>
            </>
          )}
          
          <button onClick={exportToExcel} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 font-bold shadow-lg transition text-sm">
            Export {viewMode === 'active' ? 'Archive' : 'Backup'}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="md:col-span-2 relative">
          <input 
            className="w-full p-3.5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition bg-white pl-11 shadow-sm font-medium"
            placeholder={`Search ${viewMode === 'active' ? 'Inventory' : 'Deleted Files'}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="absolute left-4 top-4 text-slate-400">🔍</span>
        </div>

        <select className="p-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600 bg-white shadow-sm outline-none cursor-pointer" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="All">All Years</option>
          {years.map(year => <option key={year} value={year}>{year}</option>)}
        </select>

        <select className="p-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600 bg-white shadow-sm outline-none cursor-pointer" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
          <option value="All">Retention</option>
          <option value="T">T - Temporary</option>
          <option value="P">P - Permanent</option>
        </select>

        <select className="p-3.5 border border-slate-200 rounded-2xl font-bold text-slate-600 bg-white shadow-sm outline-none cursor-pointer" value={utilityFilter} onChange={(e) => setUtilityFilter(e.target.value)}>
          <option value="All">Utility</option>
          <option value="Adm">Adm</option>
          <option value="F">Fiscal</option>
          <option value="L">Legal</option>
          <option value="Arc">Archival</option>
        </select>
      </div>

      {/* Table Area */}
      <div className={`bg-white rounded-3xl shadow-xl border overflow-hidden ${viewMode === 'backup' ? 'border-rose-100' : 'border-slate-100'}`}>
        <div className="p-5 bg-white border-b flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest ${viewMode === 'backup' ? 'text-rose-400' : 'text-slate-400'}`}>
            {records.length} {viewMode === 'active' ? 'Active Records' : 'Backed Up Records'}
          </span>
          <div className="flex gap-2">
            {selectedIds.length > 0 && viewMode === 'backup' && (
                <button onClick={handleRestore} className="bg-green-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-green-700 transition shadow-lg flex items-center gap-2">
                    🔄 RESTORE ({selectedIds.length})
                </button>
            )}
            {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete} className="bg-rose-500 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-rose-600 transition shadow-lg flex items-center gap-2">
                    🗑️ {viewMode === 'active' ? 'MOVE TO BACKUP' : 'PERMANENT DELETE'} ({selectedIds.length})
                </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
                <th className="p-5 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" onChange={handleSelectAll} checked={selectedIds.length === records.length && records.length > 0}/>
                </th>
                <th className="p-5">Year</th>
                <th className="p-5">Office</th>
                <th className="p-5">Description</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-right">Utility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-24 text-center text-slate-300 font-black animate-pulse">PROCESSING...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="p-24 text-center text-slate-400 font-medium italic">Folder is empty.</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="p-5 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded accent-blue-600" checked={selectedIds.includes(r.id)} onChange={() => setSelectedIds(prev => prev.includes(r.id) ? prev.filter(i => i !== r.id) : [...prev, r.id])}/>
                  </td>
                  <td className="p-5 text-sm font-bold text-slate-900">{r.date_prepared ? new Date(r.date_prepared).getFullYear() : '---'}</td>
                  <td className="p-5 font-black text-slate-700 text-sm">{r.office_name}</td>
                  <td className="p-5 text-sm text-slate-600">{r.series_title_description?.split(':')[0]}</td>
                  <td className="p-5 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${r.time_value === 'P' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {r.time_value === 'P' ? 'PERMANENT' : 'TEMPORARY'}
                    </span>
                  </td>
                  <td className="p-5 text-right text-[11px] font-black text-slate-400 uppercase">{r.utility_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}