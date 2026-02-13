# Mikro e-Fatura (MikroAPI) – Connector kurulumu

Bu projede otomatik fatura kesimi, MikroAPI’nin çoğu kurulumda **yerel ağ/localhost** (ör. `https://localhost:8094`) üzerinde çalışması nedeniyle “connector” yaklaşımıyla yapılır.

Özet:
- **Vercel (web uygulaması):** Siparişi fatura kuyruğuna alır (`Invoice.status = PENDING`).
- **Ofiste/ERP’ye erişebilen bir makine:** Kuyruktan faturayı çeker, MikroAPI ile faturayı oluşturur, PDF/XML çıktısını web uygulamasına geri yükler.

## 1) Veritabanı migrasyonunu uygula

Önce Prisma migrasyonunun veritabanına işlendiğinden emin ol:

```bash
npx.cmd prisma migrate deploy
```

> Migration uygulanmazsa `Invoice` tablosu olmadığı için kuyruk/connector çalışmaz.

## 2) Vercel env ayarları (web uygulaması)

Şu env’ler gerekli:
- `INVOICE_CRON_SECRET` (connector’ın API’lere erişimi için)
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (invoice PDF/XML Supabase Storage’a yüklemek için)
- `DATABASE_URL` / `DIRECT_URL`

## 3) Mikro tarafı (ERP) hazırlığı

Connector’ın sorunsuz çalışması için:
- Mikro’da web satışları için bir **Cari Kod** belirle (örn. `WEB`) ve connector env’ine yaz.
- Sitedeki her yedek parçada **SKU** dolu olmalı ve Mikro’daki **stok kodu** ile aynı olmalı.

> Connector, SKU boşsa işlemi hata olarak işaretler.

## 4) Connector’ı çalıştır (ofis bilgisayarı / ERP ağı)

### Env’ler (ofis makinesi)

```bash
APP_BASE_URL=https://guohong-laser.vercel.app
INVOICE_CRON_SECRET=...

MIKRO_API_BASE_URL=https://localhost:8094
MIKRO_API_KEY=...
MIKRO_CALISMA_YILI=2026
MIKRO_FIRMA_KODU=...
MIKRO_KULLANICI_KODU=...
MIKRO_SIFRE=...                 # düz şifre (connector her çağrıda MD5 hash’ler)
MIKRO_CARI_KOD=WEB

MIKRO_FATURA_SERI=WEB            # opsiyonel (varsayılan: WEB)
MIKRO_DEPO_NO=1                  # opsiyonel
MIKRO_SUBE_NO=0                  # opsiyonel
MIKRO_KDV_RATE=0.2               # opsiyonel (varsayılan: 0.2)
MIKRO_SEND_EINVOICE=1            # opsiyonel (varsayılan: 1)

CONNECTOR_POLL_MS=5000           # opsiyonel (varsayılan: 5000ms)
```

### Çalıştırma

```bash
npx tsx script/mikro-invoice-connector.ts
```

Tek seferlik çalıştırma:

```bash
npx tsx script/mikro-invoice-connector.ts --once
```

## 5) Admin’den fatura oluştur

Admin panelinde siparişte **Fatura oluştur** butonu sadece kuyruğa alır.
Connector çalışıyorsa birkaç saniye içinde:
- Admin’de ve “Siparişlerim > Sipariş detayı”nda **PDF indir / XML indir** görünür.

