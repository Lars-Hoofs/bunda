import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-8 border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="mailto:info@bunda.be" className="hover:text-orange-500">info@bunda.be</a></li>
              <li><a href="tel:+32 2 123 45 67" className="hover:text-orange-500">+32 2 123 45 67</a></li>
              <li><a href="#" className="hover:text-orange-500">LinkedIn</a></li>
              <li><a href="#" className="hover:text-orange-500">Facebook</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Service</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/kopen" className="hover:text-orange-500">Woningen kopen</Link></li>
              <li><Link href="/huren" className="hover:text-orange-500">Woningen huren</Link></li>
              <li><Link href="/verkopen" className="hover:text-orange-500">Uw woning verkopen</Link></li>
              <li><Link href="/taxatie" className="hover:text-orange-500">Taxatie</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-4">Bunda</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/over-ons" className="hover:text-orange-500">Over ons</Link></li>
              <li><Link href="/makelaars" className="hover:text-orange-500">Makelaars</Link></li>
              <li><Link href="/vacatures" className="hover:text-orange-500">Vacatures</Link></li>
              <li><Link href="/nieuws" className="hover:text-orange-500">Nieuws</Link></li>
            </ul>
          </div>
          <div>
            <Button 
              className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-md w-full flex justify-between items-center p-3"
              onClick={() => window.location.href = "/contact"}
            >
              <span>Neem contact op</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 mb-12">
          <div className="text-6xl font-serif text-gray-700">bunda.</div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-xs text-gray-500">
          <p>© 2025 Bunda Vastgoed BV</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-orange-500">Privacybeleid</a>
            <a href="#" className="hover:text-orange-500">Gebruiksvoorwaarden</a>
            <a href="#" className="hover:text-orange-500">Cookie-instellingen</a>
          </div>
        </div>
      </div>
    </footer>
  );
}