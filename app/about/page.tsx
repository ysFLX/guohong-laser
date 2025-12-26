'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

// Ekip Ã¼yeleri iÃ§in geÃ§ici resim URL'leri
const teamMembers = [
  {
    name: 'Fatih Turgut Polat',
    role: 'SatÄ±ÅŸ MÃ¼dÃ¼rÃ¼',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    name: 'Arafat Uygur',
    role: 'SatÄ±ÅŸ MÃ¼dÃ¼rÃ¼',
    image: 'https://randomuser.me/api/portraits/men/2.jpg',
  },
  {
    name: 'Yusuf Can GÃ¶rdebil',
    role: 'SatÄ±ÅŸ Pazarlama',
    image: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    name: 'Yusuf KÃ¼Ã§Ã¼ktongarlak',
    role: 'Sosyal Medya YÃ¶neticisi',
    image: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto py-28 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-emerald-100 bg-emerald-700/30 rounded-full backdrop-blur-sm"
            >
              HakkÄ±mÄ±zda
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
            >
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
                Lazer Teknolojisinde
              </span>
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 to-emerald-400">
                GeleceÄŸi Åekillendiriyoruz
              </span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 max-w-3xl mx-auto text-xl text-emerald-100 leading-relaxed space-y-4"
            >
              <p className="text-emerald-50 font-medium">
                SektÃ¶rdeki 10+ yÄ±llÄ±k deneyimimizle, en ileri teknoloji lazer Ã§Ã¶zÃ¼mleri sunuyoruz.
              </p>
              <p className="text-emerald-100/90">
                MÃ¼ÅŸteri odaklÄ± yaklaÅŸÄ±mÄ±mÄ±z ve yenilikÃ§i Ã§Ã¶zÃ¼mlerimizle, iÅŸletmenizin ihtiyaÃ§larÄ±na Ã¶zel Ã§Ã¶zÃ¼mler Ã¼retiyoruz.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            >
              <a
                href="#iletisim"
                className="px-8 py-4 bg-white text-emerald-700 font-medium rounded-lg hover:bg-emerald-50 transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Hemen Teklif AlÄ±n
              </a>
              <a
                href="#urunler"
                className="px-8 py-4 border-2 border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-300 text-center"
              >
                ÃœrÃ¼nleri KeÅŸfedin
              </a>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-900/80 to-transparent"></div>
      </div>

      {/* About Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-base text-emerald-600 dark:text-emerald-400 font-semibold tracking-wide uppercase"
            >
              HakkÄ±mÄ±zda
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl"
            >
              Guohong Lazer&apos;e HoÅŸ Geldiniz
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto"
            >
              YÃ¼ksek kaliteli lazer makineleri ve yedek parÃ§alarÄ± ile sektÃ¶rde Ã¶ncÃ¼yÃ¼z.
            </motion.p>
          </div>

          <div className="mt-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="Guohong Lazer Fabrika"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">FirmamÄ±z</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Guohong Lazer olarak, sektÃ¶rdeki 10 yÄ±lÄ± aÅŸkÄ±n deneyimimizle, en son teknoloji lazer makineleri ve yedek parÃ§alarÄ± Ã¼retiyoruz. MÃ¼ÅŸteri memnuniyetini her zaman Ã¶n planda tutarak, kaliteli ve gÃ¼venilir Ã¼rÃ¼nler sunuyoruz.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Uzman ekibimiz, her bÃ¼tÃ§eye uygun Ã§Ã¶zÃ¼mler sunarak mÃ¼ÅŸterilerimizin ihtiyaÃ§larÄ±nÄ± en iyi ÅŸekilde karÅŸÄ±lamak iÃ§in Ã§alÄ±ÅŸmaktadÄ±r.
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-4 bg-emerald-50 dark:bg-gray-800 rounded-lg transition-all duration-300"
                  >
                    <h4 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">10+</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">YÄ±llÄ±k Deneyim</p>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="p-4 bg-emerald-50 dark:bg-gray-800 rounded-lg transition-all duration-300"
                  >
                    <h4 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">500+</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Mutlu MÃ¼ÅŸteri</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vizyonumuz</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Lazer teknolojileri alanÄ±nda dÃ¼nya Ã§apÄ±nda tanÄ±nan, yenilikÃ§i ve sÃ¼rdÃ¼rÃ¼lebilir Ã§Ã¶zÃ¼mler sunan Ã¶ncÃ¼ bir marka olmak. EndÃ¼stri 4.0&apos;a uyumlu, akÄ±llÄ± Ã¼retim Ã§Ã¶zÃ¼mleriyle sektÃ¶rde fark yaratmayÄ± hedefliyoruz.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Misyonumuz</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                MÃ¼ÅŸterilerimize en yÃ¼ksek kalitede lazer makineleri ve yedek parÃ§alarÄ± sunarak, iÅŸ sÃ¼reÃ§lerini optimize etmek ve verimliliklerini artÄ±rmak iÃ§in Ã§Ã¶zÃ¼mler Ã¼retmek. SÃ¼rekli AR-GE Ã§alÄ±ÅŸmalarÄ±mÄ±zla yenilikÃ§i Ã¼rÃ¼nler geliÅŸtirerek sektÃ¶re yÃ¶n veriyoruz.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl"
            >
              Uzman Ekibimiz
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 mx-auto"
            >
              Deneyimli ve uzman kadromuzla yanÄ±nÄ±zdayÄ±z.
            </motion.p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative h-64 w-full group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-end p-6">
                    <div className="text-white">
                      <p className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-1">{member.role}</p>
                  <div className="flex justify-center space-x-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:w-2/3"
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">HazÄ±r mÄ±sÄ±nÄ±z?</span>
              <span className="block text-emerald-100">Hemen teklif alÄ±n veya bizimle iletiÅŸime geÃ§in.</span>
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-emerald-100">
              Uzman ekibimiz, ihtiyaÃ§larÄ±nÄ±za en uygun Ã§Ã¶zÃ¼mler iÃ§in size yardÄ±mcÄ± olmaktan mutluluk duyacaktÄ±r.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex lg:mt-0 lg:flex-shrink-0"
          >
            <div className="inline-flex rounded-md shadow">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-white hover:bg-emerald-50 transition-colors duration-300"
              >
                Ä°letiÅŸime GeÃ§in
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="/products"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-emerald-600 bg-opacity-70 hover:bg-opacity-90 transition-all duration-300"
              >
                ÃœrÃ¼nlerimiz
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

