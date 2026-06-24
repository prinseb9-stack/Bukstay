import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin } from 'lucide-react'
import '../styles/Footer.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    Company: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' }
    ],
    Support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Safety', path: '/safety' },
      { label: 'Contact Us', path: '/contact' }
    ],
    Hosting: [
      { label: 'Become a Host', path: '/host' },
      { label: 'Host Resources', path: '/host/resources' },
      { label: 'Community', path: '/community' }
    ],
    Legal: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
      { label: 'Cookies', path: '/cookies' }
    ]
  }

  const socialLinks = [
    { icon: '📘', href: 'https://facebook.com/bukstay', label: 'Facebook' },
    { icon: '🐦', href: 'https://x.com/bukstay', label: 'X' },
    { icon: '📸', href: 'https://instagram.com/bukstay', label: 'Instagram' },
    { icon: '💼', href: 'https://linkedin.com/company/bukstay', label: 'LinkedIn' }
  ]

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">B</div>
              <span>BukStay</span>
            </Link>
            <p className="footer-desc">
              Find and book unique accommodations across Africa and beyond.
            </p>
            <div className="footer-contact">
              <a href="mailto:support@bukstay.com" className="footer-contact-item">
                <Mail size={14} /> support@bukstay.com
              </a>
              <a href="tel:+2348000000000" className="footer-contact-item">
                <Phone size={14} /> +234 800 000 0000
              </a>
              <div className="footer-contact-item">
                <MapPin size={14} /> Lagos, Nigeria
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="footer-col">
              <h3 className="footer-col-title">{category}</h3>
              <ul className="footer-links">
                {links.map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} BukStay. All rights reserved.</p>
          <div className="footer-social">
            {socialLinks.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label={s.label}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
