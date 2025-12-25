import Image from 'next/image';
import Link from 'next/link';

import VideoSlider from '@/components/home/VideoSlider';

export default function Home() {
  const features = [
    {
      name: 'Yüksek Kalite',
      description: 'Endüstri standartlarının üzerinde kaliteli ürünler',
      icon: 'M5 13l4 4L19 7'
    },
    {
      name: 'Uzman Ekip',
      description: 'Deneyimli ve uzman teknik kadro',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
    },
    {
      name: 'Hızlı Teslimat',
      description: 'Hızlı ve güvenilir teslimat ağı',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      name: '7/24 Destek',
      description: 'Kesintisiz müşteri desteği',
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
    }
  ];

  const services = [
    {
      name: 'Lazer Kesim Makineleri',
      description: 'Yüksek hassasiyetli lazer kesim çözümleri',
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z',
      href: '/products?category=Sac+Kesim'
    },
    {
      name: 'Teknik Servis',
      description: 'Uzman ekip ile bakım ve onarım hizmetleri',
      icon: 'M11 4a2 2 0 114 0v1h1.5a.5.5 0 01.5.5v2.6l-1.2 1.2a.5.5 0 01-.7 0l-1.2-1.2V4zM4.5 5.5a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1zm13 0a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-3a.5.5 0 00-.5-.5h-1z',
      href: '/contact?subject=Teknik+Servis'
    },
    {
      name: 'Yedek Parça',
      description: 'Orijinal yedek parça garantisi',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
      href: '/products?category=Yedek+Parça'
    },
    {
      name: 'Danışmanlık',
      description: 'Uzman kadromuzla çözüm ortaklığı',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      href: '/contact?subject=Danışmanlık'
    }
  ];

  const stats = [
    { name: 'Yıllık Deneyim', value: '10+' },
    { name: 'Mutlu Müşteri', value: '500+' },
    { name: 'Tamamlanan Proje', value: '1000+' },
    { name: 'Çalışan', value: '50+' },
  ];
  const heroVideos = [
    {
      src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584806/borukesim_dd8a5f.mp4',
      poster: '/images/about-showcase.jpg',
      title: 'Lazer Boru Kesimi',
    },
    {
      src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584816/sackesim_m6icrx.mp4',
      poster: '/images/1.jpg',
      title: 'Lazer Sac Kesimi',
    },
    {
      src: 'https://res.cloudinary.com/dar9ughwx/video/upload/v1766584837/demirkesim_kbwzy2.mp4',
      poster: '/images/2.jpg',
      title: 'Lazer Demir Kesimi',
    },
  ];
  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
      alt: "Lazer kesim atelye",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      alt: "Uretim hatti detay",
    },
    {
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80&sat=-25",
      alt: "Metal isleme",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-20",
      alt: "Makine detay",
    },
    {
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80&sat=-15",
      alt: "Atolye gorunumu",
    },
    {
      src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80&sat=-10",
      alt: "Calisma alani",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pt-20 pb-16 md:pt-32 md:pb-24 lg:max-w-2xl lg:w-full lg:pt-40 lg:pb-32">
            <div className="text-center lg:text-left px-4 sm:px-6 lg:px-0">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block">Lazer Teknolojisinde</span>
                <span className="block text-blue-400 mt-2">Geleceği Üretiyoruz</span>
              </h1>

              <p className="mt-6 text-xl text-gray-300 max-w-xl mx-auto lg:mx-0">
                Endüstriyel lazer çözümlerinde lider firma olarak, en son teknoloji ürünlerimizle yanınızdayız.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Link href="/spare-parts" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Ürünleri Keşfet
                </Link>
                <Link href="/quote" className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  Ücretsiz Teklif Al
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right side image/decoration */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-64 w-full  lg:h-full">
            <div className="h-full w-full bg-[url('/images/about-showcase.jpg')] bg-cover bg-center" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-white dark:bg-gray-900 py-16 sm:py-24 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <VideoSlider items={heroVideos} />
          </div>
          <div id="gallery" className="mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Galeri
              </h2>
              <p className="mt-3 text-lg text-gray-500 dark:text-gray-300">
                Lazer kesim ve uretimden sahneler
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((item, index) => (
                <div key={index} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    className="h-56 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Neden Bizi Tercih Etmelisiniz?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              Kaliteli hizmet anlayışımız ve uzman ekibimizle yanınızdayız.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative bg-gray-50 dark:bg-gray-800 py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Hizmetlerimiz
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              İhtiyaçlarınıza özel çözümler sunuyoruz
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <Link key={index} href={service.href} className="group bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {service.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </p>
                <div className="mt-4 text-blue-600 dark:text-blue-400 font-medium flex items-center">
                  Daha fazla bilgi
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Özel Tekliflerimizden Yararlanın</span>
          </h2>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
            Uzman ekibimiz ihtiyaçlarınıza özel çözümler sunmak için hazır. Hemen teklif alın.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/quote"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Hemen Teklif Alın
            </Link>
            <Link
              href="/spare-parts"
              className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 bg-opacity-20 hover:bg-opacity-30 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
            >
              Ürünlerimizi İnceleyin
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Müşterilerimiz Ne Diyor?
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto">
              İş ortaklarımızın deneyimlerini keşfedin
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Ahmet Yılmaz',
                role: 'Üretim Müdürü',
                company: 'ABC Metal Sanayi',
                content: 'Lazer makinelerimizi bu firmadan temin ettik. Hem ürün kalitesi hem de sonrasındaki teknik destekleri için teşekkür ederiz.',
                avatar: '/images/avatar1.jpg'
              },
              {
                name: 'Ayşe Kaya',
                role: 'İşletme Sahibi',
                company: 'Kaya Metal',
                content: 'Uzun süredir çalıştığımız güvenilir bir firma. Yedek parça temininde hiçbir zaman sorun yaşamadık.',
                avatar: '/images/avatar2.jpg'
              },
              {
                name: 'Mehmet Demir',
                role: 'Teknik Müdür',
                company: 'Demir Çelik A.Ş.',
                content: 'Profesyonel ekibi ve hızlı çözüm üretme yetenekleri için teşekkürler. Kesinlikle tavsiye ederim.',
                avatar: '/images/avatar3.jpg'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-200 italic">&ldquo;{testimonial.content}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">
            Güvenilir İş Ortaklarımız
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="col-span-1 flex justify-center">
                <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 font-medium">Logo {i}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-blue-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="block">Hazır mısınız?</span>
            <span className="block text-blue-600 dark:text-blue-400">Hemen teklif alın.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                İletişime Geçin
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Ürünlerimiz
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


