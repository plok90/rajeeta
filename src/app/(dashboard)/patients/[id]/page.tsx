'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/app/providers';
import {
  User, Phone, Calendar, FileText, Edit2, Archive, Trash2, RotateCcw,
  ChevronLeft, Clock, Stethoscope, AlertTriangle, Loader2, Save, X, Grid3X3,
  History, Stethoscope as VisitIcon
} from 'lucide-react';

interface ToothStatus {
  number: number;
  status: string;
  notes: string;
}

interface Visit {
  id: string;
  date: string;
  treatments: string[];
  notes: string;
  cost: number;
}

interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  details: string;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  age: number;
  firstVisit: string;
  allergies: string;
  medicalNotes: string;
  notes: string;
  archived: boolean;
  dentalChart: ToothStatus[];
  visits: Visit[];
  history: HistoryEntry[];
}

const toothStatusColors: Record<string, string> = {
  healthy: 'bg-green-100 border-green-500 text-green-700',
  cavity: 'bg-red-100 border-red-500 text-red-700',
  filled: 'bg-blue-100 border-blue-500 text-blue-700',
  crown: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  missing: 'bg-gray-200 border-gray-500 text-gray-500',
  extracted: 'bg-gray-300 border-gray-600 text-gray-600',
  rootCanal: 'bg-purple-100 border-purple-500 text-purple-700',
  implant: 'bg-cyan-100 border-cyan-500 text-cyan-700',
};

export default function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t, locale, dir } = useApp();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dental' | 'visits' | 'history'>('dental');
  const [editData, setEditData] = useState<Partial<Patient>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchPatient = async () => {
    try {
      const res = await fetch(`/api/patients/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPatient(data);
      setEditData(data);
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatient(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setPatient(data);
      setEditData(data);
      setEditing(false);
    } catch {
      setError(t.common.error);
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (archive: boolean) => {
    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: archive }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setPatient(data);
      setEditData(data);
    } catch {
      setError(t.common.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t.common.confirm)) return;
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
      window.location.href = '/patients';
    } catch {
      setError(t.common.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="card p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Link href="/patients" className="btn btn-primary mt-4 inline-flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" /> {t.common.back}
        </Link>
      </div>
    );
  }

  if (!patient) return null;

  const upperTeeth = patient.dentalChart?.filter((tooth) => tooth.number <= 16) || [];
  const lowerTeeth = patient.dentalChart?.filter((tooth) => tooth.number > 16) || [];

  return (
    <div className={`space-y-6 ${dir === 'rtl' ? 'rtl' : ''}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/patients" className="btn btn-secondary p-2">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{patient.name}</h1>
          {patient.archived && (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">
              {t.patients.archived}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.common.save}
              </button>
              <button
                onClick={() => { setEditing(false); setEditData(patient); setError(''); }}
                className="btn btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" /> {t.common.cancel}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="btn btn-secondary flex items-center gap-2">
                <Edit2 className="w-4 h-4" /> {t.common.edit}
              </button>
              {patient.archived ? (
                <button onClick={() => handleArchive(false)} className="btn btn-primary flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> {t.patients.restore}
                </button>
              ) : (
                <button onClick={() => handleArchive(true)} className="btn btn-secondary flex items-center gap-2">
                  <Archive className="w-4 h-4" /> {t.patients.archive}
                </button>
              )}
              <button onClick={handleDelete} className="btn btn-danger flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> {t.common.delete}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="min-w-0">
                {editing ? (
                  <input
                    value={editData.name || ''}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="input text-lg font-bold w-full"
                  />
                ) : (
                  <h2 className="text-lg font-bold truncate">{patient.name}</h2>
                )}
                <p className="text-sm text-gray-500">{t.patients.patientId}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {t.patients.phoneNumber}
                </label>
                {editing ? (
                  <input
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-sm">{patient.phone}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <User className="w-4 h-4" /> {t.patients.gender}
                </label>
                {editing ? (
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="input w-full"
                  >
                    <option value="male">{t.patients.male}</option>
                    <option value="female">{t.patients.female}</option>
                  </select>
                ) : (
                  <p className="text-sm capitalize">{patient.gender}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t.patients.dateOfBirth}
                </label>
                {editing ? (
                  <input
                    type="date"
                    value={editData.dateOfBirth?.slice(0, 10) || ''}
                    onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-sm">{new Date(patient.dateOfBirth).toLocaleDateString(locale)}</p>
                )}
              </div>

              <div>
                <label className="label">{t.patients.age}</label>
                <p className="text-sm">
                  {patient.age}
                </p>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t.patients.firstVisitDate}
                </label>
                <p className="text-sm">{new Date(patient.firstVisit).toLocaleDateString(locale)}</p>
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {t.patients.allergies}
                </label>
                {editing ? (
                  <textarea
                    value={editData.allergies || ''}
                    onChange={(e) => setEditData({ ...editData, allergies: e.target.value })}
                    className="input w-full"
                    rows={2}
                  />
                ) : (
                  <p className="text-sm">{patient.allergies || '-'}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" /> {t.patients.medicalNotes}
                </label>
                {editing ? (
                  <textarea
                    value={editData.medicalNotes || ''}
                    onChange={(e) => setEditData({ ...editData, medicalNotes: e.target.value })}
                    className="input w-full"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{patient.medicalNotes || '-'}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center gap-2">
                  <FileText className="w-4 h-4" /> {t.patients.generalNotes}
                </label>
                {editing ? (
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    className="input w-full"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{patient.notes || '-'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 border-b border-gray-200">
            {(['dental', 'visits', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-4 py-2.5 font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'dental' && <Grid3X3 className="w-4 h-4" />}
                {tab === 'visits' && <VisitIcon className="w-4 h-4" />}
                {tab === 'history' && <History className="w-4 h-4" />}
                {tab === 'dental'
                  ? t.dentalChart.title
                  : tab === 'visits'
                  ? t.patients.visits
                  : t.patients.history}
              </button>
            ))}
          </div>

          {activeTab === 'dental' && (
            <div className="card p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{t.dentalChart.title}</h3>
                <Link
                  href={`/patients/${id}/dental-chart`}
                  className="btn btn-primary text-sm flex items-center gap-1"
                >
                  <Grid3X3 className="w-4 h-4" /> {t.dentalChart.selectTooth}
                </Link>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                    {t.dentalChart.upperRight}
                  </p>
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                    {upperTeeth.map((tooth) => (
                      <Link
                        key={tooth.number}
                        href={`/patients/${id}/dental-chart?tooth=${tooth.number}`}
                        className={`relative border-2 rounded-lg p-1.5 text-center text-xs font-medium transition-all hover:scale-105 hover:shadow-md ${
                          toothStatusColors[tooth.status] || 'bg-gray-50 border-gray-300'
                        }`}
                        title={`${t.dentalChart.selectTooth} ${tooth.number} - ${tooth.status}${tooth.notes ? ': ' + tooth.notes : ''}`}
                      >
                        <span className="block text-[10px] leading-tight">{tooth.number}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">
                    {t.dentalChart.lowerLeft}
                  </p>
                  <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5">
                    {lowerTeeth.map((tooth) => (
                      <Link
                        key={tooth.number}
                        href={`/patients/${id}/dental-chart?tooth=${tooth.number}`}
                        className={`relative border-2 rounded-lg p-1.5 text-center text-xs font-medium transition-all hover:scale-105 hover:shadow-md ${
                          toothStatusColors[tooth.status] || 'bg-gray-50 border-gray-300'
                        }`}
                        title={`${t.dentalChart.selectTooth} ${tooth.number} - ${tooth.status}${tooth.notes ? ': ' + tooth.notes : ''}`}
                      >
                        <span className="block text-[10px] leading-tight">{tooth.number}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
                  {Object.entries(toothStatusColors).map(([status, colorClass]) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded border-2 ${colorClass}`} />
                      <span className="text-xs text-gray-600 capitalize">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'visits' && (
            <div className="card p-5">
              <h3 className="font-semibold text-lg mb-4">{t.patients.visits}</h3>
              {!patient.visits?.length ? (
                <p className="text-gray-500 text-sm">{t.common.noData}</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-6">
                    {patient.visits.map((visit) => (
                      <div key={visit.id} className="relative pl-10">
                        <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white shadow" />
                        <div className="card p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-primary">
                              {new Date(visit.date).toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            {visit.cost > 0 && (
                              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                                {visit.cost.toLocaleString(locale)}
                              </span>
                            )}
                          </div>
                          {visit.treatments?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {visit.treatments.map((treatment, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium"
                                >
                                  {treatment}
                                </span>
                              ))}
                            </div>
                          )}
                          {visit.notes && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{visit.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="card p-5">
              <h3 className="font-semibold text-lg mb-4">{t.patients.history}</h3>
              {!patient.history?.length ? (
                <p className="text-gray-500 text-sm">{t.common.noData}</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {patient.history.map((entry) => (
                      <div key={entry.id} className="relative pl-10">
                        <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow" />
                        <div className="card p-4">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-semibold">
                              {entry.action}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(entry.date).toLocaleDateString(locale, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {entry.details && (
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{entry.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
