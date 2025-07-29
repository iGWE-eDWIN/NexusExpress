import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import heroImg from '../assets/hero.jpg';
import aboutImg from '../assets/about.jpg';

const Home = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  // const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  const handleTrackShipment = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/tracking/${trackingNumber.trim()}`);
    }
  };

  return (
    <div className='font-sans text-gray-800'>
      <Helmet>
        <title>Nexus Express | Reliable Global Courier Service</title>
        <meta
          name='description'
          content='Nexus Express provides fast, secure, and trackable courier delivery and logistics services worldwide.'
        />
      </Helmet>
      <main className='pt-0'>
        {/* Hero Section */}
        <section
          className={`bg-cover bg-center h-screen flex items-center justify-center text-white`}
          style={{
            backgroundImage: `url(${heroImg})`,
          }}
        >
          <div className='bg-black bg-opacity-60 p-8 rounded-xl text-center max-w-lg'>
            <h2 className='text-4xl font-bold mb-4'>
              Fast & Reliable Courier Services
            </h2>
            <p className='text-lg mb-6'>
              Delivering your packages securely and on time.
            </p>
            <form onSubmit={handleTrackShipment} className='flex'>
              <input
                type='text'
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder='Enter tracking number'
                className='flex-grow px-4 py-2 rounded-l-md border-none focus:outline-none text-black'
              />
              <button
                type='submit'
                disabled={!trackingNumber.trim()}
                className={`px-6 font-semibold rounded-r-md transition ${
                  trackingNumber.trim()
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                Track
              </button>
            </form>
          </div>
        </section>

        {/* Services */}
        <section id='services' className='py-20 bg-gray-50'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='text-center mb-12'>
              {/* <span className='text-blue-600 font-semibold'>OUR SERVICES</span> */}
              <h2 className='text-4xl font-bold mt-2 mb-4'>
                Delivering Excellence
              </h2>
              <p className='text-gray-600 max-w-2xl mx-auto'>
                Comprehensive logistics solutions tailored to your business
                needs
              </p>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              {[
                {
                  title: 'Local Delivery',
                  description:
                    'Same-day delivery within your city with real-time tracking.',
                  icon: '🚚',
                },
                {
                  title: 'International Freight',
                  description:
                    'Seamless cross-border shipping with customs clearance.',
                  icon: '✈️',
                },
                {
                  title: 'Supply Chain Solutions',
                  description:
                    'End-to-end logistics management for businesses of all sizes.',
                  icon: '📦',
                },
              ].map((service, idx) => (
                <div
                  key={idx}
                  className='bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 group'
                >
                  <div className='text-4xl mb-4'>{service.icon}</div>
                  <h3 className='text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-600 transition'>
                    {service.title}
                  </h3>
                  <p className='text-gray-600'>{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className='py-20 bg-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='flex flex-col md:flex-row items-center gap-12'>
              <div className='md:w-1/2 relative'>
                <img
                  src={aboutImg}
                  alt='About Us'
                  className='rounded-xl shadow-lg w-full'
                />
              </div>
              <div className='md:w-1/2'>
                {/* <span className='text-blue-600 font-semibold'>ABOUT US</span> */}
                <h2 className='text-4xl font-bold mt-2 mb-6'>
                  Your Trusted Logistics Partner
                </h2>
                <p className='text-gray-600 mb-6'>
                  With over a decade in logistics, Nexus Express combines
                  cutting-edge technology with personalized service to deliver
                  secure, fast, and cost-effective shipping solutions.
                </p>
                <ul className='space-y-3 mb-8'>
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2 mt-1'>✓</span>
                    <span className='text-gray-700'>
                      24/7 Customer Support with dedicated account managers
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2 mt-1'>✓</span>
                    <span className='text-gray-700'>
                      Advanced Real-Time Tracking with predictive analytics
                    </span>
                  </li>
                  <li className='flex items-start'>
                    <span className='text-blue-500 mr-2 mt-1'>✓</span>
                    <span className='text-gray-700'>
                      Custom Logistics Planning tailored to your business needs
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id='faq' className='py-20 bg-gray-50'>
          <div className='max-w-4xl mx-auto px-6'>
            <div className='text-center mb-12'>
              <h2 className='text-4xl font-bold mt-2 mb-4'>
                Frequently Asked Questions
              </h2>
              <p className='text-gray-600'>
                Find answers to common questions about our services
              </p>
            </div>
            <div className='space-y-4'>
              {[
                {
                  q: 'How can I track my package?',
                  a: 'Use our advanced tracking system by entering your tracking number above. You can also download our mobile app for push notifications and route optimization insights.',
                },
                {
                  q: 'What areas do you cover?',
                  a: 'We provide comprehensive coverage including local, national, and international logistics solutions. Our network spans 150+ countries with specialized regional experts.',
                },
                {
                  q: 'Can I schedule deliveries?',
                  a: 'Absolutely. We offer flexible scheduling options including same-day, next-day, and recurring deliveries. Business clients can integrate with our API for automated scheduling.',
                },
              ].map(({ q, a }, index) => (
                <div
                  key={index}
                  className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'
                >
                  <div className='flex justify-between items-center cursor-pointer'>
                    <h3 className='text-lg font-semibold text-gray-800'>{q}</h3>
                    <svg
                      className='w-5 h-5 text-gray-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                  <p className='mt-3 text-gray-600'>{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id='testimonials' className='py-20 bg-blue-600 text-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='text-center mb-12'>
              <span className='text-blue-200 font-semibold'>TESTIMONIALS</span>
              <h2 className='text-4xl font-bold mt-2 mb-4'>
                Trusted by Businesses Worldwide
              </h2>
              <p className='text-blue-100 max-w-2xl mx-auto'>
                Hear from our satisfied customers about their experiences with
                Nexus Express
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-8'>
              {[
                {
                  name: 'Alice Johnson',
                  role: 'CEO, TechStart Inc.',
                  text: 'Nexus Express delivered my critical documents within hours when competitors said it was impossible. Their reliability saved us a major client contract!',
                  rating: '★★★★★',
                },
                {
                  name: 'Global Corp',
                  role: 'Logistics Manager',
                  text: 'We switched our entire supply chain to Nexus Express and saw a 30% reduction in shipping costs while improving delivery times. The real-time tracking is game-changing.',
                  rating: '★★★★☆',
                },
              ].map(({ name, role, text, rating }, idx) => (
                <div
                  key={idx}
                  className='bg-white/10 p-8 rounded-xl backdrop-blur-sm border border-white/20'
                >
                  <div className='text-yellow-300 mb-3 text-lg'>{rating}</div>
                  <p className='mb-6 text-blue-50 italic'>"{text}"</p>
                  <div>
                    <p className='font-semibold'>{name}</p>
                    <p className='text-blue-200 text-sm'>{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='py-16 bg-gray-900 text-white'>
          <div className='max-w-4xl mx-auto px-6 text-center'>
            <h2 className='text-3xl font-bold mb-4'>
              Ready to Ship With Confidence?
            </h2>
            <p className='text-gray-300 mb-8 text-xl'>
              Join thousands of satisfied customers who trust Nexus Express for
              their logistics needs.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className='bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800'>
          <div className='max-w-7xl mx-auto px-6'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-10 mb-12'>
              <div>
                <h3 className='text-white text-xl font-bold mb-4'>
                  Nexus Express
                </h3>
                <p className='mb-4'>
                  Delivering peace of mind, one parcel at a time.
                </p>
                <div className='flex space-x-4'>
                  {['twitter', 'facebook', 'linkedin', 'instagram'].map(
                    (social) => (
                      <a
                        key={social}
                        href={`#${social}`}
                        className='text-gray-400 hover:text-white transition'
                      >
                        <span className='sr-only'>{social}</span>
                        <svg
                          className='h-6 w-6'
                          fill='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            d={`M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z`}
                          />
                        </svg>
                      </a>
                    )
                  )}
                </div>
              </div>
              <div>
                <h4 className='text-white font-semibold mb-4'>Services</h4>
                <ul className='space-y-2'>
                  {[
                    'Local Delivery',
                    'International Shipping',
                    'Warehousing',
                    'Supply Chain',
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(' ', '-')}`}
                        className='hover:text-white transition'
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className='text-white font-semibold mb-4'>Contact</h4>
                <address className='not-italic'>
                  <p className='mb-2'>123 Shipping Lane</p>
                  <p className='mb-2'>Logistics City, LC 12345</p>
                  <p className='mb-2'>Email: support@nexusexpress.com</p>
                  <p>Phone: +1 (440) 281‑7685</p>
                </address>
              </div>
            </div>
            <div className='pt-8 border-t border-gray-800 text-center text-sm'>
              © 2020 Nexus Express. All rights reserved. |
              <a href='#privacy' className='hover:text-white ml-2'>
                Privacy Policy
              </a>{' '}
              |
              <a href='#terms' className='hover:text-white ml-2'>
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
