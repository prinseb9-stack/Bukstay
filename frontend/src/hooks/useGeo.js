import { useState, useEffect } from 'react'

const CURRENCY_MAP = {
  NG: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
  GB: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  CA: { code: 'CAD', symbol: 'C$', locale: 'en-CA' },
  GH: { code: 'GHS', symbol: '₵', locale: 'en-GH' },
  KE: { code: 'KES', symbol: 'KSh', locale: 'en-KE' },
  ZA: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  DEFAULT: { code: 'USD', symbol: '$', locale: 'en-US' }
}

export function useGeoCurrency() {
  const [location, setLocation] = useState({
    country: '',
    countryCode: '',
    city: '',
    region: '',
    latitude: null,
    longitude: null
  })

  const [currency, setCurrency] = useState(CURRENCY_MAP.DEFAULT)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data = await response.json()

        const countryCode = data.country_code || 'US'

        const currencyData =
          CURRENCY_MAP[countryCode] ||
          CURRENCY_MAP.DEFAULT

        setLocation({
          country: data.country_name || '',
          countryCode,
          city: data.city || '',
          region: data.region || '',
          latitude: data.latitude || null,
          longitude: data.longitude || null
        })

        setCurrency(currencyData)
      } catch (error) {
        console.error(
          'Geo detection failed:',
          error
        )

        setLocation({
          country: 'United States',
          countryCode: 'US',
          city: '',
          region: '',
          latitude: null,
          longitude: null
        })

        setCurrency(CURRENCY_MAP.DEFAULT)
      } finally {
        setLoading(false)
      }
    }

    detectLocation()
  }, [])

  const formatPrice = (amount = 0) => {
    return `${currency.symbol}${Number(
      amount
    ).toLocaleString(currency.locale)}`
  }

  return {
    loading,

    // location
    country: location.country,
    countryCode: location.countryCode,
    city: location.city,
    region: location.region,
    latitude: location.latitude,
    longitude: location.longitude,

    // currency
    currency,
    currencyCode: currency.code,
    currencySymbol: currency.symbol,
    currencyLocale: currency.locale,

    formatPrice
  }
}