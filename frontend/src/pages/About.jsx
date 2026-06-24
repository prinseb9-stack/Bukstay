import { useTheme } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

export default function About() {
  const { theme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className={`${theme === 'dark'? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto p-6 py-16">
        <h1 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-4xl font-bold mb-6`}>
          About BukStay
        </h1>
        
        <div className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} space-y-4 text-lg leading-relaxed`}>
          <p>
            BukStay is a global platform for discovering and booking unique stays.
            From luxury villas in Sydney to beach houses in Mexico to apartments in Lagos, we connect travelers with verified hosts worldwide.
          </p>
          <p>
            Founded in 2025, our mission is to make travel seamless, safe, and memorable across borders.
            Every property is verified, every host is vetted, and every booking is protected by BukPay.
          </p>
          <p>
            Whether you're a business traveler, digital nomad, or family on vacation, BukStay helps you find your perfect stay in 100+ countries.
          </p>
        </div>

        <div className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-8 rounded-2xl mt-12`}>
          <h2 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-2xl font-bold mb-4`}>
            Powered by BukPay
          </h2>
          <p className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} mb-4`}>
            All payments are secured by BukPay, our global payment system. Instant payouts to hosts, zero hidden fees for guests.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-[#f5a623] text-xl">⚡</span>
              <div>
                <p className={`${theme === 'dark'? 'text-white' : 'text-black'} font-semibold`}>Instant Payouts</p>
                <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'}`}>Hosts get paid immediately</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#f5a623] text-xl">🌍</span>
              <div>
                <p className={`${theme === 'dark'? 'text-white' : 'text-black'} font-semibold`}>Global Coverage</p>
                <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'}`}>Pay in any currency</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#f5a623] text-xl">🔒</span>
              <div>
                <p className={`${theme === 'dark'? 'text-white' : 'text-black'} font-semibold`}>Bank-Level Security</p>
                <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'}`}>PCI-DSS compliant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { num: '100+', label: 'Countries' },
            { num: 'Verified', label: 'Properties' },
            { num: '24/7', label: 'Support' },
          ].map(stat => (
            <div key={stat.label} className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl text-center`}>
              <p className="text-[#f5a623] text-4xl font-bold mb-2">{stat.num}</p>
              <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-8 rounded-2xl mt-12 text-center`}>
          <h3 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-2xl font-bold mb-4`}>
            Ready to start your journey?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/discover')}
              className="bg-[#f5a623] hover:bg-[#e0941a] text-black px-8 py-3 rounded-lg font-bold transition-colors"
            >
              Explore Stays
            </button>
            <button 
              onClick={() => navigate('/register')}
              className={`${theme === 'dark'? 'bg-white text-black' : 'bg-black text-white'} px-8 py-3 rounded-lg font-bold transition-colors`}
            >
              Become a Host
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}