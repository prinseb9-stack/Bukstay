import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const faqs = [
  { 
    q: 'How do I book a property?', 
    a: 'Search for your destination, select dates and guests, click Book Now, and pay securely via BukPay or card. Instant confirmation worldwide.' 
  },
  { 
    q: 'Can I cancel my booking?', 
    a: 'Yes. Free cancellation up to 48 hours before check-in for most properties. Each host sets their own policy - check before booking.' 
  },
  { 
    q: 'How do I become a host?', 
    a: 'Click "Start Hosting" or register as a host, submit your property details and photos, and get verified in 24-48 hours. List anywhere globally.' 
  },
  { 
    q: 'Is my payment secure?', 
    a: '100%. We use BukPay, our secure payment system with bank-level encryption. Your card details never touch our servers. PCI-DSS compliant.' 
  },
  { 
    q: 'What if the property isn’t as described?', 
    a: 'Contact support within 24 hours of check-in. We’ll investigate and offer a full refund or relocate you immediately. Your safety is guaranteed.' 
  },
  { 
    q: 'Which countries do you support?', 
    a: 'BukStay operates globally. Book stays in 100+ countries including Nigeria, Ghana, Kenya, South Africa, USA, UK, Australia, Mexico, and more.' 
  },
  { 
    q: 'How does BukPay work?', 
    a: 'BukPay is our integrated payment system. Pay with card, bank transfer, or wallet. Instant payouts to hosts. Zero hidden fees. Coming soon to mobile.' 
  },
  { 
    q: 'Can I change my booking dates?', 
    a: 'Yes, subject to availability and host approval. Go to Profile → Bookings → Modify. Date changes may affect pricing.' 
  },
]

export default function Help() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(null)

  const handleContactSupport = () => {
    // Later: navigate to /support or open chat widget
    window.location.href = 'mailto:support@bukstay.com'
  }

  return (
    <div className={`${theme === 'dark'? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-3xl mx-auto p-6 py-16">
        <h1 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-4xl font-bold mb-2`}>
          Help Center
        </h1>
        <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} mb-8`}>
          Got questions? We’ve got answers for travelers and hosts worldwide.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`${theme === 'dark'? 'bg-[#1a1a2e] border-gray-700' : 'bg-white border-gray-200'} border rounded-xl transition-all`}
            >
              <button
                onClick={() => setOpen(open === idx? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center hover:opacity-80"
              >
                <span className={`${theme === 'dark'? 'text-white' : 'text-black'} font-semibold pr-4`}>
                  {faq.q}
                </span>
                <span className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} text-xl flex-shrink-0`}>
                  {open === idx? '−' : '+'}
                </span>
              </button>
              {open === idx && (
                <div className="px-5 pb-5 animate-fadeIn">
                  <p className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mt-12 text-center`}>
          <h3 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-xl font-bold mb-2`}>
            Still need help?
          </h3>
          <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            Our support team responds in under 10 minutes, 24/7
          </p>
          <button 
            onClick={handleContactSupport}
            className="bg-[#f5a623] hover:bg-[#e0941a] text-black px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Contact Support
          </button>
          <p className={`${theme === 'dark'? 'text-gray-500' : 'text-gray-500'} text-xs mt-4`}>
            support@bukstay.com · Powered by BukPay
          </p>
        </div>
      </div>
    </div>
  )
}