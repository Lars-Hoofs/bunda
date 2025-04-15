"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Home,
  MapPin,
  Euro,
  Bed,
  Square,
  Check,
  Star
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import api from "@/lib/api";

// Reusable animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ScrollSection component to handle scroll animations
const ScrollSection = ({ children }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={fadeIn}
    >
      {children}
    </motion.div>
  );
};

export default function WoningArchief() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);
  
  // State variables
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState({
    prijs_min: "",
    prijs_max: "",
    slaapkamers_min: "",
    oppervlakte_min: "",
    status: "beschikbaar",
    stad: "",
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [totalPages, setTotalPages] = useState(1);

  // Functie om data veilig uit API responses te halen
  const extractData = (response) => {
    // Check of de response een succes: true en data veld heeft
    if (response && response.succes === true && response.data) {
      return response.data;
    }
    
    // Sommige endpoints kunnen direct een array of object teruggeven zonder wrapper
    if (response && (Array.isArray(response) || typeof response === 'object')) {
      return response;
    }
    
    // Fallback: leeg resultaat
    return Array.isArray(response) ? [] : {};
  };

  // Load all properties when component mounts and detect when page has loaded
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        console.log("Fetching properties...");
        const response = await api.woning.getWoningen({ status: "beschikbaar" });
        console.log("Properties received:", response);
        
        // Extract properties data safely
        const propertiesData = extractData(response);
        
        // Sort by price (lowest to highest)
        const sortedProperties = Array.isArray(propertiesData) 
          ? propertiesData.sort((a, b) => a.prijs - b.prijs) 
          : [];
        
        setProperties(sortedProperties);
        setFilteredProperties(sortedProperties);
        setTotalPages(Math.ceil(sortedProperties.length / itemsPerPage));
      } catch (error) {
        console.error("Error fetching properties:", error);
        
        // Detailed error logging
        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          
          // Show more specific error message to the user
          if (error.response.data?.bericht) {
            setError(`Serverfout: ${error.response.data.bericht}`);
          } else {
            setError(`Serverfout ${error.response.status}: Er is een fout opgetreden bij het ophalen van woningen.`);
          }
        } else if (error.request) {
          console.error("Request made but no response received:", error.request);
          setError("De server reageert niet. Controleer je internetverbinding.");
        } else {
          console.error("Error setting up request:", error.message);
          setError(`Verzoekfout: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };
    
    fetchProperties();
  }, []);

  // Apply filters to properties
  const applyFilters = () => {
    let filtered = [...properties];
    
    // Filter by price (min)
    if (filters.prijs_min) {
      filtered = filtered.filter(property => property.prijs >= parseInt(filters.prijs_min));
    }
    
    // Filter by price (max)
    if (filters.prijs_max) {
      filtered = filtered.filter(property => property.prijs <= parseInt(filters.prijs_max));
    }
    
    // Filter by bedrooms
    if (filters.slaapkamers_min) {
      filtered = filtered.filter(property => 
        property.slaapkamers >= parseInt(filters.slaapkamers_min)
      );
    }
    
    // Filter by area
    if (filters.oppervlakte_min) {
      filtered = filtered.filter(property => 
        property.oppervlakte >= parseInt(filters.oppervlakte_min)
      );
    }
    
    // Filter by city
    if (filters.stad) {
      filtered = filtered.filter(property => 
        property.stad?.toLowerCase().includes(filters.stad.toLowerCase())
      );
    }
    
    // Filter by status
    if (filters.status) {
      filtered = filtered.filter(property => property.status === filters.status);
    }
    
    setFilteredProperties(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page after filtering
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle status selection change
  const handleStatusChange = (value) => {
    setFilters(prev => ({
      ...prev,
      status: value,
    }));
  };

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProperties.slice(startIndex, endIndex);
  };

  // Pagination helpers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Utility functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatAddress = (property) => {
    return `${property.straat || ''} ${property.huisnummer || ''}, ${property.stad || ''}`;
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section with parallax effect */}
      <section className="relative h-[50vh] flex items-center text-white">
        <motion.div
          className="absolute inset-0 z-0"
          style={{ opacity, scale }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <Image
            src="/images/herosection.png"
            alt="Moderne huizen achtergrond"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
       
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-5xl font-light leading-tight"
              variants={fadeInUp}
            >
              Ontdek uw <motion.span 
                className="italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >nieuwe thuis</motion.span>
            </motion.h1>
            <motion.p 
              className="text-lg font-light max-w-xl mx-auto"
              variants={fadeInUp}
            >
              Bekijk ons complete aanbod van beschikbare woningen
            </motion.p>
          </motion.div>
        </div>
      </section>

      <ScrollSection>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6">
            {/* Filters */}
            <motion.div 
              className="mb-8"
              variants={fadeInUp}
            >
              <motion.div 
                className="flex justify-between items-center mb-6"
                variants={fadeInUp}
              >
                <motion.h2 
                  className="text-3xl font-light text-gray-700"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  Alle <motion.span 
                    className="italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >beschikbare</motion.span> woningen
                </motion.h2>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    variant="outline"
                  >
                    <Filter size={16} />
                    Filters
                    <ChevronDown size={16} className={`transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </Button>
                </motion.div>
              </motion.div>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div 
                    className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                      variants={staggerContainer}
                    >
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prijsklasse</label>
                        <div className="flex space-x-2">
                          <Input
                            type="number"
                            placeholder="Min €"
                            value={filters.prijs_min}
                            onChange={(e) => handleFilterChange('prijs_min', e.target.value)}
                            className="w-1/2"
                          />
                          <Input
                            type="number"
                            placeholder="Max €"
                            value={filters.prijs_max}
                            onChange={(e) => handleFilterChange('prijs_max', e.target.value)}
                            className="w-1/2"
                          />
                        </div>
                      </motion.div>
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Slaapkamers</label>
                        <Select
                          value={filters.slaapkamers_min}
                          onValueChange={(value) => handleFilterChange('slaapkamers_min', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Aantal slaapkamers" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Alle</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Oppervlakte</label>
                        <Input
                          type="number"
                          placeholder="Minimale oppervlakte (m²)"
                          value={filters.oppervlakte_min}
                          onChange={(e) => handleFilterChange('oppervlakte_min', e.target.value)}
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Plaats</label>
                        <Input
                          type="text"
                          placeholder="Plaats"
                          value={filters.stad}
                          onChange={(e) => handleFilterChange('stad', e.target.value)}
                        />
                      </motion.div>
                      <motion.div variants={fadeInUp}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <Select
                          value={filters.status}
                          onValueChange={handleStatusChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                            <SelectItem value="onder_optie">Onder Optie</SelectItem>
                            <SelectItem value="verkocht">Verkocht</SelectItem>
                            <SelectItem value="">Alle statussen</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                      <motion.div className="flex items-end" variants={fadeInUp}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            onClick={applyFilters}
                            className="bg-yellow-400 text-black font-medium hover:bg-yellow-500"
                          >
                            Filters toepassen
                          </Button>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Error message if any */}
            {error && (
              <motion.div 
                className="bg-red-50 text-red-500 p-4 rounded-md flex items-center space-x-2 mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            
            {/* Property count */}
            <motion.div 
              className="mb-6 text-gray-600 flex items-center gap-2"
              variants={fadeInUp}
            >
              <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-sm font-medium text-gray-700">
                {filteredProperties.length} {filteredProperties.length === 1 ? 'woning' : 'woningen'} gevonden
              </span>
            </motion.div>
            
            {/* Properties display */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
            ) : filteredProperties.length === 0 ? (
              <motion.div 
                className="text-center py-12 bg-white rounded-lg border border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Home size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-900">Geen woningen gevonden</h3>
                <p className="mt-1 text-gray-500">Pas je filters aan om meer resultaten te zien.</p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                {getCurrentPageItems().map((property) => (
                  <motion.div 
                    key={property.id} 
                    variants={fadeInUp}
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden h-full shadow-sm rounded-xl">
                      <div className="h-48 relative bg-gray-200">
                        {property.isUitgelicht && (
                          <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-black text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                            <Star size={12} />
                            Uitgelicht
                          </div>
                        )}
                        <Image 
                          src="/images/zoute.jpg" 
                          alt={property.titel}
                          fill
                          className="object-cover"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-black/10"
                          whileHover={{ opacity: 0 }}
                        ></motion.div>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium text-gray-700">{property.titel}</CardTitle>
                        <p className="text-yellow-500 font-bold text-xl">
                          {formatCurrency(property.prijs)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} className="text-gray-400" />
                            <span>{formatAddress(property)}</span>
                          </div>
                          <div className="flex space-x-4">
                            <div className="flex items-center gap-1">
                              <Bed size={16} className="text-gray-400" />
                              <span>{property.slaapkamers || 0} slaapkamer{property.slaapkamers !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Square size={16} className="text-gray-400" />
                              <span>{property.oppervlakte || 0} m²</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              property.status === "verkocht" ? "bg-red-100 text-red-700" : 
                              property.status === "onder_optie" ? "bg-amber-100 text-amber-700" : 
                              "bg-green-100 text-green-700"
                            }`}>
                              {property.status === "verkocht" ? "Verkocht" : 
                               property.status === "onder_optie" ? "Onder optie" : 
                               "Beschikbaar"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              className="w-full bg-yellow-400 text-black font-medium hover:bg-yellow-500"
                              onClick={() => router.push(`/woningen/${property.id}`)}
                            >
                              Bekijk woning <motion.span 
                                animate={{ x: [0, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                className="ml-1 inline-block"
                              >→</motion.span>
                            </Button>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="mt-12 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ChevronLeft size={16} />
                      Vorige
                    </Button>
                  </motion.div>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant={currentPage === i + 1 ? "default" : "outline"}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-10 ${currentPage === i + 1 ? 'bg-yellow-400 hover:bg-yellow-500 text-black' : ''}`}
                        >
                          {i + 1}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      Volgende
                      <ChevronRight size={16} />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </ScrollSection>

      {/* CTA Section */}
      <ScrollSection>
        <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-300 text-white">
          <div className="container mx-auto px-6 text-center">
            <motion.h2 
              className="text-4xl font-light mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Niet gevonden wat u zoekt?<br />
              <motion.span 
                className="italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >Neem contact op</motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg font-light max-w-xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Onze specialisten helpen u graag bij het vinden van uw droomhuis, ook als deze nog niet in ons aanbod staat.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Button 
                className="bg-yellow-400 text-black font-medium rounded-md px-6 py-3"
                onClick={() => router.push("/contact")}
              >
                Contact opnemen <motion.span 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="ml-1 inline-block"
                >→</motion.span>
              </Button>
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <Footer />
    </div>
  );
}