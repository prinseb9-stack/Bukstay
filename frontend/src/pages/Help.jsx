import { useTheme } from '../context/ThemeContext'
import { useState } from 'react'

const faqs = [
  { q: 'How do I book a property?', a: 'Search for your city, select dates, click Book Now, and pay securely via Paystack or card.' },
  { q: 'Can I cancel my booking?', a: 'Yes. Free cancellation up to 48 hours before check-in. Check property policy for details.' },
  { q: 'How do I become a host?', a: 'Click "Become Host" in the menu, submit your property details, and get verified in 24 hours.' },
  { q: 'Is my payment secure?', a: '100%. We use Paystack, Flutterwave, and Stripe. Your card details never touch our servers.' },
  { q: 'What if the property isn’t as described?', a: 'Contact support within 24 hours of check-in. We’ll refund or relocate you immediately.' },
]

export default function Help() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(null)

  return (
    <div className={`${theme === 'dark'? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-3xl mx-auto p-6 py-16">
        <h1 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-4xl font-bold mb-2`}>Help Center</h1>
        <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} mb-8`}>Got questions? We’ve got answers.</p>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`${theme === 'dark'? 'bg-[#1a1a2e] border-gray-700' : 'bg-white border-gray-200'} border rounded-xl`}>
              <button
                onClick={() => setOpen(open === idx? null : idx)}
                className="w-full p-5 text-left flex justify-between items-center"
              >
                <span className={`${theme === 'dark'? 'text-white' : 'text-black'} font-semibold`}>{faq.q}</span>
                <span className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} text-xl`}>{open === idx? '−' : '+'}</span>
              </button>
              {open === idx && (
                <div className="px-5 pb-5">
                  <p className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'}`}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mt-12 text-center`}>
          <h3 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-xl font-bold mb-2`}>Still need help?</h3>
          <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'} mb-4`}>Our support team responds in under 10 minutes</p>
          <button className="bg-[#f5a623] text-black px-6 py-3 rounded-lg font-bold">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}