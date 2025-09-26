'use client'
import { useEffect, useState } from 'react'

import Image from 'next/image'

import { useRouter, useParams } from 'next/navigation'

import { toast } from 'react-toastify'

import { Card, CardContent, Typography } from '@mui/material'

import { Tag, Hourglass, FileText, ChevronLeft, ChevronRight, Star } from 'lucide-react'


import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/accordion/Accordion'
import axiosInstance from '@/utils/axiosinstance'

const Page = () => {
  const reviews = [
    {
      id: 1,
      name: 'Jithin',
      date: 'Sep. 03, 2019',
      rating: 5,
      content:
        'I started using this 5 days back and I simply love this application. I am gonna use this for my company and I may become a paid member soon. I totally loved this app'
    },
    {
      id: 2,
      name: 'Marc',
      date: 'Jan. 17, 2025',
      rating: 5,
      content:
        "After spending HOURS to find an easy-to-use software for small and middle sized companies, I finally found this wonderful solution. Perfect solution when Excel lists aren't enough anymore but you don't want to spend a fortune on a bloated software with features you never need. "
    },
    {
      id: 3,
      name: 'Sarah',
      date: 'Aug. 11, 2025',
      rating: 5,
      content:
        'This software has transformed how we manage our inventory. The interface is intuitive and the features are exactly what we needed for our growing business.'
    },
    {
      id: 4,
      name: 'David',
      date: 'Jun. 22, 2025',
      rating: 5,
      content:
        'Excellent tool for project management. The team collaboration features are outstanding and have improved our productivity significantly.'
    },
    {
      id: 5,
      name: 'Lisa',
      date: 'April. 5, 2025',
      rating: 5,
      content:
        'Simple yet powerful. This application strikes the perfect balance between functionality and ease of use. Highly recommended!'
    },
    {
      id: 6,
      name: 'Olivia',
      date: 'Dec. 28, 2025',
      rating: 5,
      content:
        'Excellent tool for project management. The team collaboration features are outstanding and have improved our productivity significantly.'
    }
  ]

  const images = ['/images/ist.png', '/images/2nd.png', '/images/3rd.png', '/images/4th.png', '/images/5th.png']

  const [currentIndex, setCurrentIndex] = useState(0)
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [recaptchaValue, setRecaptchaValue] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    // Load reCAPTCHA script only once
    if (!window.grecaptcha) {
      const script = document.createElement('script')

      script.src = 'https://www.google.com/recaptcha/api.js'
      script.async = true
      script.defer = true
      script.onload = () => setRecaptchaReady(true)
      document.body.appendChild(script)
    } else {
      setRecaptchaReady(true)
    }
  }, [])

  const reviewsPerPage = 2

  const nextReviews = () => {
    setCurrentIndex(prev => (prev + reviewsPerPage >= reviews.length ? 0 : prev + reviewsPerPage))
  }

  const prevReviews = () => {
    setCurrentIndex(prev => (prev === 0 ? Math.max(0, reviews.length - reviewsPerPage) : prev - reviewsPerPage))
  }

  const goToPage = pageIndex => {
    setCurrentIndex(pageIndex * reviewsPerPage)
  }

  const prevSlide = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const nextSlide = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = index => {
    setCurrentIndex(index)
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const currentPage = Math.floor(currentIndex / reviewsPerPage)

  const renderStars = rating => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
      />
    ))
  }

  const router = useRouter()
  const { lang: locale } = useParams()

  // Handle mobile menu toggle
  useEffect(() => {
    const mobileBtn = document.getElementById('mobileBtn')
    const mobileMenu = document.getElementById('mobileMenu')

    const toggleMenu = () => {
      mobileMenu.classList.toggle('hidden')
    }

    mobileBtn.addEventListener('click', toggleMenu)

    return () => {
      mobileBtn.removeEventListener('click', toggleMenu)
    }
  }, [])

  // Handle testimonial carousel
  useEffect(() => {
    const testimonials = document.querySelectorAll('#testimonials blockquote')
    const prevBtn = document.getElementById('prevT')
    const nextBtn = document.getElementById('nextT')
    let currentIndex = 0

    const showTestimonial = index => {
      testimonials.forEach((testimonial, i) => {
        testimonial.classList.toggle('hidden', i !== index)
      })
    }

    // Initialize first testimonial
    showTestimonial(currentIndex)
  }, [])

  // const handleSubmit = e => {
  //   e.preventDefault()

  //   // Get the response token from the widget
  //   const token = window.grecaptcha.getResponse()

  //   if (!token) {
  //     alert('Please complete the reCAPTCHA.')

  //     return
  //   }

  //   // If token exists, you can proceed with form submit logic here
  //   alert('reCAPTCHA completed! You can submit the form now.')
  // }

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()

    const token = window.grecaptcha.getResponse()
    if (!token) {
      toast.error(' Please complete the reCAPTCHA.')
      return
    }

    try {
      const response = await axiosInstance.post('/core/send-query', {
        name: formData.name,
        email: formData.email,
        message: formData.message
      })

      if (response.data?.status === 200) {
        toast.success(response.data?.message || 'Query submitted successfully!')
        setFormData({ name: '', email: '', message: '' })
        window.grecaptcha.reset() // reset recaptcha
      } else {
        toast.error(response.data?.message || 'Failed to submit query!')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Something went wrong!')
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }} className='overflow-x-hidden '>
      {/* NAV */}
      <header className='fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur shadow-[0_2px_8px_rgba(0,0,0,0.05)]'>
        <div className='max-w-7xl mx-auto px-6 py-4 flex items-center justify-between'>
          <a href='#' className='flex items-center gap-3'>
            <img
              src='/images/assetsigmalogo.png'
              alt='YourToolName Logo'
              className='w-64 h-10 object-contain rounded-lg'
            />
          </a>

          <nav className='hidden md:flex items-center gap-6 text-lg'>
            {[
              { href: '#features', label: 'Features' },
              { href: '#pricing', label: 'Pricing' },
              { href: '#industries', label: 'Industries' },
              { href: '#resources', label: 'Resources' },
              { href: '#support', label: 'Support' }
            ].map((link, index) => (
              <a key={index} href={link.href} className='relative transition-all duration-300 hover:text-primary group'>
                {link.label}
                <span className='absolute left-0 -bottom-1 w-0 h-[2px] bg-current transition-all duration-300 group-hover:w-full'></span>
              </a>
            ))}
          </nav>

          <div className='hidden md:flex items-center gap-3'>
            <button
              onClick={() => router.push(`/login`)}
              className='inline-block cursor-pointer text-sm px-4 py-2 rounded-[6px] bg-primary text-white shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/50 hover:brightness-110'
              style={{ fontFamily: "'inherit'," }}
            >
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <button id='mobileBtn' className='md:hidden p-2 rounded-md focus:outline-none' aria-label='Open menu'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div id='mobileMenu' className='md:hidden hidden border-t bg-white'>
          <div className='px-6 py-4 space-y-3'>
            <a href='#features' className='block' style={{ fontSize: '20px' }}>
              Features
            </a>
            <a href='#pricing' className='block' style={{ fontSize: '20px' }}>
              Pricing
            </a>
            <a href='#industries' className='block' style={{ fontSize: '20px' }}>
              Industries
            </a>
            <a href='#resources' className='block' style={{ fontSize: '20px' }}>
              Resources
            </a>
            <a href='#support' className='block' style={{ fontSize: '20px' }}>
              Support
            </a>
            <div className='pt-2'>
              <a
                onClick={() => router.push(`/login`)}
                className='block w-full text-center px-4 py-2 rounded-md bg-primary text-white font-medium cursor-pointer'
                style={{ fontSize: '20px' }}
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main className='pb-[80px]'>
        <section className='container max-w-7xl mx-auto px-6  grid gap-8 lg:grid-cols-2 items-center'>
          {/* Text Section */}
          <div className='flex flex-col items-center lg:items-start text-center lg:text-left'>
            <p className='text-sm uppercase tracking-wider text-slate-600'>Asset management • audit • tracking</p>
            <h1 className='mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight'>
              Your assets, under control — anytime, anywhere
            </h1>
            <p className='mt-4 text-lg text-slate-600 max-w-xl'>
              Track, audit, and manage everything from laptops to heavy equipment. Barcode & QR scanning, automated
              alerts, check-in/out, and powerful reports — all in one intuitive platform. Start free with up to 250
              assets.
            </p>

            <div className='mt-6 flex flex-wrap gap-3 justify-center lg:justify-start'>
              <a
                href='#signup'
                className='inline-flex items-center gap-3 px-5 py-3 bg-primary text-white rounded-md shadow hover:brightness-95'
              >
                Start for Free
              </a>
              {/* <a href="#demo" className="inline-flex items-center gap-2 px-4 py-3 border rounded-md">
        Watch Demo
      </a> */}
              <a
                href='#'
                onClick={e => {
                  e.preventDefault()
                  setOpen(true)
                }}
                className='inline-flex items-center gap-2 px-4 py-3 border rounded-md bg-primary text-white hover:brightness-95'
              >
                Watch Demo
              </a>
              <span className='inline-flex items-center text-sm text-slate-600 border px-3 py-2 bg-primary rounded-md  text-white  hover:brightness-95'>
                <strong className='text-slate-800 mr-2  text-white'>Free</strong> up to 250 assets
              </span>
            </div>

            <ul className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
              <li className='flex items-start gap-3'>
                <div className='mt-1 text-primary'>✔</div>
                <div>
                  <div className='font-semibold'>Barcode & QR scanning</div>
                  <div className='text-slate-500'>Use any smartphone to audit and update assets on the fly.</div>
                </div>
              </li>
              <li className='flex items-start gap-3'>
                <div className='mt-1 text-primary'>✔</div>
                <div>
                  <div className='font-semibold'>Alerts & maintenance</div>
                  <div className='text-slate-500'>Get reminders for warranties, leases, and scheduled servicing.</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Image Section */}
          <div className='flex justify-end'>
            <img src='/images/image1.png' alt='Dashboard Preview' className='rounded-md w-full max-w-lg object-cover' />
          </div>
        </section>

        {/* Modal Overlay */}
        {open && (
          <div className='fixed inset-0 flex items-center justify-center bg-black/70 z-50'>
            <div className='bg-white rounded-lg overflow-hidden max-w-3xl w-full relative'>
              {/* Close Button */}
              <button className='absolute top-2 right-2 text-gray-600 hover:text-black' onClick={() => setOpen(false)}>
                ✕
              </button>

              {/* YouTube Video */}
              <div className='aspect-w-16 aspect-h-9'>
                <iframe
                  width='100%'
                  height='500'
                  src='https://www.youtube.com/embed/f8NPRamJI7Y?si=FapTC00MctOKXS9a&autoplay=1'
                  title='Watch Demo'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        )}
        {/* Features */}
        <section id='features' className='max-w-7xl mx-auto px-6 '>
          <h1 className='text-2xl font-bold text-center'>Features</h1>
          <div className='grid gap-12 lg:grid-cols-2 items-center mt-8'>
            <div>
              <h2 className='text-2xl font-bold'>Features that give you control</h2>
              <p className='mt-3 text-slate-600 max-w-md '>
                Everything you need to track, manage, and audit assets — built for IT teams, facilities, construction,
                healthcare, and education.
              </p>

              <ul className='mt-8 space-y-5'>
                <li className='flex gap-4'>
                  <div className='bg-primary/10 text-primary rounded-lg p-3'>
                    <img src='/images/qr_Code.png' alt='QR Code' className='w-5 h-5 object-contain' />
                  </div>

                  <div>
                    <div className='font-semibold'>Barcode & QR scanning</div>
                    <div className='text-slate-500 text-sm'>
                      Use your phone camera to scan, audit, and update assets instantly. No extra hardware required.
                    </div>
                  </div>
                </li>

                <li className='flex gap-4'>
                  <div className='bg-primary/10 text-primary rounded-lg p-3'>
                    <img src='/images/check.png' alt='Check' className='w-5 h-5 object-contain' />
                  </div>

                  <div>
                    <div className='font-semibold'>Check-in / Check-out</div>
                    <div className='text-slate-500 text-sm'>
                      Track who has what — reduce loss and increase accountability across teams.
                    </div>
                  </div>
                </li>

                <li className='flex gap-4'>
                  <div className='bg-primary/10 text-primary rounded-lg p-3'>
                    <img src='/images/alert.png' alt='Alert' className='w-6 h-6 object-contain' />
                  </div>

                  <div>
                    <div className='font-semibold'>Alerts & maintenance scheduling</div>
                    <div className='text-slate-500 text-sm'>
                      Never miss warranty, lease, or service dates with smart reminders and email alerts.
                    </div>
                  </div>
                </li>

                <li className='flex gap-4'>
                  <div className='bg-primary/10 text-primary rounded-lg p-3'>
                    <img src='/images/reportcheck.png' alt='Report' className='w-5 h-5 object-contain' />
                  </div>

                  <div>
                    <div className='font-semibold'>Reports & audits</div>
                    <div className='text-slate-500 text-sm'>
                      Export depreciation, utilization, and audit reports with one click.
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            {/* Carousel Section */}
            <section aria-label='Image carousel' className='relative w-full max-w-5xl mx-auto group'>
              {/* Carousel wrapper */}
              <div className='relative h-56 overflow-hidden rounded-lg md:h-96'>
                {images.map((src, index) => (
                  <div
                    key={index}
                    className={`absolute top-1/2 left-1/2 w-full transition-opacity duration-700 ease-in-out -translate-x-1/2 -translate-y-1/2 ${
                      index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img src={src} alt={`Slide ${index + 1}`} className='w-full' />
                  </div>
                ))}
              </div>

              {/* Slider indicators */}
              <div className='absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 space-x-3'>
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full ${index === currentIndex ? '' : 'bg-gray-300'}`}
                    style={{ backgroundColor: index === currentIndex ? 'black' : undefined }}
                    aria-current={index === currentIndex ? 'true' : undefined}
                    aria-label={`Slide ${index + 1}`}
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>

              {/* Prev Button */}
              <button
                type='button'
                onClick={prevSlide}
                aria-label='Previous slide'
                className='absolute top-1/2 left-0 z-30 flex items-center justify-center -translate-y-1/2 pl-2
                   opacity-0 pointer-events-none transition-opacity duration-300
                   group-hover:opacity-100 group-hover:pointer-events-auto bg-transparent'
              >
                <span className='inline-flex items-center justify-center w-10 h-10'>
                  <svg
                    className='w-6 h-6 text-[#6E6FE2]'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 6 10'
                    aria-hidden='true'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M5 1 1 5l4 4'
                    />
                  </svg>
                  <span className='sr-only'>Previous</span>
                </span>
              </button>

              {/* Next Button */}
              <button
                type='button'
                onClick={nextSlide}
                aria-label='Next slide'
                className='absolute top-1/2 right-0 z-30 flex items-center justify-center -translate-y-1/2 pr-2
                   opacity-0 pointer-events-none transition-opacity duration-300
                   group-hover:opacity-100 group-hover:pointer-events-auto bg-transparent'
              >
                <span className='inline-flex items-center justify-center w-10 h-10'>
                  <svg
                    className='w-6 h-6 text-[#6E6FE2]'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 6 10'
                    aria-hidden='true'
                  >
                    <path
                      stroke='currentColor'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='m1 9 4-4-4-4'
                    />
                  </svg>
                  <span className='sr-only'>Next</span>
                </span>
              </button>
            </section>
          </div>
        </section>

        {/*Mobile App  */}
        <section className='bg-[#f7f9fc] py-5 mt-8'>
          <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-start gap-10'>
            {/* Left - Phone Image */}
            <div className='flex justify-center md:justify-start'>
              <Image
                src='/images/phone-app.png'
                alt='Mobile App'
                width={400}
                height={300}
                className='drop-shadow-lg -rotate-12 w-full max-w-[250px] md:max-w-[400px] h-auto'
              />
            </div>

            {/* Right - Text and Download Buttons */}
            <div className='flex flex-col items-center md:items-start text-center md:text-left'>
              <h2 className='text-2xl font-bold text-gray-900 leading-snug'>Complete Mobile APP for Android and iOS</h2>

              <p className='mt-4 text-gray-600 leading-relaxed max-w-xl'>
                Manage your assets, scan barcodes, conduct various audits, and perform an array of actions from your
                phone or tablet. As long as you can connect to the internet, you can access our system - eliminating any
                need to purchase extra equipment.
              </p>

              {/* Download Buttons */}
              <div className='mt-6 w-full'>
                <p className='text-sm font-semibold text-gray-900 mb-3'>DOWNLOAD FROM:</p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center md:justify-start'>
                  <a href='#' aria-label='Download from Google Play' className='flex justify-center'>
                    <Image src='/images/badge_android.png' alt='Google Play' width={150} height={50} />
                  </a>
                  <a href='#' aria-label='Download from App Store' className='flex justify-center'>
                    <Image src='/images/badge_ios.svg' alt='App Store' width={150} height={50} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className='py-10 bg-white'>
          <div className='max-w-7xl mx-auto px-6'>
            <h1 className='text-2xl font-bold text-center'> Benefits</h1>

            {/* Cards */}
            <div className='grid gap-8 md:grid-cols-3 mt-8'>
              {/* Card 1 */}
              <Card
                className='group transition-all duration-300'
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <div className='flex justify-center md:justify-start mb-4'>
                    <div className='p-3 rounded-lg bg-[#6E6FE2] rotate-6 transition-all duration-300'>
                      <Tag className='w-8 h-8 text-white transition-colors duration-300' />
                    </div>
                  </div>

                  <Typography variant='h6' gutterBottom>
                    Assets
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Focus on your company as a whole instead of individual assets. Use our software to keep tabs on your
                    assets. Make a detailed log of equipment check-out, create an unlimited number of custom fields, and
                    download our Excel template. Upload it to start managing your assets in minutes.
                  </Typography>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card
                className='group transition-all duration-300'
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <div className='flex justify-center md:justify-start mb-4'>
                    <div className='p-3 rounded-lg bg-[#6E6FE2] rotate-6 transition-all duration-300'>
                      <Hourglass className='w-8 h-8 text-white transition-colors duration-300' />
                    </div>
                  </div>

                  <Typography variant='h6' gutterBottom>
                    Contracts and Licenses
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    We provide you with the perfect platform to keep your contracts and licenses in the same place,
                    organized in a way that works for you. We'll let you know when a contract or license is about to
                    expire so you can update it in a timely manner. You can even set up email alerts to stay informed
                    about your account at all times.
                  </Typography>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card
                className='group transition-all duration-300'
                sx={{
                  borderRadius: 2,
                  boxShadow: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent>
                  <div className='flex justify-center md:justify-start mb-4'>
                    <div className='p-3 rounded-lg bg-[#6E6FE2] rotate-6 transition-all duration-300'>
                      <FileText className='w-8 h-8 text-white transition-colors duration-300' />
                    </div>
                  </div>

                  <Typography variant='h6' gutterBottom>
                    Reports
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    View predefined reports which include statements about your assets to help clean up your workload.
                    Add information about status, depreciation, maintenance, check-out times, and more. Save and reuse
                    an unlimited number of custom reports to get the most out of your data.
                  </Typography>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id='faq' className='max-w-7xl mx-auto px-6 '>
          <h1 className='text-2xl font-bold text-center'>Frequently Asked Questions</h1>

          <Accordion type='single' collapsible className='mt-8'>
            {/* Question 1 */}
            <AccordionItem value='question1'>
              <AccordionTrigger>What is assetsigma and what are the benefits?</AccordionTrigger>

              <AccordionContent>
                <p className='text-slate-700 mb-2'>
                  assetsigma is a cloud-based asset management platform that gives you full visibility and control over
                  your organization's equipment, tools, and property. With powerful tracking, reporting, and audit
                  tools, assetsigma helps you reduce asset loss, increase accountability, and save time. It's easy to
                  set up, accessible from anywhere, and designed to scale with your needs.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Question 2 */}
            <AccordionItem value='question2'>
              <AccordionTrigger>How do I get started with assetsigma?</AccordionTrigger>
              <AccordionContent>
                <p className='text-slate-700 mb-2'>
                  To get started with assetsigma, visit their official website and sign up for an account. Follow the
                  setup guide provided to configure your assets and explore the platform's features. For more details,
                  you can contact their support team.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Footer */}

        <section className='bg-gray-50 py-5 mt-10 '>
          <div className='max-w-6xl mx-auto px-6 '>
            {/* Header */}
            <h1 className='text-2xl font-bold text-center text-gray-900 mb-12'>User Reviews</h1>

            {/* Reviews Carousel */}
            <div className='relative'>
              {/* Navigation Arrows */}
              <button
                onClick={prevReviews}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow'
                aria-label='Previous reviews'
              >
                <ChevronLeft className='w-6 h-6 text-gray-600' />
              </button>

              <button
                onClick={nextReviews}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow'
                aria-label='Next reviews'
              >
                <ChevronRight className='w-6 h-6 text-gray-600' />
              </button>

              {/* Reviews Grid */}
              <div className='grid md:grid-cols-2 gap-6 mb-8'>
                {reviews.slice(currentIndex, currentIndex + reviewsPerPage).map(review => (
                  <div key={review.id} className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h3 className='font-semibold text-gray-900 text-lg mb-1'>{review.name}</h3>
                        <p className='text-sm text-black-500'>
                          Written on <span className='text-red-500'>{review.date}</span>
                        </p>
                      </div>
                      <div className='flex gap-1'>{renderStars(review.rating)}</div>
                    </div>
                    <p className='text-gray-700 leading-relaxed'>{review.content}</p>
                  </div>
                ))}
              </div>

              {/* Pagination Dots */}
              <div className='flex justify-center gap-2 mb-8'>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i === currentPage ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
              {/* View All Reviews Button */}
              <button className='bg-[#6E6FE2] hover:bg-[#5A5BCC] text-white font-semibold rounded-[6px] h-10 w-36 flex items-center justify-center'>
                View All Reviews
              </button>
            </div>
          </div>
        </section>
        {/* CTA */}

        <section className='bg-white mt-10   max-w-7xl mx-auto px-6'>
          <div className=' grid grid-cols-1 md:grid-cols-2 border border-gray-300 rounded-lg overflow-hidden'>
            {/* Left Side */}
            <div className='p-8 space-y-6 border-r border-gray-300'>
              <h3 className='text-2xl font-bold'>assetsigma</h3>

              <div className='flex items-start gap-4'>
                <span className='flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={24}
                    height={24}
                    fill='#6E6FE2'
                    viewBox='0 0 24 24'
                    className='w-6 h-6'
                  >
                    <path d='M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z' />
                  </svg>
                </span>
                <p className='text-gray-700 text-sm'>
                  203 Jay St, Suite 800 <br />
                  Brooklyn, NY 11201, USA
                </p>
              </div>

              <div className='flex items-start gap-4'>
                <span className='flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={24}
                    height={24}
                    fill='#6E6FE2'
                    viewBox='0 0 24 24'
                    className='w-6 h-6'
                  >
                    <path d='M6.62 10.79a15.534 15.534 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.72 11.72 0 0 0 3.69.59 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.07 21 3 13.93 3 5a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.5.59 3.69a1 1 0 0 1-.24 1.01l-2.23 2.09Z' />
                  </svg>
                </span>
                <div>
                  <p className='text-gray-700 text-sm'>+1 888-290-7750</p>
                  <p className='text-gray-700 text-sm'>+1 718-797-1900</p>
                </div>
              </div>

              <div className='flex items-start gap-4'>
                <span className='flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width={24}
                    height={24}
                    fill='#6E6FE2'
                    viewBox='0 0 24 24'
                    className='w-6 h-6'
                  >
                    <path d='M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 2v.01L12 13 4 6.01V6h16ZM4 18V8.236l7.386 5.905a1 1 0 0 0 1.228 0L20 8.236V18H4Z' />
                  </svg>
                </span>
                <p className='text-gray-700 text-sm mt-3'>info@assetsigma.com</p>
              </div>
            </div>

            {/* Right Side */}
            <div className='bg-gray-50 p-8'>
              <h3 className='text-xl font-semibold mb-2'>Contact Us</h3>
              <p className='text-gray-600 mb-6 text-sm'>
                We love hearing from our customers. If you have any questions about assetsigma, please send us a
                message. Please include your assetsigma account number—it lets us resolve your request faster and more
                accurately.
              </p>

              <form className='space-y-4 w-full max-w-3xl mx-auto p-4' onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    placeholder='Name'
                    className='border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:border-blue-400 focus:shadow-md focus:shadow-blue-400/50'
                    required
                  />

                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='Email'
                    className='border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:border-blue-400 focus:shadow-md focus:shadow-blue-400/50'
                    required
                  />
                </div>

                <div>
                  <textarea
                    name='message'
                    value={formData.message}
                    onChange={handleChange}
                    placeholder='Message'
                    rows='5'
                    className='border border-gray-300 p-2 w-full rounded-md focus:outline-none focus:border-blue-400 focus:shadow-md focus:shadow-blue-400/50'
                    required
                  ></textarea>
                </div>

                <div className='flex justify-start'>
                  <div
                    className='g-recaptcha transform origin-left scale-90 sm:scale-100'
                    data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                  />
                </div>

                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    type='submit'
                    style={{
                      backgroundColor: '#6E6FE2',
                      borderRadius: '6px'
                    }}
                    className='text-white px-6 py-2 hover:opacity-90'
                  >
                    Send
                  </button>

                  <button
                    type='button'
                    style={{
                      borderRadius: '6px'
                    }}
                    className='border border-red-500 text-red-500 px-6 py-2 hover:bg-red-50'
                    onClick={() => setFormData({ name: '', email: '', message: '' })}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <footer className='fixed bottom-0 left-0 w-full bg-gray-50 py-4 shadow-inner z-50'>
          <div className='max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center text-sm text-gray-700 flex-wrap gap-2'>
            <span>
              2025 © <span className='font-medium'>assetsigma</span>
            </span>

            <div className='flex items-center space-x-3'>
              <a href='#' className='text-blue-600 hover:underline'>
                Privacy Policy
              </a>
              <span className='text-gray-400'>|</span>
              <a href='#' className='text-blue-600 hover:underline'>
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default Page
