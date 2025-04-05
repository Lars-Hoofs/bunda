"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    voornaam: "",
    achternaam: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState({ checked: false, available: true });
  
  // Check if the registration API endpoint exists
  useState(() => {
    const checkApiEndpoint = async () => {
      try {
        // Just checking if the API is configured
        console.log("API URL configured as:", process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');
        setApiStatus({ checked: true, available: true });
      } catch (err) {
        console.error("API endpoint check failed:", err);
        setApiStatus({ checked: true, available: false });
      }
    };
    
    checkApiEndpoint();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Move to next step
  const handleNextStep = (e) => {
    e.preventDefault();
    
    // Validate current step
    if (step === 1) {
      if (!formData.voornaam || !formData.achternaam) {
        setError("Vul alstublieft uw naam in");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!formData.email) {
        setError("Vul alstublieft een geldig e-mailadres in");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation
    if (!formData.password) {
      setError("Vul alstublieft een wachtwoord in");
      return;
    }
    
    if (formData.password !== formData.passwordConfirm) {
      setError("Wachtwoorden komen niet overeen");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // Create user registration data object - making sure field names match the backend expectations
      const userData = {
        voornaam: formData.voornaam,
        achternaam: formData.achternaam,
        email: formData.email,
        wachtwoord: formData.password // Changed from 'password' to 'wachtwoord' to match backend
      };
      
      console.log("Sending registration data:", userData);
      
      // You can uncomment this to debug the API
      // Try a direct axios request to see more details about the error
      /*
      const directResponse = await fetch('/api/auth/registreren', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const responseData = await directResponse.json();
      console.log("Direct response:", directResponse.status, responseData);
      */
      
      const response = await api.auth.registreren(userData);
      console.log("Registration successful:", response);
      
      // Successful registration
      router.push("/login?registered=true"); // Redirect to login page
    } catch (error) {
      console.error("Registration error:", error);
      // More detailed error logging
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        setError(error.response.data?.message || `Registratie mislukt (${error.response.status}). Controleer uw gegevens.`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("Geen reactie van de server. Controleer uw internetverbinding.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setError(`Registratie mislukt: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social registration
  const handleSocialRegister = (provider) => {
    // Implement social registration logic here
    console.log(`Register with ${provider}`);
    // This would typically redirect to an OAuth flow
  };

  // Go back to previous step
  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  return (
    <div className="h-screen w-screen p-2 bg-black">
      <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Left column - Registration form */}
        <div className="bg-white p-6 rounded-xl flex items-center justify-center">
          <div className="w-full max-w-md space-y-4">
            {/* Logo */}
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-medium tracking-tight text-black">Account Aanmaken</h1>
              <p className="text-sm text-gray-500">
                {step === 1 && "Vul uw persoonlijke gegevens in"}
                {step === 2 && "Voer uw e-mailadres in"}
                {step === 3 && "Kies een sterk wachtwoord"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {!apiStatus.available && apiStatus.checked && (
              <div className="bg-yellow-50 text-yellow-700 p-3 rounded-md text-sm">
                Waarschuwing: Het lijkt erop dat de API-eindpunten niet beschikbaar zijn. 
                Registratie werkt mogelijk niet. Controleer of uw backend-server actief is.
              </div>
            )}

            <form className="space-y-4" onSubmit={step === 3 ? handleSubmit : handleNextStep}>
              {/* Step 1: Personal details */}
              {step === 1 && (
                <>
                  <div className="space-y-1">
                    <Input 
                      type="text" 
                      name="voornaam"
                      placeholder="Voornaam" 
                      className="h-12 text-sm border-gray-200" 
                      value={formData.voornaam}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Input 
                      type="text" 
                      name="achternaam"
                      placeholder="Achternaam" 
                      className="h-12 text-sm border-gray-200" 
                      value={formData.achternaam}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </>
              )}

              {/* Step 2: Email */}
              {step === 2 && (
                <div className="space-y-1">
                  <Input 
                    type="email" 
                    name="email"
                    placeholder="E-mailadres" 
                    className="h-12 text-sm border-gray-200" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              )}

              {/* Step 3: Password */}
              {step === 3 && (
                <>
                  <div className="space-y-1">
                    <Input 
                      type="password" 
                      name="password"
                      placeholder="Wachtwoord" 
                      className="h-12 text-sm border-gray-200" 
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Wachtwoord moet minimaal 8 tekens bevatten, waaronder een hoofdletter, 
                      een kleine letter en een cijfer.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Input 
                      type="password" 
                      name="passwordConfirm"
                      placeholder="Bevestig wachtwoord" 
                      className="h-12 text-sm border-gray-200" 
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2">
                {step > 1 && (
                  <Button 
                    type="button" 
                    className="w-full h-12 bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={handleBack}
                  >
                    Terug
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? "Bezig..." 
                    : step < 3 
                      ? "Volgende" 
                      : "Registreren"}
                </Button>
              </div>

              {step === 1 && (
                <>
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-gray-200 w-full absolute"></div>
                    <span className="relative bg-white px-2 text-xs text-gray-500">OF</span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm border-gray-200 flex items-center justify-center gap-2"
                      onClick={() => handleSocialRegister('google')}
                    >
                      <svg 
                        viewBox="-3 0 262 262" 
                        xmlns="http://www.w3.org/2000/svg" 
                        preserveAspectRatio="xMidYMid" 
                        className="h-4 w-4"
                      >
                        <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"></path>
                        <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"></path>
                        <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"></path>
                        <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"></path>
                      </svg>
                      Registreer met Google
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm border-gray-200 flex items-center justify-center gap-2"
                      onClick={() => handleSocialRegister('microsoft')}
                    >
                      <svg 
                        height="16px" 
                        width="16px"
                        viewBox="0 0 512 512" 
                        className="h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M270.912,241.049h223.691V31.708c0-8.26-6.68-14.958-14.914-14.958H270.912V241.049z" style={{fill:"#5ACF5F"}}/>
                        <path d="M241.09,241.049V16.75H32.313c-8.236,0-14.916,6.698-14.916,14.958v209.341H241.09z" style={{fill:"#F84437"}}/>
                        <path d="M241.09,270.953H17.397v209.343c0,8.251,6.68,14.954,14.916,14.954H241.09V270.953z" style={{fill:"#2299F8"}}/>
                        <path d="M270.912,270.953V495.25h208.777c8.234,0,14.914-6.703,14.914-14.954V270.953H270.912z" style={{fill:"#FFC107"}}/>
                      </svg>
                      Registreer met Microsoft
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 text-sm border-gray-200 flex items-center justify-center gap-2"
                      onClick={() => handleSocialRegister('x')}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px" 
                        height="16px" 
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                      >
                        <path d="M14.095479,10.316482L22.286354,1h-1.940718l-7.115352,8.087682L7.551414,1H1l8.589488,12.231093L1,23h1.940717  l7.509372-8.542861L16.448587,23H23L14.095479,10.316482z M11.436522,13.338465l-0.871624-1.218704l-6.924311-9.68815h2.981339  l5.58978,7.82155l0.867949,1.218704l7.26506,10.166271h-2.981339L11.436522,13.338465z"/>
                      </svg>
                      Registreer met X
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                Door te registreren ga je akkoord met onze Algemene Voorwaarden en Privacybeleid
              </p>
              <p className="text-sm">
                Heb je al een account?{" "}
                <button 
                  type="button"
                  onClick={() => router.push("/login")}
                  className="text-orange-500 hover:underline"
                >
                  Log hier in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right column - Image */}
        <div className="bg-gray-100 rounded-xl overflow-hidden relative hidden md:block">
          <div className="w-full h-full relative">
            <Image 
              src="/images/zoute.jpg"
              alt="Strand huis een route"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}