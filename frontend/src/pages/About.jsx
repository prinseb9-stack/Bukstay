import { useTheme } from '../context/ThemeContext'

export default function About() {
  const { theme } = useTheme()

  return (
    <div className={`${theme === 'dark'? 'bg-[#0f0f1a]' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-4xl mx-auto p-6 py-16">
        <h1 className={`${theme === 'dark'? 'text-white' : 'text-black'} text-4xl font-bold mb-6`}>About BukStay</h1>
        <div className={`${theme === 'dark'? 'text-gray-300' : 'text-gray-700'} space-y-4 text-lg leading-relaxed`}>
          <p>
            BukStay is Africa's premier platform for discovering and booking unique stays.
            From luxury hotels in Lagos to beach resorts in Accra, we connect travelers with verified hosts across 50+ cities.
          </p>
          <p>
            Founded in 2025, our mission is to make travel across Africa seamless, safe, and memorable.
            Every property is verified, every host is vetted, and every booking is protected.
          </p>
          <p>
            Whether you're a business traveler, backpacker, or family on vacation, BukStay helps you find your perfect stay.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { num: '50+', label: 'Cities' },
            { num: '10k+', label: 'Properties' },
            { num: '100k+', label: 'Happy Guests' },
          ].map(stat => (
            <div key={stat.label} className={`${theme === 'dark'? 'bg-[#1a1a2e]' : 'bg-white'} p-6 rounded-2xl text-center`}>
              <p className="text-[#f5a623] text-4xl font-bold mb-2">{stat.num}</p>
              <p className={`${theme === 'dark'? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}