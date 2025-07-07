'use client';

import { Instagram, Facebook, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white px-6 md:px-20 py-16 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12">
        
        {/* Brand Info */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-wide mb-4">KHUMAR</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Bold elegance meets modern craftsmanship. <br />
            Curated fashion, redefined with timeless design and soulful expression.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4 tracking-wide">Contact</h3>
          <ul className="text-sm space-y-2 text-gray-400 break-words">
            <li>
              Email:{' '}
              <a
                href="mailto:support@khumar.com"
                className="hover:text-white transition"
              >
                support@khumar.com
              </a>
            </li>
            <li>Location: Lahore, Pakistan</li>
            <li>
              Phone:{' '}
              <a
                href="tel:+923001234567"
                className="hover:text-white transition"
              >
                +92 300 1234567
              </a>
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4 tracking-wide">Follow Us</h3>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="p-2 rounded-full border border-white/20 hover:border-white transition duration-300 hover:shadow-[0_0_10px_#E1306C]"
            >
              <Instagram size={20} className="text-white hover:text-[#E1306C] transition duration-300" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="p-2 rounded-full border border-white/20 hover:border-white transition duration-300 hover:shadow-[0_0_10px_#1DA1F2]"
            >
              <Twitter size={20} className="text-white hover:text-[#1DA1F2] transition duration-300" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="p-2 rounded-full border border-white/20 hover:border-white transition duration-300 hover:shadow-[0_0_10px_#1877F2]"
            >
              <Facebook size={20} className="text-white hover:text-[#1877F2] transition duration-300" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-16 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} KHUMAR — All Rights Reserved.
      </div>
    </footer>
  );
}
