export default function CompanyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold text-slate-900">Firma Bilgileri</h1>
        <p className="mt-4 text-sm text-slate-600">
          Guohong Lazer resmi firma bilgileri ve iletisim detaylari burada yer alir.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <div>
            <div className="font-semibold text-slate-900">Unvan</div>
            <p className="mt-1">Guohong Lazer</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Adres</div>
            <p className="mt-1">Konya / Karatay 42210</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Iletisim</div>
            <p className="mt-1">Telefon: +90 536 831 67 87</p>
            <p className="mt-1">E-posta: guohonglazerinfo@gmail.com</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Calisma saatleri</div>
            <p className="mt-1">Pazartesi - Cumartesi 09:00 - 18:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
