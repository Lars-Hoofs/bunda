import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const buttonStyle = {
    backgroundColor: "white",
    color: "black",
    transition: "none"
  };

  return (
    <header className="bg-white-400/60 fixed w-full z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-semibold text-white">bunda.</Link>
        </div>
        
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center justify-center flex-1 mx-6">
          <Link href="/kopen" className="px-4 text-sm font-medium text-white">Kopen</Link>
          <Link href="/huren" className="px-4 text-sm font-medium text-white">Huren</Link>
          <Link href="/verkopen" className="px-4 text-sm font-medium text-white">Verkopen</Link>
          <Link href="/makelaars" className="px-4 text-sm font-medium text-white">Makelaars</Link>
          <Link href="/blog" className="px-4 text-sm font-medium text-white">Blog</Link>
        </nav>
        
        <Button 
          className="hidden md:block bg-white text-black font-medium rounded-md px-5 py-2 text-sm"
          style={buttonStyle}
          onClick={() => router.push("/contact")}
          variant="ghost" 
        >
          Contact
        </Button>
      </div>
      
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 py-2">
          <div className="container mx-auto px-4 flex flex-col space-y-2">
            <Link 
              href="/kopen" 
              className="text-white py-2 px-4 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Kopen
            </Link>
            <Link 
              href="/huren" 
              className="text-white py-2 px-4 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Huren
            </Link>
            <Link 
              href="/verkopen" 
              className="text-white py-2 px-4 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Verkopen
            </Link>
            <Link 
              href="/makelaars" 
              className="text-white py-2 px-4 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Makelaars
            </Link>
            <Link 
              href="/blog" 
              className="text-white py-2 px-4 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Button 
              className="bg-white text-black font-medium w-full rounded-md py-2 text-sm"
              style={buttonStyle}
              onClick={() => {
                router.push("/contact");
                setIsMenuOpen(false);
              }}
              variant="ghost" 
            >
              Contact
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}