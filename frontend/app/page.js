"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "../components/navigation";
import Footer from "../components/footer";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";

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

export default function HomePage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95]);

  // Detect when page has loaded
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section with parallax effect */}
      <section className="relative h-screen flex items-center text-white">
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
       
        <div className="container mx-auto px-6 pt-24 relative z-10">
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
              De <motion.span 
                className="italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >eenvoudige manier</motion.span> om uw <br />droomhuis te vinden
            </motion.h1>
            <motion.p 
              className="text-lg font-light max-w-xl mx-auto"
              variants={fadeInUp}
            >
              De toekomst van huizenzoeken begint met de juiste ondersteuning.
            </motion.p>
            <motion.p 
              className="text-base font-light max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Bunda ondersteunt u bij elke stap van het proces, met betrouwbare expertise
              en geavanceerde tools om uw perfecte woning te vinden. Onze persoonlijke
              benadering zorgt voor een zorgeloze ervaring van zoeken tot kopen.
            </motion.p>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInLeft}>
                <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="bg-white text-black border-white rounded-lg h-14 w-full transition-all duration-300 hover:scale-105"
                    onClick={() => router.push("/zoeken")}
                  >
                    Vind uw droomhuis
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeInRight}>
                <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="bg-white text-black border-white rounded-lg h-14 w-full transition-all duration-300 hover:scale-105"
                    onClick={() => router.push("/verkopen")}
                  >
                    Verkoop uw woning
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <ScrollSection>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeInLeft}
              >
                <h2 className="text-4xl font-light text-gray-700 mb-4">
                  De woningmarkt verandert.<br />
                  <motion.span 
                    className="italic"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    viewport={{ once: true }}
                  >Bent u er klaar voor?</motion.span>
                </h2>
                <motion.p 
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  Ons begrip van wat een perfecte woonomgeving is evolueert voortdurend. Moet de manier waarop we huizen kopen en verkopen dan niet ook veranderen?
                </motion.p>
                <motion.p 
                  className="text-gray-600 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  In een verouderd systeem dat standaardprocessen hanteert, helpt Bunda u met een persoonlijke aanpak die perfect aansluit bij uw woonwensen en situatie.
                </motion.p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-yellow-400 text-black font-medium rounded-md">
                    Meer informatie <motion.span 
                      className="ml-2 inline-block"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    >→</motion.span>
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div 
                className="grid grid-cols-2 gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeIn} whileHover={{ y: -5 }}>
                  <Card className="shadow-md overflow-hidden rounded-lg">
                    <CardContent className="p-0">
                      <div className="bg-gray-700 p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <motion.div 
                            className="w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            whileHover={{ scale: 1.2, backgroundColor: "#FCD34D" }}
                          >
                            <span className="text-gray-800 text-xs">✓</span>
                          </motion.div>
                          <span className="text-white text-sm font-medium">Bezichtigingen</span>
                        </div>
                        <span className="text-xs text-yellow-300">WEEK VAN 24-30 JUNI</span>
                      </div>
                      <div className="p-3 bg-gray-100">
                        <div className="flex justify-between">
                          {['24', '25', '26', '27', '28', '29', '30'].map((day, index) => (
                            <motion.div 
                              key={index} 
                              className="flex flex-col items-center"
                              initial={{ opacity: 0, y: 10 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05, duration: 0.3 }}
                              viewport={{ once: true }}
                            >
                              <span className="text-xs text-gray-600">{day}</span>
                              <motion.div 
                                className={`w-6 h-6 rounded-full flex items-center justify-center mt-1 ${day === '27' ? 'bg-yellow-400' : 'bg-gray-200'}`}
                                whileHover={{ scale: 1.2 }}
                              >
                                {day === '27' ? <motion.span
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                                >✓</motion.span> : ''}
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div variants={fadeIn} whileHover={{ y: -5 }}>
                  <Card className="shadow-md overflow-hidden rounded-lg">
                    <CardContent className="p-0">
                      <div className="bg-gray-700 p-3 flex justify-between items-center">
                        <span className="text-white text-sm font-medium">Prijsontwikkeling</span>
                      </div>
                      <div className="p-3 bg-gray-100">
                        <div className="h-32 relative">
                          {['J', 'F', 'M', 'A', 'M', 'J', 'J'].map((month, index) => (
                            <motion.div 
                              key={index} 
                              className="absolute bottom-0" 
                              style={{left: `${index * 14}%`}}
                              initial={{ height: 0 }}
                              whileInView={{ height: `${[64, 69, 54, 47, 67, 81, 80][index]}%` }}
                              transition={{ duration: 0.7, delay: index * 0.1 }}
                              viewport={{ once: true }}
                            >
                              <motion.div 
                                className="w-6 bg-yellow-400" 
                                style={{ height: `${[64, 69, 54, 47, 67, 81, 80][index]}%` }}
                                whileHover={{ backgroundColor: "#FCD34D" }}
                              ></motion.div>
                              <span className="text-xs text-gray-600 mt-1">{month}</span>
                            </motion.div>
                          ))}
                        </div>
                        <motion.p 
                          className="text-xs text-gray-600 mt-4"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          transition={{ delay: 1, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          De woningprijzen in uw regio zijn gemiddeld 3,2% gestegen ten opzichte van vorig jaar. Dit is een gunstig moment om te investeren.
                        </motion.p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div 
                  className="col-span-2" 
                  variants={fadeIn} 
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="shadow-md overflow-hidden rounded-lg">
                    <CardContent className="p-0">
                      <div className="relative h-64 w-full">
                        <Image 
                          src="/images/zoute.jpg" 
                          alt="Luxe woning met zwembad" 
                          fill 
                          className="object-cover"
                        />
                        <motion.div 
                          className="absolute inset-0 bg-black/5"
                          whileHover={{ backgroundColor: "rgba(0,0,0,0)" }}
                        ></motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      </ScrollSection>

      {/* Featured Button */}
      <ScrollSection>
        <section className="py-10 bg-white text-center">
          <motion.div 
            className="inline-block rounded-full bg-yellow-100 px-4 py-1"
            whileInView={{ scale: [0.9, 1.1, 1] }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium text-gray-700">Diensten</span>
          </motion.div>
        </section>
      </ScrollSection>

      {/* Bunda Difference Section */}
      <ScrollSection>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-light text-gray-700 mb-2">
                Het Bunda <motion.span 
                  className="italic"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  viewport={{ once: true }}
                >verschil</motion.span>:
              </h2>
              <h3 className="text-4xl font-light text-gray-700 mb-8">
                hoe wij werken
              </h3>
              <motion.p 
                className="text-gray-600 max-w-3xl mx-auto mb-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Ga in zee met Bunda om eenvoudig, snel en zorgeloos uw woning te kopen of verkopen. Wij helpen u bij elke stap van het proces, met persoonlijke begeleiding en transparant advies. We staan voor u klaar.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="bg-yellow-400 text-black font-medium rounded-md mb-16">
                  Ons proces <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="ml-1 inline-block"
                  >→</motion.span>
                </Button>
              </motion.div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {[
                {
                  label: "Zoeken",
                  title: "Vind uw ideale woning",
                  text: "met onze geavanceerde zoekhulp"
                },
                {
                  label: "Begeleiding",
                  title: "De beste persoonlijke",
                  text: "service bij elke stap van het proces"
                },
                {
                  label: "Afronden",
                  title: "Maak uw woonwens",
                  text: "werkelijkheid tegen de beste voorwaarden"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative rounded-xl overflow-hidden bg-gray-100"
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="absolute top-4 left-4 bg-white/90 rounded-full px-4 py-1 z-10"
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                  >
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </motion.div>
                  <motion.div 
                    className="absolute top-4 right-4 bg-gray-500 rounded-full w-8 h-8 flex items-center justify-center z-10"
                    whileHover={{ scale: 1.1, backgroundColor: "#FCD34D" }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="text-white text-xl">+</span>
                  </motion.div>
                  <div className="h-80 relative">
                    <Image 
                      src="/images/zoute.jpg" 
                      alt={`${item.label} afbeelding`}
                      fill 
                      className="object-cover"
                    />
                    <motion.div 
                      className="absolute inset-0 bg-black/10"
                      whileHover={{ opacity: 0 }}
                    ></motion.div>
                  </div>
                  <motion.div 
                    className="p-6 text-left relative bg-white"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-medium text-gray-700 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">
                      {item.text}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      <section className="py-16 relative text-white">
        <Image
          src="/images/bluesection.png"
          alt="Digitale tools achtergrond"
          fill
          className="object-cover z-10 relative"
        />
        
        <motion.div 
          className="container mx-auto px-6 relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="space-y-6"
              variants={fadeInLeft}
            >
              <h2 className="text-4xl font-light leading-tight">
                Digitale <motion.span 
                  className="italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >tools</motion.span><br />
                voor de moderne huizenjager
              </h2>
              <motion.p 
                className="text-base"
                variants={fadeInUp}
              >
                Beschouw ons als uw persoonlijke vastgoedassistent.
              </motion.p>
              <motion.p 
                className="text-base"
                variants={fadeInUp}
              >
                Bunda maakt gebruik van de nieuwste technologie en eigen tools zoals onze 
                huizenzoeker en woonwensscan om het zoekproces te vereenvoudigen, 
                communicatie te stroomlijnen en een gepersonaliseerde ervaring te bieden 
                die aansluit bij de verwachtingen van de moderne woningzoeker.
              </motion.p>
            </motion.div>
            <motion.div 
              className="relative"
              variants={fadeInRight}
            >
              <motion.div 
                className="relative bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden p-5"
                whileHover={{ y: -5, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
              >
                <div className="relative w-full h-96">
                  <Image 
                    src="/images/zoute.jpg" 
                    alt="Woning zoeken op tablet" 
                    fill
                    className="object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-xl"></div>
                </div>
                
                <motion.div 
                  className="absolute right-12 top-12 bg-gray-700/90 rounded-xl p-3 max-w-xs z-20"
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <p className="text-white text-sm mb-1">Help me bij het zoeken naar een huis in Gent.</p>
                  <p className="text-xs text-gray-300">14:23</p>
                </motion.div>
                
                <motion.div 
                  className="absolute right-8 top-32 bg-gray-700/90 rounded-xl p-3 max-w-xs z-20"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <p className="text-white text-sm font-medium mb-2">Uw zoekcriteria:</p>
                  <motion.ul
                    className="text-white text-sm space-y-2 list-disc pl-5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                  >
                    {["Minimaal 3 slaapkamers", "Budget tot €450.000", "Tuin of terras gewenst", "Maximaal 5km van stadscentrum"].map((item, index) => (
                      <motion.li 
                        key={index}
                        variants={fadeInUp}
                        transition={{ delay: 1.5 + (index * 0.2) }}
                      >
                        {item}
                      </motion.li>
                    ))}
                  </motion.ul>
                  <p className="text-xs text-gray-300 mt-2">14:30</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>,
                title: "Gepersonaliseerde zoekprofielen",
                description: "Bunda maakt gebruik van geavanceerde algoritmes om uw woonwensen te analyseren en perfect matchende woningen te vinden. Dit stelt u in staat om alleen woningen te bekijken die écht bij uw situatie passen."
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>,
                title: "Efficiëntie door automatisering",
                description: "Onze technologie automatiseert routinetaken zoals het plannen van bezichtigingen, het bijhouden van contactmomenten en het beheren van documenten. Dit stroomlijnt het proces, vermindert fouten en geeft onze makelaars meer tijd om zich te richten op wat echt belangrijk is - u helpen bij het vinden van uw droomhuis."
              },
              {
                icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>,
                title: "Klantbetrokkenheid",
                description: "De Bunda-app zorgt voor continue communicatie tussen kopers/verkopers en makelaars. Het biedt realtime updates over nieuwe woningen, prijswijzigingen en markttrends. Dit houdt u betrokken bij uw zoektocht en helpt onze makelaars om u optimaal te begeleiden."
              }
            ].map((item, index) => (
              <motion.div 
                className="flex flex-col"
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="bg-blue-500/50 p-3 rounded-lg w-10 h-10 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(59, 130, 246, 0.7)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  {item.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-medium mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {item.title}
                </motion.h3>
                <motion.p 
                  className="text-sm font-light"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  {item.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <ScrollSection>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <motion.h2 
              className="text-4xl font-light text-gray-700 text-center mb-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              De vastgoedmarkt veranderen<br />
              <motion.span 
                className="italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >voor een betere woonervaring</motion.span>
            </motion.h2>
            
            <motion.div 
              className="max-w-3xl mx-auto text-center mb-16"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-600">
                Door de juiste technologie in te zetten, helpt Bunda zowel kopers als verkopers bij het optimaliseren van hun woonervaring, zonder de persoonlijke touch te verliezen. We maken het mogelijk om datagedreven en persoonlijke vastgoeddiensten te leveren met een model dat werkt.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
            >
              {/* First card with property value */}
              <motion.div
                className="relative rounded-xl overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 flex items-center space-x-1 z-10"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Woningwaarde</span>
                </motion.div>
                <div className="h-80 relative">
                  <Image 
                    src="/images/zoute.jpg" 
                    alt="Moderne woning" 
                    fill 
                    className="object-cover"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-black/10"
                    whileHover={{ opacity: 0 }}
                  ></motion.div>
                </div>
                <motion.div 
                  className="absolute bottom-4 left-4 bg-black/80 p-2 rounded-md z-10"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <motion.p 
                        className="text-white text-xl font-semibold"
                        initial={{ scale: 0.5 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.7 }}
                        viewport={{ once: true }}
                      >425K</motion.p>
                      <p className="text-white text-xs">EUR</p>
                      <motion.p 
                        className="text-green-400 text-xs"
                        animate={{ color: ["#4ADE80", "#34D399", "#4ADE80"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >+5.2%</motion.p>
                      <p className="text-gray-400 text-xs">Marktwaarde</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <motion.p 
                        className="text-white text-xl font-semibold"
                        initial={{ scale: 0.5 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.8 }}
                        viewport={{ once: true }}
                      >165</motion.p>
                      <p className="text-white text-xs">m²</p>
                      <p className="text-gray-400 text-xs">Woon-<br/>oppervlakte</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <motion.p 
                        className="text-white text-xl font-semibold"
                        initial={{ scale: 0.5 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.9 }}
                        viewport={{ once: true }}
                      >A</motion.p>
                      <p className="text-white text-xs">Label</p>
                      <motion.p 
                        className="text-yellow-400 text-xs"
                        animate={{ color: ["#FACC15", "#FCD34D", "#FACC15"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >DUURZAAM</motion.p>
                      <p className="text-gray-400 text-xs">Energie</p>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
              
              {/* Second card with image */}
              <motion.div 
                className="relative rounded-xl overflow-hidden"
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-80 relative">
                  <Image 
                    src="/images/zoute.jpg" 
                    alt="Makelaar met klant" 
                    fill 
                    className="object-cover"
                  />
                  <motion.div 
                    className="absolute inset-0 bg-black/10"
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  ></motion.div>
                </div>
              </motion.div>
              
              {/* Third card with market trends */}
              <motion.div 
                className="relative rounded-xl overflow-hidden"
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 flex items-center space-x-1 z-10"
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 1)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-orange-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                  </svg>
                  <span className="text-xs font-medium text-gray-700">Markttrends</span>
                </motion.div>
                <motion.div 
                  className="h-80 bg-gradient-to-b from-yellow-200 to-orange-400 p-6 relative"
                  whileHover={{ 
                    backgroundImage: "linear-gradient(to bottom, #FEF3C7, #FB923C)" 
                  }}
                >
                  <div className="flex justify-between items-center mt-8">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'].map((month, index) => (
                      <motion.span 
                        key={index} 
                        className="text-xs text-gray-600"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.3 }}
                        viewport={{ once: true }}
                      >
                        {month}
                      </motion.span>
                    ))}
                  </div>
                  <motion.div 
                    className="relative h-40 mt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <svg viewBox="0 0 100 40" className="w-full h-full">
                      <motion.path 
                        d="M0,30 Q10,28 20,25 T40,20 T60,18 T80,15 T100,12" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ delay: 0.7, duration: 1.5, ease: "easeInOut" }}
                        viewport={{ once: true }}
                      />
                    </svg>
                  </motion.div>
                  <motion.p 
                    className="text-gray-700 text-sm mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    Woningprijzen in deze regio stijgen gestaag met 3-5% per jaar
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Real Estate Terms */}
            <motion.div 
              className="flex flex-wrap justify-center gap-x-4 gap-y-3 mt-8 mb-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              {[
                { name: "Comfort", icon: "/images/comfort-icon.jpg" },
                { name: "Duurzaam", icon: "/images/duurzaam-icon.jpg" },
                { name: "Investering", icon: "/images/investering-icon.jpg" },
                { name: "Locatie", icon: "/images/locatie-icon.jpg" },
                { name: "Maatwerk", icon: "/images/zoute.jpg" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-300 rounded-full px-6 py-2 flex items-center gap-2"
                  variants={fadeIn}
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    borderColor: "#FCD34D"
                  }}
                >
                  <motion.div 
                    className="w-8 h-8 rounded-full overflow-hidden"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Image 
                      src={item.icon}
                      alt={item.name} 
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </motion.div>
                  <span className="text-xl font-light text-gray-700">{item.name}</span>
                </motion.div>
              ))}
            </motion.div>
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
              Ontdek het<br />
              <motion.span 
                className="italic"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >Bunda verschil</motion.span>
            </motion.h2>
            <motion.p 
              className="text-lg font-light max-w-xl mx-auto mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Sluit u aan bij onze community van toekomstgerichte woningzoekers en transformeer uw vastgoedervaring.
            </motion.p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  className="bg-yellow-400 text-black font-medium rounded-md px-6 py-3"
                  onClick={() => router.push("/over-ons")}
                >
                  Meer informatie <motion.span 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="ml-1 inline-block"
                  >→</motion.span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollSection>

      {/* Footer */}
      <Footer />
    </div>
  );
}