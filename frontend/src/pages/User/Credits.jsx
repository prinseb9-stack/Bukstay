import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useGeoCurrency } from '../../hooks/useGeo'
import { Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import '../../styles/UserWallet.css'

export default function Credits() {
  const { userProfile } = useAuth()
  const { theme } = useTheme()
  const { formatPrice } = useGeoCurrency()
  const navigate = useNavigate()

  const credits = userProfile?.bukstayCredits || 0

  return (
    <div className={`${theme === 'dark' ? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen p-6`}>
      <div className="max-w-2xl mx-auto">
        <h1 className={`${theme === 'dark' ? 'text-white' : 'text-black'} text-3xl font-bold mb-8`}>
          BukStay Credits
        </h1>
        
        <div className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} p-8 rounded-2xl text-center`}>
          <div className="flex justify-center mb-6">
            <div className="bg-[#f5a623]/20 p-4 rounded-full">
              <Gift size={40} className="text-[#f5a623]" />
            </div>
          </div>
          
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            Your Credit Balance
          </p>
          <p className="text-5xl font-bold text-[#f5a623] mb-6">
            {formatPrice(credits)}
          </p>
          
          <div className={`${theme === 'dark' ? 'bg-[#0f0f1a]' : 'bg-gray-50'} p-4 rounded-lg mb-6`}>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>
              Credits are automatically applied at checkout to reduce your booking cost.
            </p>
          </div>

          {credits > 0 ? (
            <button 
              className="w-full bg-[#f5a623] text-black py-3 rounded-lg font-bold hover:bg-[#e0941a] transition-colors"
              onClick={() => navigate('/discover')}
            >
              Use Credits to Book a Stay
            </button>
          ) : (
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              <p className="mb-2">No credits yet</p>
              <p>Earn credits from refunds and special promotions</p>
            </div>
          )}
        </div>

        <div className={`${theme === 'dark' ? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl mt-6`}>
          <h3 className={`${theme === 'dark' ? 'text-white' : 'text-black'} font-bold mb-4`}>
            How Credits Work
          </h3>
          <ul className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} space-y-3 text-sm`}>
            <li className="flex items-start gap-2">
              <span className="text-[#f5a623]">✓</span>
              <span>Earned from booking refunds and promotional offers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f5a623]">✓</span>
              <span>Automatically applied at checkout - no codes needed</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#f5a623]">✓</span>
              <span>Never expires</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-500">✗</span>
              <span>Cannot be withdrawn to your bank</span>
            </li>
          </ul>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mt-4 pt-4 border-t border-gray-700`}>
            For real money deposits and withdrawals, use your{' '}
            <span 
              className="text-[#f5a623] cursor-pointer font-semibold"
              onClick={() => window.open('https://app.bukpay.com', '_blank')}
            >
              BukPay Wallet
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}