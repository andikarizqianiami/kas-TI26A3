'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Beranda', href: '#' },
    { name: 'Fitur', href: '#fitur' },
    { name: 'Cara Kerja', href: '#cara-kerja' },
    { name: 'Tentang', href: '#tentang' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-electric-blue/10">
      <div className="navbar-inner">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-3">
              {/* Logo UDB Official */}
              <img 
                src="/assets/logo-udb.png" 
                alt="Universitas Duta Bangsa" 
                className="h-14 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <div className="text-xl font-bold gradient-text">KAS TI26A3</div>
                <div className="text-xs text-gray-400">Universitas Duta Bangsa</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="px-4 py-2 text-base font-medium text-gray-300 hover:text-foreground hover:bg-navy-800 rounded-lg transition-all duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="primary" size="sm">
                Daftar
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-foreground hover:bg-navy-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-electric-blue/10 bg-navy-900/95 backdrop-blur-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-foreground hover:bg-navy-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              <Link href="/auth/login" className="block">
                <Button variant="outline" size="default" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/auth/login" className="block">
                <Button variant="primary" size="default" className="w-full">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
