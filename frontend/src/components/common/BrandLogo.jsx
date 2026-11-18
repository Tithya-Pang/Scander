// Official Gather Grounds logo. Use variant="light" on dark backgrounds.
const sources = {
  dark: '/images/brand/gather-grounds-logo.png',
  light: '/images/brand/gather-grounds-logo-light.png',
};

export default function BrandLogo({ className = '', variant = 'dark' }) {
  return <img className={`brand-logo ${className}`} src={sources[variant] || sources.dark} alt="Gather Grounds Coffee & Eatery" width="810" height="343" decoding="async"/>;
}
