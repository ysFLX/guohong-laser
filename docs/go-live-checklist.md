# Go-Live Checklist (Kargo Haric)

Bu dokuman, odeme sistemi acildiginda sitenin satisa hazir oldugunu dogrulamak icin kullanilir.

## 1) Kritik env kontrolu

- `NEXTAUTH_SECRET` dolu olmali.
- `NEXTAUTH_URL` veya `NEXT_PUBLIC_SITE_URL` production domain olmali.
- `STRIPE_SECRET_KEY` dolu olmali.
- `STRIPE_WEBHOOK_SECRET` dolu olmali.
- `NEXT_PUBLIC_CHECKOUT_MODE=payment` olmali.
- `SMTP_USER` ve `SMTP_PASS` dolu olmali.
- `CRON_SECRET` dolu olmali.
- `INVOICE_CRON_SECRET` dolu olmali.
- `SUPABASE_SERVICE_ROLE_KEY` dolu olmali.
- `NEXT_PUBLIC_SUPABASE_URL` (veya `SUPABASE_URL`) dogru olmali.
- `DATABASE_URL` production veritabanina baglanmali.

## 2) Guvenlik kontrolu

- `POST /api/returns-request/upload-url` giris olmadan `401` donmeli.
- `POST /api/checkout` giris olmadan `401` donmeli.
- `GET /api/cron/cart-reminders` secret olmadan `401` veya `500` (env eksik) donmeli.
- Admin endpointleri (`/api/admin/*`) admin disinda `403` donmeli.
- Production loglarinda secret degerler yazilmamali.

## 3) Odeme akisi UAT

- Normal kullanici ile urun sepete eklenmeli.
- Adres secilip Stripe checkout sayfasina gidilmeli.
- Basarili odeme sonrasi:
  - Siparis olusmali.
  - Siparis durumu `RECEIVED` olmali.
  - Kullanici profilinde siparis gorunmeli.
  - Siparis e-postasi gelmeli.
- Basarisiz odeme/sure asimi sonrasi:
  - Durum `FAILED` veya `CANCELED` guncellenmeli.
  - Ilgili bildirim/e-posta tetiklenmeli.

## 4) Veri dogrulama kontrolu

- Checkout sonrasi siparis kalemlerindeki fiyatlar DB fiyatlariyla tutarli olmali.
- `order.totalCents` ile kalem toplami tutarli olmali.
- Iade talebinde girilen siparis id, gercek ve ilgili kullaniciya ait olmali.

## 5) Operasyon kontrolu

- Stripe webhook endpoint productionda erisilebilir olmali.
- Vercel/hosting cron ayari aktif olmali:
  - cart reminder cron
  - invoice cron endpointleri
- Veritabani yedekleme policy aktif olmali.
- Hata izleme (log/alert) aktif olmali.

## 6) Iletisim ve yasal gorunurluk

- Footer ve `payment-security` sayfasinda iyzico bandi gorunmeli.
- Mesafeli satis, gizlilik, KVKK, iade politikasi sayfalari erisilebilir olmali.
- Iletisim sayfasi (telefon/e-posta/adres) guncel olmali.

## 7) Canliya cikis komutlari (ornek)

```powershell
# 1) Basit smoke test
powershell -ExecutionPolicy Bypass -File .\script\smoke-test.ps1 -BaseUrl "https://your-domain.com"

# 2) Cron endpointini secret ile test et
powershell -ExecutionPolicy Bypass -File .\script\smoke-test.ps1 -BaseUrl "https://your-domain.com" -CronSecret "YOUR_CRON_SECRET"
```

## 8) Geri donus plani

- Canliya cikistan once son calisan release tag/commit not edilmeli.
- Kritik hata durumunda onceki release'e rollback proseduru hazir olmali.
- DB migration varsa rollback stratejisi dokumante edilmeli.

## 9) Acil durum kapatma (kill switch)

- `EMERGENCY_LOCKDOWN_ENABLED=1` yapildiginda tum site ve API endpointleri `503` doner.
- Bu modda sadece `GET /api/health` acik kalir.
- Iceriye sadece bypass token ile girilebilir:
  - `EMERGENCY_BYPASS_TOKEN` tanimla.
  - URL'e tek seferlik `?emergency_bypass=<TOKEN>` ekle.
  - Sistem `emergency_bypass` cookie'si olusturur ve normal gezinmeye izin verir.
- Acil durum kapatmak icin `EMERGENCY_LOCKDOWN_ENABLED=0` (veya degiskeni kaldir) yap.
