import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200/70 dark:border-gray-700/70">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logoacik.png" alt="Guohong Lazer" className="h-20 w-auto block dark:hidden" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logokoyu.png" alt="Guohong Lazer" className="h-20 w-auto hidden dark:block" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Guohong Lazer</div>
                <div className="text-xs text-gray-500">Lazer makineleri ve yedek parca cozumleri</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-400">
              <a href="https://www.facebook.com/profile.php?id=61584746766233&locale=tr_TR" className="hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="https://www.instagram.com/gu0honglaser/" className="hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.976.045-1.505.207-1.858.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.350.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="https://wa.me/905368316787" className="hover:text-gray-500">
                <span className="sr-only">WhatsApp</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.4 0 .07 5.33.07 12c0 2.11.55 4.18 1.6 6.02L0 24l6.17-1.62A11.95 11.95 0 0012.06 24h.01c6.66 0 12.09-5.33 12.09-11.99 0-3.2-1.25-6.2-3.64-8.53zm-8.46 18.5a9.9 9.9 0 01-5.05-1.39l-.36-.21-3.65.96.98-3.56-.24-.37a9.93 9.93 0 01-1.57-5.31c0-5.51 4.48-9.99 10-9.99a9.95 9.95 0 017.09 2.93 9.9 9.9 0 012.94 7.06c0 5.51-4.48 9.99-9.99 9.99zm5.47-7.46c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-6 text-sm text-gray-500 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Kurumsal</div>
              <p className="mt-3 text-sm text-gray-500">
                Lazer makineleri ve yedek parca alaninda, uretim ve satis sureclerini tek cati altinda yoneten guvenilir cozum ortaginiz.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/quote" className="inline-flex items-center justify-center rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50">
                  Teklif Al
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  Iletisime Gec
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Hizli Linkler</div>
              <div className="mt-3 space-y-2">
                <Link href="/about" className="block hover:text-gray-900 dark:hover:text-white">
                  Hakkimizda
                </Link>
                <Link href="/products" className="block hover:text-gray-900 dark:hover:text-white">
                  Urunlerimiz
                </Link>
                <Link href="/spare-parts" className="block hover:text-gray-900 dark:hover:text-white">
                  Yedek Parcalar
                </Link>
                <Link href="/contact" className="block hover:text-gray-900 dark:hover:text-white">
                  Iletisim
                </Link>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Iletisim</div>
              <div className="mt-3 space-y-2 text-sm">
                <div>Telefon: +90 536 831 67 87</div>
                <div>E-posta: guohonglazerinfo@gmail.com</div>
                <div>Konya/Karatay 42210</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">Calisma Saatleri</div>
              <div className="mt-3 space-y-2 text-sm">
                <div>Pazartesi - Cumartesi</div>
                <div>09:00 - 18:00</div>
                <div>Acil destek icin WhatsApp</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200/70 dark:border-gray-700/70 py-4">
          <p className="text-xs text-center text-gray-400">
            &copy; {new Date().getFullYear()} Guohong Lazer. Tum haklari saklidir.
          </p>
        </div>
      </div>
    </footer>
  );
}
