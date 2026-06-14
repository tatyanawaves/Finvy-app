import { useLanguage } from '../context/LanguageContext'

/**
 * Хук для форматирования валюты на основе настроек пользователя.
 * @param {string} currency - Код валюты (KZT, USD, EUR и т.д.)
 * @returns {function} - Функция форматирования (amount) => string
 */
export function useCurrencyFormatter(currency = 'KZT') {
  const { lang } = useLanguage()

  const currencySymbols = {
    KZT: '₸',
    USD: '$',
    EUR: '€',
    RUB: '₽',
    GBP: '£',
    UAH: '₴',
    PLN: 'zł',
    CZK: 'Kč'
  }

  const symbol = currencySymbols[currency] || currency

  return (amount) => {
    const formattedValue = Math.abs(Math.round(amount)).toLocaleString(lang === 'kk' ? 'kk-KZ' : lang === 'ru' ? 'ru-RU' : 'en-US')
    
    // Правила размещения знака для разных валют
    if (currency === 'KZT' || currency === 'RUB' || currency === 'UAH') {
      return `${formattedValue} ${symbol}`
    }
    if (currency === 'USD' || currency === 'GBP') {
      return `${symbol}${formattedValue}`
    }
    
    return `${formattedValue} ${symbol}`
  }
}
