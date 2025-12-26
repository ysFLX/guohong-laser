import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/70 dark:border-slate-800">
      <div className="max-w-[1440px] mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Guohong Lazer</h3>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
              Lazer makineleri ve yedek parcalarda kaliteli cozumler.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Hizli Linkler</h3>
            <div className="mt-4">
              <Link href="/about" className="text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white block">
                Hakkimizda
              </Link>
              <Link href="/products" className="mt-2 text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white block">
                Urunlerimiz
              </Link>
              <Link href="/spare-parts" className="mt-2 text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white block">
                Yedek Parcalar
              </Link>
              <Link href="/contact" className="mt-2 text-base text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white block">
                Iletisim
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Iletisim</h3>
            <div className="mt-4">
              <p className="text-base text-gray-500 dark:text-gray-400">
                Adres: Fevzicakmak Mahallesi Aksaray Cevreyolu Caddesi Akasya Sanayi Sitesi A Blok No 18T
                Konya/Karatay 42210
              </p>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Telefon: +90 536 831 67 87</p>
              <p className="mt-2 text-base text-gray-500 dark:text-gray-400">E-posta: guohonglazerinfo@gmail.com</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8 flex justify-between items-center">
          <p className="text-base text-gray-400">
            &copy; {new Date().getFullYear()} Guohong Lazer. Tum haklari saklidir.
          </p>
          <div className="flex space-x-6">
            <a href="https://www.facebook.com/profile.php?id=61584746766233&locale=tr_TR" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a href="https://www.instagram.com/gu0honglaser/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.976.045-1.505.207-1.858.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a href="https://wa.me/905368316787" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">WhatsApp</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.4 0 .07 5.33.07 12c0 2.11.55 4.18 1.6 6.02L0 24l6.17-1.62A11.95 11.95 0 0012.06 24h.01c6.66 0 12.09-5.33 12.09-11.99 0-3.2-1.25-6.2-3.64-8.53zm-8.46 18.5a9.9 9.9 0 01-5.05-1.39l-.36-.21-3.65.96.98-3.56-.24-.37a9.93 9.93 0 01-1.57-5.31c0-5.51 4.48-9.99 10-9.99a9.95 9.95 0 017.09 2.93 9.9 9.9 0 012.94 7.06c0 5.51-4.48 9.99-9.99 9.99zm5.47-7.46c-.3-.15-1.77-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.67-2.1-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.53.08-.8.38-.27.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.14 4.53.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
