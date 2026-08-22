'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, User, Phone, FileText, Plus, Edit2, Trash2, CheckCircle, XCircle, Ban, RefreshCw, Search, X } from 'lucide-react'
import { useApp } from '@/app/providers'

interface Appointment {
  id: string
  patientName: string
  patientPhone: string
  date: string
  time: string
  duration: number
  notes: string
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-yellow-100 text-yellow-800',
  rescheduled: 'bg-purple-100 text-purple-800',
}

export default function AppointmentsPage() {
  const { t } = useApp()
  const ap = t.appointments
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showModal, setShowModal] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [formData, setFormData] = useState({ patientName: '', patientPhone: '', date: new Date().toISOString().split('T')[0], time: '09:00', duration: 30, notes: '', status: 'scheduled' })
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments')
      if (res.ok) setAppointments(await res.json())
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const filtered = appointments
    .filter(a => a.date === selectedDate)
    .filter(a => a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || a.patientPhone.includes(searchQuery))
    .sort((a, b) => a.time.localeCompare(b.time))

  const grouped = filtered.reduce<Record<string, Appointment[]>>((acc, apt) => {
    const hour = apt.time.substring(0, 2)
    if (!acc[hour]) acc[hour] = []
    acc[hour].push(apt)
    return acc
  }, {})

  const openCreate = () => {
    setEditingAppointment(null)
    setFormData({ patientName: '', patientPhone: '', date: selectedDate, time: '09:00', duration: 30, notes: '', status: 'scheduled' })
    setShowModal(true)
  }

  const openEdit = (apt: Appointment) => {
    setEditingAppointment(apt)
    setFormData({ patientName: apt.patientName, patientPhone: apt.patientPhone, date: apt.date, time: apt.time, duration: apt.duration, notes: apt.notes, status: apt.status })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editingAppointment ? `/api/appointments/${editingAppointment.id}` : '/api/appointments'
      const method = editingAppointment ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { setShowModal(false); fetchAppointments() }
    } catch {} finally { setSaving(false) }
  }

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/appointments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    if (res.ok) fetchAppointments()
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('Delete this appointment?')) return
    const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    if (res.ok) fetchAppointments()
  }

  const statusLabel = (status: string) => ap.scheduled + ' ' // use translation lookup
  const formatDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">{ap.title}</h1>
        <button onClick={openCreate} className="btn btn-primary"><Plus size={18} />{ap.schedule}</button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label className="label">{ap.date}</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="input" />
          </div>
          <div className="flex-1 w-full sm:w-auto">
            <label className="label">{ap.patientName}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={`${ap.patientName}...`} className="input pl-10" />
            </div>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">{formatDate(selectedDate)}</p>
      </div>

      {loading ? (
        <div className="card p-8 text-center text-gray-500">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p>{ap.noAppointments}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([hour, apts]) => (
            <div key={hour}>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><Clock size={18} />{hour}:00</h2>
              <div className="space-y-3">
                {apts.map(apt => (
                  <div key={apt.id} className="card p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-semibold">{apt.patientName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[apt.status] || ''}`}>
                            {ap[apt.status as keyof typeof ap] || apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} /><span>{apt.patientPhone}</span></div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1"><Clock size={14} />{apt.time}</span>
                          <span>{apt.duration} min</span>
                        </div>
                        {apt.notes && <div className="flex items-start gap-2 text-sm text-gray-600"><FileText size={14} className="mt-0.5 shrink-0" /><span>{apt.notes}</span></div>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {apt.status === 'scheduled' && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'completed')} className="btn btn-success text-xs"><CheckCircle size={14} />{ap.completed}</button>
                            <button onClick={() => updateStatus(apt.id, 'cancelled')} className="btn btn-danger text-xs"><XCircle size={14} />{ap.cancelled}</button>
                            <button onClick={() => updateStatus(apt.id, 'no_show')} className="btn btn-secondary text-xs"><Ban size={14} />{ap.no_show}</button>
                            <button onClick={() => updateStatus(apt.id, 'rescheduled')} className="btn btn-secondary text-xs"><RefreshCw size={14} />{ap.rescheduled}</button>
                          </>
                        )}
                        <button onClick={() => openEdit(apt)} className="btn btn-secondary text-xs"><Edit2 size={14} />{ap.edit}</button>
                        <button onClick={() => deleteAppointment(apt.id)} className="btn btn-danger text-xs"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{editingAppointment ? ap.edit : ap.schedule}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">{ap.patientName}</label><input type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} className="input" required /></div>
              <div><label className="label">{ap.patientPhone}</label><input type="tel" value={formData.patientPhone} onChange={e => setFormData({...formData, patientPhone: e.target.value})} className="input" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">{ap.date}</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="input" required /></div>
                <div><label className="label">{ap.time}</label><input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="input" required /></div>
              </div>
              <div>
                <label className="label">{ap.duration} (min)</label>
                <select value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} className="input">
                  <option value={15}>15</option><option value={30}>30</option><option value={45}>45</option><option value={60}>60</option><option value={90}>90</option>
                </select>
              </div>
              {editingAppointment && (
                <div>
                  <label className="label">{ap.status}</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input">
                    <option value="scheduled">{ap.scheduled}</option><option value="completed">{ap.completed}</option><option value="cancelled">{ap.cancelled}</option><option value="no_show">{ap.no_show}</option><option value="rescheduled">{ap.rescheduled}</option>
                  </select>
                </div>
              )}
              <div><label className="label">{ap.notes}</label><textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input" rows={3} /></div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">{t.common.cancel}</button>
                <button type="submit" disabled={saving} className="btn btn-primary">{saving ? '...' : ap.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
