'use client';

interface CryptoIconProps {
  ticker: string;
  size?: number;
  className?: string;
}

export function CryptoIcon({ ticker, size = 20, className = "" }: CryptoIconProps) {
  const getCryptoIcon = (ticker: string) => {
    const symbol = ticker.replace('USD', '').toUpperCase();
    
    switch (symbol) {
      case 'BTC':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#F7931A"/>
            <path fill="#FFFFFF" d="M16.32 8.25c-.254 1.67-1.472 2.446-2.97 2.7v.715h1.187v1.107h-1.187v1.107h-1.187v-1.107H11.78v-1.107h1.187v-.715c-1.498-.254-2.716-1.03-2.97-2.7-.254-1.67.715-2.97 2.213-3.224.254-1.67 1.472-2.446 2.97-2.7v-.715h1.187v1.107h1.187v-1.107h1.187v1.107h1.187v1.107h-1.187v.715c1.498.254 2.716 1.03 2.97 2.7.254 1.67-.715 2.97-2.213 3.224z"/>
          </svg>
        );
      case 'ETH':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#627EEA"/>
            <path fill="#FFFFFF" d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
          </svg>
        );
      case 'SOL':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#9945FF"/>
            <path fill="#FFFFFF" d="M5.027 15.754c-.1-.1-.1-.2-.1-.3s0-.2.1-.3l1.4-1.4c.1-.1.2-.1.3-.1s.2 0 .3.1l.1.1c.1.1.1.2.1.3s0 .2-.1.3l-1.4 1.4c-.1.1-.2.1-.3.1s-.2 0-.3-.1zm2.8-2.8c-.1-.1-.1-.2-.1-.3s0-.2.1-.3l1.4-1.4c.1-.1.2-.1.3-.1s.2 0 .3.1l.1.1c.1.1.1.2.1.3s0 .2-.1.3l-1.4 1.4c-.1.1-.2.1-.3.1s-.2 0-.3-.1zm2.8-2.8c-.1-.1-.1-.2-.1-.3s0-.2.1-.3l1.4-1.4c.1-.1.2-.1.3-.1s.2 0 .3.1l.1.1c.1.1.1.2.1.3s0 .2-.1.3l-1.4 1.4c-.1.1-.2.1-.3.1s-.2 0-.3-.1zm2.8-2.8c-.1-.1-.1-.2-.1-.3s0-.2.1-.3l1.4-1.4c.1-.1.2-.1.3-.1s.2 0 .3.1l.1.1c.1.1.1.2.1.3s0 .2-.1.3l-1.4 1.4c-.1.1-.2.1-.3.1s-.2 0-.3-.1z"/>
          </svg>
        );
      case 'ADA':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#0033AD"/>
            <path fill="#FFFFFF" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            <path fill="#FFFFFF" d="M12 6c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
          </svg>
        );
      case 'BNB':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#F3BA2F"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">B</text>
          </svg>
        );
      case 'XRP':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#23292F"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">XRP</text>
          </svg>
        );
      case 'DOGE':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#C2A633"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Ð</text>
          </svg>
        );
      case 'MATIC':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#8247E5"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">M</text>
          </svg>
        );
      case 'DOT':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#E6007A"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">DOT</text>
          </svg>
        );
      case 'AVAX':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#E84142"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">A</text>
          </svg>
        );
      case 'LINK':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#2A5ADA"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">LINK</text>
          </svg>
        );
      case 'UNI':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#FF007A"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">U</text>
          </svg>
        );
      case 'LTC':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#BFBBBB"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">Ł</text>
          </svg>
        );
      case 'ATOM':
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#2E3148"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">ATOM</text>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
            <circle cx="12" cy="12" r="12" fill="#6B7280"/>
            <text x="12" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">
              {symbol.length > 3 ? symbol.substring(0, 3) : symbol}
            </text>
          </svg>
        );
    }
  };

  return getCryptoIcon(ticker);
}