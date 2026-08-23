import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  Link,
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Patient = {
  id: number;
  name: string;
  phone: string;
  age: number;
  gender: string;
  lastVisit: string;
  nextVisit: string;
  status: 'نشط' | 'متابعة' | 'غير نشط';
};

type Appointment = {
  id: number;
  time: string;
  patient: string;
  initials: string;
  type: string;
  status: 'مؤكد' | 'بانتظار التأكيد' | 'مكتمل';
  day: number;
  color?: string;
};

type Treatment = {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: string;
  icon: 'tooth' | 'spark' | 'shield' | 'activity' | 'file' | 'stethoscope';
};

let patientsStore: Patient[] = [
  { id: 101, name: 'سارة عبدالله', phone: '050 321 8841', age: 29, gender: 'أنثى', lastVisit: '12 مايو 2024', nextVisit: '18 يونيو 2024', status: 'نشط' },
  { id: 102, name: 'محمد العتيبي', phone: '055 762 1190', age: 41, gender: 'ذكر', lastVisit: '04 مايو 2024', nextVisit: '—', status: 'متابعة' },
  { id: 103, name: 'نورة الحربي', phone: '053 408 2291', age: 34, gender: 'أنثى', lastVisit: '28 أبريل 2024', nextVisit: '21 يونيو 2024', status: 'نشط' },
  { id: 104, name: 'خالد المطيري', phone: '056 872 1034', age: 52, gender: 'ذكر', lastVisit: '16 أبريل 2024', nextVisit: '—', status: 'غير نشط' },
  { id: 105, name: 'ريم السالم', phone: '054 119 7302', age: 26, gender: 'أنثى', lastVisit: '09 أبريل 2024', nextVisit: '25 يونيو 2024', status: 'نشط' },
  { id: 106, name: 'عبدالرحمن الزهراني', phone: '050 640 3388', age: 38, gender: 'ذكر', lastVisit: '02 أبريل 2024', nextVisit: '—', status: 'متابعة' },
];

let treatmentStore: Treatment[] = [
  { id: 1, name: 'فحص وتشخيص شامل', description: 'فحص سريري شامل مع الأشعة والتوصيات العلاجية.', price: '180 ر.س', duration: '30 دقيقة', icon: 'stethoscope' },
  { id: 2, name: 'تنظيف وتلميع الأسنان', description: 'إزالة الجير والتصبغات للحفاظ على ابتسامة صحية.', price: '260 ر.س', duration: '45 دقيقة', icon: 'spark' },
  { id: 3, name: 'حشوة تجميلية', description: 'ترميم الأسنان المتضررة بلون مطابق للأسنان الطبيعية.', price: '450 ر.س', duration: '60 دقيقة', icon: 'tooth' },
  { id: 4, name: 'تبييض الأسنان', description: 'جلسة تبييض احترافية آمنة بإشراف الطبيب.', price: '950 ر.س', duration: '75 دقيقة', icon: 'shield' },
  { id: 5, name: 'علاج عصب السن', description: 'تنظيف القنوات وحفظ السن من الخلع مع حشوة مؤقتة.', price: '1,250 ر.س', duration: '90 دقيقة', icon: 'activity' },
  { id: 6, name: 'تركيب تاج خزفي', description: 'تاج متين بمظهر طبيعي لاستعادة وظيفة وشكل السن.', price: '1,850 ر.س', duration: 'موعدان', icon: 'file' },
];

const appointments: Appointment[] = [
  { id: 1, time: '09:00', patient: 'سارة عبدالله', initials: 'س ع', type: 'فحص دوري', status: 'مؤكد', day: 0 },
  { id: 2, time: '10:30', patient: 'محمد العتيبي', initials: 'م ع', type: 'حشوة تجميلية', status: 'بانتظار التأكيد', day: 0, color: 'coral' },
  { id: 3, time: '12:00', patient: 'نورة الحربي', initials: 'ن ح', type: 'تنظيف أسنان', status: 'مؤكد', day: 0 },
  { id: 4, time: '14:00', patient: 'ريم السالم', initials: 'ر س', type: 'متابعة علاج', status: 'مكتمل', day: 0, color: 'gold' },
  { id: 5, time: '10:00', patient: 'خالد المطيري', initials: 'خ م', type: 'استشارة زراعة', status: 'مؤكد', day: 1 },
  { id: 6, time: '11:30', patient: 'ليان القحطاني', initials: 'ل ق', type: 'تبييض الأسنان', status: 'مؤكد', day: 2 },
];

const navItems = [
  { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/patients', label: 'المرضى', icon: Users },
  { href: '/appointments', label: 'المواعيد', icon: CalendarDays },
  { href: '/dental-chart', label: 'مخطط الأسنان', icon: Activity },
  { href: '/treatments', label: 'العلاجات', icon: ClipboardList },
  { href: '/reports', label: 'التقارير', icon: BarChart3 },
];

const pageTitles: Record<string, string> = {
  '/': 'نظرة عامة',
  '/patients': 'سجل المرضى',
  '/patients/new': 'إضافة مريض جديد',
  '/appointments': 'المواعيد',
  '/dental-chart': 'مخطط الأسنان',
  '/treatments': 'دليل العلاجات',
  '/reports': 'التقارير والأداء',
  '/settings': 'إعدادات العيادة',
};

function Initials({ name, className = '' }: { name: string; className?: string }) {
  return <span className={`avatar ${className}`} data-testid={`avatar-${name}`}>{name.split(' ').slice(0, 2).map((part) => part[0]).join('')}</span>;
}

function StatusPill({ status }: { status: Patient['status'] | Appointment['status'] }) {
  const tone = status === 'مؤكد' || status === 'نشط' ? 'confirmed' : status === 'مكتمل' ? 'completed' : status === 'غير نشط' ? 'cancelled' : 'waiting';
  return <span className={`status-pill ${tone}`} data-testid={`status-${status}`}>{status}</span>;
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = pageTitles[location] ?? 'نظرة عامة';
  return (
    <div className="app-shell" dir="rtl">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`} data-testid="sidebar">
        <div className="brand">
          <div className="brand-mark"><HeartPulse /></div>
          <div><strong>راجيتا</strong><span>إدارة عيادة الأسنان</span></div>
        </div>
        <div className="nav-label">مساحة العمل</div>
        <nav className="nav-list" aria-label="التنقل الرئيسي">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-item ${location === href ? 'active' : ''}`} data-testid={`link-nav-${label}`}>
              <Icon /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="nav-label">الإدارة</div>
        <Link href="/settings" className={`nav-item ${location === '/settings' ? 'active' : ''}`} data-testid="link-nav-settings"><Settings /><span>الإعدادات</span></Link>
        <div className="sidebar-spacer" />
        <div className="sidebar-user">
          <Initials name="د س" />
          <div><strong>د. سارة العبدالله</strong><small>طبيبة أسنان</small></div>
          <MoreHorizontal size={16} color="#80a6a4" />
        </div>
      </aside>
      {mobileOpen && <button className="modal-backdrop" style={{ zIndex: 15, background: 'rgba(23,56,67,.2)' }} onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" data-testid="button-close-menu" />}
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="فتح القائمة" data-testid="button-open-menu"><Menu size={17} /></button>
          <div className="breadcrumbs"><span>راجيتا</span><ChevronLeft size={12} /><b>{current}</b></div>
          <div className="top-actions">
            <button className="lang-button" onClick={() => alert('واجهة اللغة الإنجليزية ستتوفر قريباً')} data-testid="button-language">EN&nbsp; / &nbsp;العربية</button>
            <button className="icon-button notification" aria-label="الإشعارات" onClick={() => alert('لا توجد إشعارات جديدة')} data-testid="button-notifications"><Bell size={16} /></button>
            <Initials name="سارة" className="mini-avatar" />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, note, action }: { eyebrow: string; title: string; note?: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{note && <p className="heading-note">{note}</p>}</div>{action}</div>;
}

function Dashboard() {
  const [, setLocation] = useLocation();
  const [toast, setToast] = useState('');
  const bars = [58, 72, 51, 83, 68, 94, 77];
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2400); };
  return <main className="page">
    <PageHeading eyebrow="الثلاثاء، ٢١ مايو ٢٠٢٤" title="صباح الخير، د. سارة" note="إليك ملخص عيادتك لهذا اليوم." action={<button className="primary-button" onClick={() => setLocation('/patients/new')} data-testid="button-add-patient"><Plus /> إضافة مريض</button>} />
    <section className="stats-grid">
      <StatCard label="إجمالي المرضى" value="1,284" change="+8.4% هذا الشهر" icon={<Users />} />
      <StatCard label="مواعيد اليوم" value="12" change="4 مواعيد متبقية" icon={<CalendarDays />} />
      <StatCard label="الإيرادات هذا الشهر" value="48,620" change="+12.8% عن الشهر الماضي" icon={<BarChart3 />} suffix="ر.س" />
      <StatCard label="نسبة الحضور" value="94.2%" change="أفضل من الشهر الماضي" icon={<ShieldCheck />} />
    </section>
    <section className="dashboard-grid">
      <div className="panel">
        <div className="panel-head"><div><h2 className="panel-title">مواعيد اليوم</h2><p className="panel-subtitle">الثلاثاء، ٢١ مايو · ١٢ موعداً</p></div><Link className="text-button" href="/appointments" data-testid="link-view-appointments">عرض الجدول</Link></div>
        <div className="appointment-list">{appointments.slice(0, 4).map((item) => <AppointmentRow key={item.id} appointment={item} />)}</div>
      </div>
      <div className="panel chart-panel">
        <div className="panel-head"><div><h2 className="panel-title">أداء العيادة</h2><p className="panel-subtitle">الإيرادات خلال آخر ٧ أيام</p></div><button className="icon-button" onClick={() => showToast('تم تحديث بيانات الأداء')} aria-label="تحديث البيانات" data-testid="button-refresh-performance"><Activity size={15} /></button></div>
        <div className="chart-area"><div className="bar-chart">{bars.map((height, i) => <div className="bar-col" key={i}><div className="bar" style={{ height: `${height}%` }} /><span className="bar-label">{['١٥','١٦','١٧','١٨','١٩','٢٠','٢١'][i]}</span></div>)}</div><div className="chart-legend"><span><i style={{ color: 'var(--sea)' }}>●</i> إيرادات اليوم</span><span className="legend-value">٨,٤٢٠ ر.س</span></div></div>
      </div>
    </section>
    <section className="panel table-panel">
      <div className="panel-head"><div><h2 className="panel-title">الوصول السريع</h2><p className="panel-subtitle">المهام الأكثر استخداماً في عملك اليومي</p></div></div>
      <div className="quick-grid">
        <button className="quick-action" onClick={() => setLocation('/patients/new')} data-testid="button-quick-new-patient"><Plus /><span>تسجيل مريض جديد</span></button>
        <button className="quick-action" onClick={() => setLocation('/appointments')} data-testid="button-quick-appointment"><CalendarDays /><span>حجز موعد</span></button>
        <button className="quick-action" onClick={() => setLocation('/dental-chart')} data-testid="button-quick-chart"><Activity /><span>فتح مخطط الأسنان</span></button>
        <button className="quick-action" onClick={() => setLocation('/reports')} data-testid="button-quick-report"><FileText /><span>إنشاء تقرير</span></button>
      </div>
    </section>
    {toast && <div className="toast" data-testid="status-toast">{toast}</div>}
  </main>;
}

function StatCard({ label, value, change, icon, suffix }: { label: string; value: string; change: string; icon: ReactNode; suffix?: string }) {
  return <div className="stat-card" data-testid={`card-stat-${label}`}><div className="stat-top"><span className="stat-label">{label}</span><span className="stat-icon">{icon}</span></div><div className="stat-value">{value}{suffix && <small style={{ fontFamily: 'var(--app-font-sans)', fontSize: 10, letterSpacing: 0, marginRight: 5 }}>{suffix}</small>}</div><span className={`stat-change ${change.startsWith('+') ? '' : 'neutral'}`}>{change}</span></div>;
}

function AppointmentRow({ appointment }: { appointment: Appointment }) {
  return <div className="appointment-row" data-testid={`row-appointment-${appointment.id}`}><div className="time-block">{appointment.time}</div><div className="patient-dot">{appointment.initials}</div><div className="appointment-info"><strong>{appointment.patient}</strong><span>{appointment.type}</span></div><StatusPill status={appointment.status} /></div>;
}

function Patients() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('الكل');
  const [patients, setPatients] = useState(() => [...patientsStore]);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [toast, setToast] = useState('');
  const filtered = useMemo(() => patients.filter((patient) => (filter === 'الكل' || patient.status === filter) && `${patient.name} ${patient.phone}`.includes(query)), [patients, query, filter]);
  const removePatient = (id: number) => {
    if (!confirm('هل تريد حذف هذا السجل؟')) return;
    patientsStore = patientsStore.filter((p) => p.id !== id);
    setPatients([...patientsStore]);
    setToast('تم حذف سجل المريض');
    setTimeout(() => setToast(''), 2200);
  };
  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    patientsStore = patientsStore.map((p) => p.id === editing.id ? editing : p);
    setPatients([...patientsStore]); setEditing(null); setToast('تم حفظ تعديلات المريض'); setTimeout(() => setToast(''), 2200);
  };
  return <main className="page">
    <PageHeading eyebrow="المرضى · ١,٢٨٤ سجل" title="سجل المرضى" note="ابحث عن ملفات المرضى وراجع آخر زياراتهم." action={<Link className="primary-button" href="/patients/new" data-testid="link-new-patient"><Plus /> إضافة مريض</Link>} />
    <div className="toolbar"><div className="search-wrap"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو رقم الجوال..." aria-label="البحث في المرضى" data-testid="input-search-patients" /></div><div className="filter-row"><select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="تصفية المرضى" data-testid="select-patient-status"><option>الكل</option><option>نشط</option><option>متابعة</option><option>غير نشط</option></select><button className="secondary-button" onClick={() => setToast('خيارات التصدير جاهزة')} data-testid="button-export-patients"><FileText /> تصدير</button></div></div>
    <section className="panel table-panel" style={{ marginTop: 0 }}><div className="table-scroll"><table><thead><tr><th>المريض</th><th>رقم الجوال</th><th>العمر / الجنس</th><th>آخر زيارة</th><th>الموعد القادم</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{filtered.map((patient) => <tr key={patient.id} data-testid={`row-patient-${patient.id}`}><td><div className="person-cell"><span className="mini-avatar">{patient.name.slice(0, 2)}</span><div><strong>{patient.name}</strong><span>رقم الملف #{patient.id}</span></div></div></td><td className="muted" dir="ltr">{patient.phone}</td><td>{patient.age} سنة <span style={{ color: 'var(--ink-soft)' }}>· {patient.gender}</span></td><td className="muted">{patient.lastVisit}</td><td className="muted">{patient.nextVisit}</td><td><StatusPill status={patient.status} /></td><td><div className="row-actions"><button className="row-action" onClick={() => setEditing(patient)} aria-label={`تعديل ${patient.name}`} data-testid={`button-edit-patient-${patient.id}`}><Pencil size={14} /></button><button className="row-action" onClick={() => removePatient(patient.id)} aria-label={`حذف ${patient.name}`} data-testid={`button-delete-patient-${patient.id}`}><Trash2 size={14} /></button></div></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="empty-state"><Search size={25} /><div>لم نجد مريضاً يطابق بحثك</div><small>جرّب اسماً آخر أو غيّر التصفية.</small></div>}</div></section>
    {editing && <Modal title="تعديل بيانات المريض" onClose={() => setEditing(null)}><form onSubmit={saveEdit}><div className="form-grid"><Field label="اسم المريض" value={editing.name} onChange={(value) => setEditing({ ...editing, name: value })} /><Field label="رقم الجوال" value={editing.phone} onChange={(value) => setEditing({ ...editing, phone: value })} /><Field label="العمر" value={String(editing.age)} onChange={(value) => setEditing({ ...editing, age: Number(value) })} type="number" /><Field label="الحالة" value={editing.status} onChange={(value) => setEditing({ ...editing, status: value as Patient['status'] })} select options={['نشط', 'متابعة', 'غير نشط']} /></div><div className="modal-foot" style={{ padding: '20px 0 0' }}><button className="primary-button" type="submit" data-testid="button-save-patient">حفظ التعديلات</button><button className="secondary-button" type="button" onClick={() => setEditing(null)} data-testid="button-cancel-edit">إلغاء</button></div></form></Modal>}
    {toast && <div className="toast" data-testid="status-patient-toast">{toast}</div>}
  </main>;
}

function NewPatient() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ name: '', phone: '', idNumber: '', birth: '', gender: 'أنثى', notes: '', prescribedTreatment: '', visitDate: new Date().toISOString().slice(0, 16) });
  const [selectedTooth, setSelectedTooth] = useState(11);
  const [toothTreatments, setToothTreatments] = useState<Record<number, ToothTreatment>>({});
  const [saved, setSaved] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const updateToothTreatment = (key: keyof ToothTreatment, value: string) => setToothTreatments((current) => ({ ...current, [selectedTooth]: { ...(current[selectedTooth] ?? { type: '', canalLength: '', surface: '', material: '', notes: '' }), [key]: value } }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone) return;
    const id = Math.max(...patientsStore.map((p) => p.id), 100) + 1;
    const patient: Patient = { id, name: form.name, phone: form.phone, age: form.birth ? new Date().getFullYear() - new Date(form.birth).getFullYear() : 0, gender: form.gender, lastVisit: 'اليوم', nextVisit: '—', status: 'نشط' };
    patientsStore = [patient, ...patientsStore]; setSaved(true); setTimeout(() => setLocation('/patients'), 850);
  };
  const treatment = toothTreatments[selectedTooth] ?? { type: '', canalLength: '', surface: '', material: '', notes: '' };
  return <main className="page"><PageHeading eyebrow="سجل المرضى · ملف جديد" title="إضافة مريض جديد" note="افتح ملفاً طبياً كاملاً ووثّق خطة علاج الأسنان في زيارة واحدة." />
    <div className="new-patient-layout">
      <section className="panel new-patient-form-panel">
        <form className="form-body" onSubmit={submit}>
          <div className="form-section"><div className="section-heading-row"><div><h3>بيانات المريض</h3><p>المعلومات الأساسية للملف الطبي</p></div><span className="required-note">* حقول مطلوبة</span></div>
            <div className="form-grid"><Field label="اسم المريض الكامل *" placeholder="مثال: سارة عبدالله" value={form.name} onChange={(value) => update('name', value)} /><Field label="رقم الجوال *" placeholder="05x xxx xxxx" value={form.phone} onChange={(value) => update('phone', value)} type="tel" /><Field label="رقم الهوية" placeholder="اختياري" value={form.idNumber} onChange={(value) => update('idNumber', value)} /><Field label="تاريخ الميلاد" value={form.birth} onChange={(value) => update('birth', value)} type="date" /><Field label="الجنس" value={form.gender} onChange={(value) => update('gender', value)} select options={['أنثى', 'ذكر']} /></div>
          </div>
          <div className="form-section"><div className="section-heading-row"><div><h3>تفاصيل الزيارة</h3><p>يتم تسجيل التاريخ والوقت تلقائياً</p></div><span className="auto-time"><CalendarDays size={14} /> وقت النظام</span></div><div className="form-grid"><Field label="تاريخ ووقت الزيارة" value={form.visitDate} onChange={(value) => update('visitDate', value)} type="datetime-local" /><Field label="العلاج الموصوف للمريض" placeholder="مثال: تنظيف ومتابعة بعد أسبوع" value={form.prescribedTreatment} onChange={(value) => update('prescribedTreatment', value)} /></div></div>
          <div className="form-section"><h3>ملاحظات الطبيب</h3><div className="form-grid"><Field label="ملاحظات سريرية" placeholder="الحساسية، الأدوية، التشخيص الأولي، أو تعليمات المتابعة..." value={form.notes} onChange={(value) => update('notes', value)} textarea full /></div></div>
          <div className="form-actions"><button className="primary-button" type="submit" data-testid="button-submit-new-patient"><Check /> {saved ? 'تم الحفظ' : 'حفظ وفتح الملف'}</button><button className="secondary-button" type="button" onClick={() => setLocation('/patients')} data-testid="button-cancel-new-patient">إلغاء</button></div>
        </form>
      </section>
      <section className="panel new-patient-chart-panel">
        <div className="panel-head"><div><h2 className="panel-title">خطة علاج الأسنان</h2><p className="panel-subtitle">اختر أي سن لإضافة الإجراء والتفاصيل الخاصة به.</p></div><span className="chart-count">{Object.values(toothTreatments).filter((item) => item.type).length} أسنان موثقة</span></div>
        <ToothDiagram selected={selectedTooth} onSelect={setSelectedTooth} treated={toothTreatments} />
        <div className="tooth-treatment-card">
          <div className="selected-tooth"><span>السن المحدد</span><strong>{selectedTooth}</strong></div>
          <div className="treatment-card-heading"><div><h3>إجراء السن {selectedTooth}</h3><p>حدد ما سيقوم به الطبيب في هذا السن</p></div><Stethoscope size={20} /></div>
          <div className="treatment-choice-grid">{TOOTH_TREATMENTS.map((option) => <button type="button" key={option.value} className={`treatment-choice ${treatment.type === option.value ? 'active' : ''}`} onClick={() => updateToothTreatment('type', option.value)}><span className="choice-mark">{treatment.type === option.value ? <Check size={13} /> : option.icon}</span><span>{option.label}</span></button>)}</div>
          {treatment.type === 'حشوة جذر' && <div className="conditional-fields"><Field label="طول القنوات الجذرية (ملم)" placeholder="مثال: 21، 20، 19" value={treatment.canalLength} onChange={(value) => updateToothTreatment('canalLength', value)} /><Field label="عدد القنوات" placeholder="مثال: 3" value={treatment.surface} onChange={(value) => updateToothTreatment('surface', value)} type="number" /></div>}
          {treatment.type === 'حشوة عادية' && <div className="conditional-fields"><Field label="سطح الحشوة" value={treatment.surface || 'إطباقي'} onChange={(value) => updateToothTreatment('surface', value)} select options={['إطباقي', 'دهليزي', 'لساني', 'بيني']} /><Field label="مادة الحشوة" value={treatment.material || 'كومبوزيت'} onChange={(value) => updateToothTreatment('material', value)} select options={['كومبوزيت', 'أملغم', 'زجاج أيونومر']} /></div>}
          {(treatment.type === 'تركيبة' || treatment.type === 'تاج') && <div className="conditional-fields"><Field label="نوع التركيبة" value={treatment.material || 'زيركون'} onChange={(value) => updateToothTreatment('material', value)} select options={['زيركون', 'خزف', 'معدن خزفي']} /><Field label="لون السن" placeholder="مثال: A2" value={treatment.surface} onChange={(value) => updateToothTreatment('surface', value)} /></div>}
          {treatment.type === 'خلع' && <div className="conditional-fields"><Field label="سبب الخلع" placeholder="اكتب سبب الإجراء" value={treatment.notes} onChange={(value) => updateToothTreatment('notes', value)} full /></div>}
          {treatment.type && <div className="tooth-note"><FileText size={14} /><span>تم حفظ إجراء السن في نموذج المريض ويمكن تعديله قبل الحفظ.</span></div>}
        </div>
      </section>
    </div>
  </main>;
}

type ToothTreatment = { type: string; canalLength: string; surface: string; material: string; notes: string };
const TOOTH_TREATMENTS = [{ value: 'حشوة عادية', label: 'حشوة عادية', icon: 'ح' }, { value: 'حشوة جذر', label: 'حشوة جذر', icon: 'ع' }, { value: 'تركيبة', label: 'تركيبة', icon: 'ت' }, { value: 'تاج', label: 'تاج', icon: 'ج' }, { value: 'خلع', label: 'خلع', icon: 'خ' }, { value: 'مراقبة', label: 'مراقبة', icon: 'م' }];
const TOOTH_NUMBERS = Array.from({ length: 16 }, (_, i) => i + 11).concat(Array.from({ length: 16 }, (_, i) => 48 - i));

function ToothDiagram({ selected, onSelect, treated }: { selected: number; onSelect: (tooth: number) => void; treated: Record<number, ToothTreatment> }) {
  const toothButton = (tooth: number, angle: number, direction: 'upper' | 'lower') => {
    const toothType = [11, 12, 21, 22, 31, 32, 41, 42].includes(tooth) ? 'front' : [13, 23, 33, 43].includes(tooth) ? 'canine' : [14, 15, 24, 25, 34, 35, 44, 45].includes(tooth) ? 'premolar' : 'molar';
    return <button type="button" key={tooth} className={`tooth arch-tooth ${direction} ${toothType} ${selected === tooth ? 'selected' : ''} ${treated[tooth]?.type ? 'has-treatment' : ''}`} style={{ transform: `rotate(${angle}deg) translateY(${direction === 'upper' ? -132 : 132}px) rotate(${-angle}deg)` }} onClick={() => onSelect(tooth)} aria-label={`السن ${tooth}`} data-testid={`button-new-tooth-${tooth}`}>{tooth}</button>;
  };
  const upperTeeth = TOOTH_NUMBERS.slice(0, 16).map((tooth, index) => toothButton(tooth, -78 + index * 10.4, 'upper'));
  const lowerTeeth = TOOTH_NUMBERS.slice(16).map((tooth, index) => toothButton(tooth, -78 + index * 10.4, 'lower'));
  return <div className="new-tooth-diagram"><div className="diagram-labels"><span>الفك العلوي</span><small>يمين المريض</small></div><div className="arch-chart"><div className="dental-arch upper-arch">{upperTeeth}</div><div className="arch-center"><strong>UPPER</strong><span>اختر السن للتوثيق</span></div><div className="dental-arch lower-arch">{lowerTeeth}</div><div className="arch-center lower-center"><strong>LOWER</strong></div></div><div className="chart-legend-row"><span><i className="legend-dot clear" /> سليم</span><span><i className="legend-dot" /> السن المحدد</span><span><i className="legend-dot alert" /> تم اختيار علاج</span></div></div>;
}

function Field({ label, value, onChange, placeholder, type = 'text', select = false, options = [], textarea = false, full = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string; select?: boolean; options?: string[]; textarea?: boolean; full?: boolean }) {
  return <div className={`field ${full ? 'full' : ''}`}><label>{label}</label>{select ? <select value={value} onChange={(event) => onChange(event.target.value)} data-testid={`select-${label}`} >{options.map((option) => <option key={option}>{option}</option>)}</select> : textarea ? <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} data-testid={`textarea-${label}`} /> : <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} data-testid={`input-${label}`} />}</div>;
}

function Appointments() {
  const [activeDay, setActiveDay] = useState(0);
  const [view, setView] = useState<'week' | 'day'>('week');
  const [toast, setToast] = useState('');
  const days = [{ name: 'الثلاثاء', date: '٢١' }, { name: 'الأربعاء', date: '٢٢' }, { name: 'الخميس', date: '٢٣' }, { name: 'الجمعة', date: '٢٤' }, { name: 'السبت', date: '٢٥' }];
  const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2200); };
  return <main className="page"><PageHeading eyebrow="جدول العيادة · مايو ٢٠٢٤" title="المواعيد" note="تابع جدول الفريق وحافظ على يوم عيادتك منظمًا." action={<button className="primary-button" onClick={() => showToast('نموذج حجز موعد جديد جاهز')} data-testid="button-new-appointment"><Plus /> حجز موعد</button>} /><div className="calendar-toolbar"><div className="calendar-date"><button className="secondary-button" onClick={() => showToast('تم الانتقال إلى اليوم')} data-testid="button-calendar-today">اليوم</button><button className="icon-button" onClick={() => showToast('الأسبوع السابق')} aria-label="السابق" data-testid="button-calendar-prev"><ChevronRight size={15} /></button><button className="icon-button" onClick={() => showToast('الأسبوع التالي')} aria-label="التالي" data-testid="button-calendar-next"><ChevronLeft size={15} /></button><strong style={{ marginRight: 8, fontSize: 13 }}>٢١ — ٢٥ مايو ٢٠٢٤</strong></div><div className="filter-row"><button className={`secondary-button ${view === 'week' ? 'active' : ''}`} onClick={() => setView('week')} data-testid="button-view-week">أسبوع</button><button className={`secondary-button ${view === 'day' ? 'active' : ''}`} onClick={() => setView('day')} data-testid="button-view-day">يوم</button></div></div><section className="panel calendar-wrap"><div className="calendar-grid">{view === 'week' ? <><div /><div className="day-heading today"><span>{days[0].name}</span><strong>{days[0].date}</strong></div>{days.slice(1).map((day, index) => <button className={`day-heading ${activeDay === index + 1 ? 'today' : ''}`} key={day.date} onClick={() => setActiveDay(index + 1)} data-testid={`button-day-${day.date}`}><span>{day.name}</span><strong>{day.date}</strong></button>)}{hours.map((hour) => <><div className="hour-label" key={`${hour}-label`}>{hour}</div>{days.map((_, dayIndex) => { const event = appointments.find((item) => item.day === dayIndex && item.time === hour); return <div className="calendar-cell" key={`${hour}-${dayIndex}`}>{event && <div className={`event ${event.color ?? ''}`}><b>{event.time} · {event.patient}</b><span>{event.type}</span></div>}</div>; })}</>)}</> : <DayView day={activeDay} hours={hours} />}</div></section>{toast && <div className="toast" data-testid="status-appointment-toast">{toast}</div>}</main>;
}

function DayView({ day, hours }: { day: number; hours: string[] }) {
  return <><div /><div className="day-heading today"><span>{['الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][day]}</span><strong>{['٢١', '٢٢', '٢٣', '٢٤', '٢٥'][day]}</strong></div>{hours.map((hour) => { const event = appointments.find((item) => item.day === day && item.time === hour); return <><div className="hour-label" key={`${hour}-label-day`}>{hour}</div><div className="calendar-cell" key={`${hour}-day`}>{event && <div className={`event ${event.color ?? ''}`}><b>{event.time} · {event.patient}</b><span>{event.type}</span></div>}</div></>; })}</>;
}

function DentalChart() {
  const [selected, setSelected] = useState(11);
  const [dentition, setDentition] = useState('دائم');
  const [toast, setToast] = useState('');
  const teeth = Array.from({ length: 16 }, (_, i) => i + 11).concat(Array.from({ length: 16 }, (_, i) => 48 - i));
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2200); };
  return <main className="page"><PageHeading eyebrow="ملف سارة عبدالله · #101" title="مخطط الأسنان" note="حدد السن لمراجعة حالته وتوثيق الملاحظات السريرية." action={<button className="primary-button" onClick={() => showToast('تم حفظ تحديثات المخطط')} data-testid="button-save-chart"><Check /> حفظ التغييرات</button>} /><div className="chart-layout"><section className="panel dental-panel"><div className="panel-head"><div><h2 className="panel-title">المخطط السني</h2><p className="panel-subtitle">آخر تحديث: اليوم، ١٠:٣٢ ص · بواسطة د. سارة</p></div><button className="icon-button" onClick={() => showToast('تمت إضافة ملاحظة جديدة')} aria-label="إضافة ملاحظة" data-testid="button-add-chart-note"><Plus size={15} /></button></div><div className="dentition-tabs"><button className={`dentition-tab ${dentition === 'دائم' ? 'active' : ''}`} onClick={() => setDentition('دائم')} data-testid="button-dentition-permanent">الأسنان الدائمة</button><button className={`dentition-tab ${dentition === 'لبني' ? 'active' : ''}`} onClick={() => setDentition('لبني')} data-testid="button-dentition-primary">الأسنان اللبنية</button></div><div className="mouth"><div className="mouth-row">{teeth.slice(0, 16).map((tooth) => <button key={tooth} className={`tooth ${selected === tooth ? 'selected' : ''} ${[16, 26, 36].includes(tooth) ? 'alert' : ''}`} onClick={() => setSelected(tooth)} data-testid={`button-tooth-${tooth}`}>{tooth}</button>)}</div><div className="mouth-row">{teeth.slice(16).map((tooth) => <button key={tooth} className={`tooth ${selected === tooth ? 'selected' : ''} ${[16, 26, 36].includes(tooth) ? 'alert' : ''}`} onClick={() => setSelected(tooth)} data-testid={`button-tooth-${tooth}`}>{tooth}</button>)}</div></div><div className="chart-legend-row"><span><i className="legend-dot clear" /> سليم</span><span><i className="legend-dot" /> محدد</span><span><i className="legend-dot alert" /> يحتاج متابعة</span></div></section><aside className="panel detail-card"><div className="selected-tooth"><span>السن المحدد</span><strong>{selected}</strong></div><h3>حالة السن</h3><div className="detail-list"><div className="detail-line"><span>الحالة الحالية</span><b>{[16, 26, 36].includes(selected) ? 'يحتاج متابعة' : 'سليم'}</b></div><div className="detail-line"><span>آخر فحص</span><b>١٢ مايو ٢٠٢٤</b></div><div className="detail-line"><span>السطح</span><b>إطباقي</b></div></div><h3>إجراءات سريعة</h3><button className="secondary-button" style={{ width: '100%', marginBottom: 8 }} onClick={() => showToast(`تم تحديد السن ${selected} للحشوة`)} data-testid="button-chart-filling"><Pencil size={14} /> تسجيل حشوة</button><button className="secondary-button" style={{ width: '100%' }} onClick={() => showToast(`تمت إضافة ملاحظة للسن ${selected}`)} data-testid="button-chart-observation"><FileText size={14} /> إضافة ملاحظة</button></aside></div>{toast && <div className="toast" data-testid="status-chart-toast">{toast}</div>}</main>;
}

function TreatmentIcon({ icon }: { icon: Treatment['icon'] }) {
  const Icon = icon === 'spark' ? ShieldCheck : icon === 'shield' ? ShieldCheck : icon === 'activity' ? Activity : icon === 'file' ? FileText : Stethoscope;
  return <Icon />;
}

function Treatments() {
  const [treatments, setTreatments] = useState(() => [...treatmentStore]);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');
  const [newTreatment, setNewTreatment] = useState({ name: '', price: '', duration: '', description: '' });
  const filtered = treatments.filter((item) => item.name.includes(query) || item.description.includes(query));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!newTreatment.name) return;
    const treatment = { ...newTreatment, id: Date.now(), price: `${newTreatment.price || '0'} ر.س`, icon: 'tooth' as const };
    treatmentStore = [...treatmentStore, treatment]; setTreatments([...treatmentStore]); setNewTreatment({ name: '', price: '', duration: '', description: '' }); setModal(false); setToast('تمت إضافة العلاج إلى الدليل'); setTimeout(() => setToast(''), 2200);
  };
  return <main className="page"><PageHeading eyebrow="إدارة الخدمات · ٦ علاجات" title="دليل العلاجات" note="الأسعار والخدمات التي تقدمها العيادة." action={<button className="primary-button" onClick={() => setModal(true)} data-testid="button-add-treatment"><Plus /> إضافة علاج</button>} /><div className="toolbar"><div className="search-wrap"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث في دليل العلاجات..." aria-label="البحث في العلاجات" data-testid="input-search-treatments" /></div><button className="secondary-button" onClick={() => setToast('تم تحديث قائمة العلاجات')} data-testid="button-refresh-treatments"><Activity size={15} /> تحديث القائمة</button></div><div className="treatment-grid">{filtered.map((item) => <article className="treatment-card" key={item.id} data-testid={`card-treatment-${item.id}`}><div className="treatment-icon"><TreatmentIcon icon={item.icon} /></div><h3>{item.name}</h3><p>{item.description}</p><div className="treatment-foot"><span className="price">{item.price}</span><span className="muted">{item.duration}</span><button className="row-action" onClick={() => setToast(`تم اختيار ${item.name}`)} aria-label={`اختيار ${item.name}`} data-testid={`button-select-treatment-${item.id}`}><ChevronLeft size={14} /></button></div></article>)}</div>{filtered.length === 0 && <div className="panel empty-state"><Search size={25} /><div>لا توجد علاجات مطابقة</div></div>}{modal && <Modal title="إضافة علاج جديد" onClose={() => setModal(false)}><form onSubmit={submit}><div className="form-grid"><Field label="اسم العلاج *" value={newTreatment.name} onChange={(value) => setNewTreatment({ ...newTreatment, name: value })} /><Field label="السعر (ر.س)" value={newTreatment.price} onChange={(value) => setNewTreatment({ ...newTreatment, price: value })} type="number" /><Field label="المدة" value={newTreatment.duration} onChange={(value) => setNewTreatment({ ...newTreatment, duration: value })} placeholder="مثال: ٤٥ دقيقة" /><Field label="وصف مختصر" value={newTreatment.description} onChange={(value) => setNewTreatment({ ...newTreatment, description: value })} /></div><div className="modal-foot" style={{ padding: '20px 0 0' }}><button className="primary-button" type="submit" data-testid="button-submit-treatment">إضافة العلاج</button><button className="secondary-button" type="button" onClick={() => setModal(false)} data-testid="button-cancel-treatment">إلغاء</button></div></form></Modal>}{toast && <div className="toast" data-testid="status-treatment-toast">{toast}</div>}</main>;
}

function Reports() {
  const [period, setPeriod] = useState('هذا الشهر');
  const [toast, setToast] = useState('');
  const showToast = (message: string) => { setToast(message); setTimeout(() => setToast(''), 2200); };
  return <main className="page"><PageHeading eyebrow="التحليلات · مايو ٢٠٢٤" title="التقارير والأداء" note="قرارات أوضح تبدأ من صورة دقيقة لأداء عيادتك." action={<button className="secondary-button" onClick={() => showToast('يتم تجهيز التقرير بصيغة PDF')} data-testid="button-export-report"><FileText /> تصدير التقرير</button>} /><div className="toolbar"><div><strong style={{ fontSize: 11 }}>نظرة على الأداء</strong><span style={{ color: 'var(--ink-soft)', fontSize: 10, marginRight: 10 }}>مقارنة الإيرادات والحجوزات</span></div><select className="filter-select" value={period} onChange={(event) => setPeriod(event.target.value)} aria-label="الفترة الزمنية" data-testid="select-report-period"><option>هذا الشهر</option><option>الشهر الماضي</option><option>آخر ٣ أشهر</option></select></div><div className="reports-grid"><section className="panel"><div className="panel-head"><div><h2 className="panel-title">الإيرادات والحجوزات</h2><p className="panel-subtitle">حركة العيادة خلال {period}</p></div><span className="status-pill confirmed">+12.8%</span></div><div className="report-chart"><div className="line-chart"><svg className="line-svg" viewBox="0 0 600 200" preserveAspectRatio="none"><polyline points="0,157 80,132 160,145 240,88 320,110 400,62 480,77 600,25" fill="none" stroke="var(--sea)" strokeWidth="3" /><polyline points="0,157 80,132 160,145 240,88 320,110 400,62 480,77 600,25 600,200 0,200" fill="rgba(56,127,125,.08)" stroke="none" /></svg></div><div className="chart-legend"><span>١ مايو <span style={{ margin: '0 8px' }}>—</span> ٢١ مايو</span><span className="legend-value">٤٨,٦٢٠ ر.س</span></div></div><div className="report-kpis"><div className="kpi"><span>متوسط قيمة الموعد</span><strong>٣٨٥ ر.س</strong></div><div className="kpi"><span>إجمالي المواعيد</span><strong>١٨٧</strong></div></div></section><section className="panel"><div className="panel-head"><div><h2 className="panel-title">توزيع العلاجات</h2><p className="panel-subtitle">حسب عدد الجلسات</p></div><button className="icon-button" onClick={() => showToast('تم تحديث التقرير')} aria-label="تحديث التقرير" data-testid="button-refresh-report"><Activity size={15} /></button></div><div className="progress-list"><Progress label="فحص وتشخيص" value="76 جلسة" percent={82} /><Progress label="تنظيف وتلميع" value="54 جلسة" percent={63} /><Progress label="حشوات تجميلية" value="31 جلسة" percent={46} /><Progress label="تبييض الأسنان" value="18 جلسة" percent={28} /><Progress label="علاج العصب" value="8 جلسات" percent={14} /></div></section></div>{toast && <div className="toast" data-testid="status-report-toast">{toast}</div>}</main>;
}

function Progress({ label, value, percent }: { label: string; value: string; percent: number }) {
  return <div className="progress-row"><div><b>{label}</b><span>{value}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div></div>;
}

function SettingsPage() {
  const [active, setActive] = useState('العيادة');
  const [toggles, setToggles] = useState({ reminders: true, updates: true, compact: false });
  const [toast, setToast] = useState('');
  const save = () => { setToast('تم حفظ إعدادات العيادة'); setTimeout(() => setToast(''), 2200); };
  return <main className="page"><PageHeading eyebrow="مساحة العمل · التفضيلات" title="إعدادات العيادة" note="خصص راجيتا ليتناسب مع طريقة عمل فريقك." action={<button className="primary-button" onClick={save} data-testid="button-save-settings"><Check /> حفظ التغييرات</button>} /><div className="settings-layout"><nav className="settings-nav">{['العيادة', 'الفريق والصلاحيات', 'الإشعارات', 'الخصوصية'].map((item) => <button className={`settings-link ${active === item ? 'active' : ''}`} onClick={() => setActive(item)} key={item} data-testid={`button-settings-${item}`}>{item}</button>)}</nav><section className="panel"><div className="panel-head"><div><h2 className="panel-title">{active}</h2><p className="panel-subtitle">هذه المعلومات تظهر في ملفات المرضى والتقارير.</p></div></div><div className="form-body"><div className="form-section"><h3>بيانات العيادة</h3><div className="form-grid"><Field label="اسم العيادة" value="عيادات راجيتا لطب الأسنان" onChange={() => undefined} /><Field label="رقم التواصل" value="011 284 7320" onChange={() => undefined} /><Field label="البريد الإلكتروني" value="hello@rajeeta.sa" onChange={() => undefined} /><Field label="المدينة" value="الرياض، المملكة العربية السعودية" onChange={() => undefined} /></div></div><div className="form-section"><h3>التفضيلات</h3><div className="setting-row"><div><strong>تذكير المواعيد</strong><p>إرسال تذكير للمريض قبل الموعد بـ ٢٤ ساعة.</p></div><button className={`toggle ${toggles.reminders ? 'on' : ''}`} onClick={() => setToggles({ ...toggles, reminders: !toggles.reminders })} aria-label="تبديل تذكير المواعيد" data-testid="toggle-reminders" /></div><div className="setting-row"><div><strong>تنبيهات تحديثات النظام</strong><p>إشعار الفريق بالميزات والتحديثات الجديدة.</p></div><button className={`toggle ${toggles.updates ? 'on' : ''}`} onClick={() => setToggles({ ...toggles, updates: !toggles.updates })} aria-label="تبديل التنبيهات" data-testid="toggle-updates" /></div><div className="setting-row"><div><strong>العرض المكثف للجداول</strong><p>إظهار معلومات أكثر في مساحة أصغر.</p></div><button className={`toggle ${toggles.compact ? 'on' : ''}`} onClick={() => setToggles({ ...toggles, compact: !toggles.compact })} aria-label="تبديل العرض المكثف" data-testid="toggle-compact" /></div></div></div></section></div>{toast && <div className="toast" data-testid="status-settings-toast">{toast}</div>}</main>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="إغلاق" data-testid="button-close-modal"><X size={16} /></button></div><div className="modal-body">{children}</div></div></div>;
}

function Router() {
  return <RoutedErrorBoundary><Shell><Switch><Route path="/" component={Dashboard} /><Route path="/patients" component={Patients} /><Route path="/patients/new" component={NewPatient} /><Route path="/appointments" component={Appointments} /><Route path="/dental-chart" component={DentalChart} /><Route path="/treatments" component={Treatments} /><Route path="/reports" component={Reports} /><Route path="/settings" component={SettingsPage} /><Route component={NotFound} /></Switch></Shell></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;