"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle, Edit, Trash2, Plus, Home, Users, PieChart, Bug } from "lucide-react";
import api from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeViewings: 0,
    featuredProperties: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [apiResponses, setApiResponses] = useState({
    dashboard: null,
    users: null,
    properties: null
  });

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [userForm, setUserForm] = useState({
    naam: "",
    email: "",
    rol: "koper",
    telefoonnummer: "",
  });
  
  const [propertyForm, setPropertyForm] = useState({
    titel: "",
    prijs: "",
    straat: "",
    huisnummer: "",
    stad: "",
    postcode: "",
    oppervlakte: "",
    slaapkamers: "",
    status: "beschikbaar",
  });

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

  // Load all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Fetch dashboard stats - met verbeterde error handling
        try {
          console.log("Fetching dashboard stats...");
          const dashboardResponse = await api.beheerder.getDashboardStats();
          console.log("Dashboard stats received:", dashboardResponse);
          
          // Extract stats data veilig
          const statsData = extractData(dashboardResponse);
          if (statsData) {
            setStats({
              totalUsers: statsData.totalUsers || 0,
              totalProperties: statsData.totalProperties || 0,
              activeViewings: statsData.activeViewings || 0,
              featuredProperties: statsData.featuredProperties || 0
            });
          }
          
          setApiResponses(prev => ({ ...prev, dashboard: dashboardResponse }));
        } catch (statsError) {
          console.error("Error fetching dashboard stats:", statsError);
          
          if (statsError.response) {
            console.error("Response data:", statsError.response.data);
            console.error("Response status:", statsError.response.status);
            console.error("Response headers:", statsError.response.headers);
            setApiResponses(prev => ({ 
              ...prev, 
              dashboard: { 
                error: true, 
                status: statsError.response.status,
                data: statsError.response.data
              } 
            }));
          } else {
            setApiResponses(prev => ({ 
              ...prev, 
              dashboard: { 
                error: true, 
                message: statsError.message 
              } 
            }));
          }
          
          setError("Dashboard statistieken konden niet worden geladen, andere gegevens zijn wel beschikbaar.");
        }
        
        // Fetch users
        try {
          console.log("Fetching users...");
          const usersResponse = await api.beheerder.getGebruikers();
          console.log("Users received:", usersResponse);
          
          // Extract users data veilig
          const usersData = extractData(usersResponse);
          setUsers(Array.isArray(usersData) ? usersData : []);
          setApiResponses(prev => ({ ...prev, users: usersResponse }));
          
          // Update stats.totalUsers if dashboard stats loading failed
          if (stats.totalUsers === 0) {
            setStats(prev => ({ ...prev, totalUsers: Array.isArray(usersData) ? usersData.length : 0 }));
          }
        } catch (usersError) {
          console.error("Error fetching users:", usersError);
          setUsers([]);
          setApiResponses(prev => ({ 
            ...prev, 
            users: { 
              error: true, 
              message: usersError.message,
              response: usersError.response?.data
            } 
          }));
        }
        
        // Fetch properties
        try {
          console.log("Fetching properties...");
          const propertiesResponse = await api.beheerder.getWoningen();
          console.log("Properties received:", propertiesResponse);
          
          // Extract properties data veilig
          const propertiesData = extractData(propertiesResponse);
          setProperties(Array.isArray(propertiesData) ? propertiesData : []);
          setApiResponses(prev => ({ ...prev, properties: propertiesResponse }));
          
          // Update property-related stats if dashboard stats loading failed
          if (stats.totalProperties === 0 || stats.featuredProperties === 0) {
            const featuredCount = Array.isArray(propertiesData) 
              ? propertiesData.filter(p => p.isUitgelicht === 1 || p.isUitgelicht === true).length 
              : 0;
              
            setStats(prev => ({ 
              ...prev, 
              totalProperties: Array.isArray(propertiesData) ? propertiesData.length : 0,
              featuredProperties: featuredCount
            }));
          }
        } catch (propertiesError) {
          console.error("Error fetching properties:", propertiesError);
          setProperties([]);
          setApiResponses(prev => ({ 
            ...prev, 
            properties: { 
              error: true, 
              message: propertiesError.message,
              response: propertiesError.response?.data
            } 
          }));
        }
        
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Uitgebreide foutinformatie loggen
        if (error.response) {
          // De server gaf een antwoord met een foutcode
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);
          
          // Toon een specifieker foutbericht aan de gebruiker
          if (error.response.data?.bericht) {
            setError(`Serverfout: ${error.response.data.bericht}`);
          } else {
            setError(`Serverfout ${error.response.status}: Er is een fout opgetreden bij het ophalen van gegevens.`);
          }
        } else if (error.request) {
          // De request is gemaakt maar er kwam geen antwoord
          console.error("Request made but no response received:", error.request);
          setError("De server reageert niet. Controleer je internetverbinding.");
        } else {
          // Er ging iets mis bij het opzetten van de request
          console.error("Error setting up request:", error.message);
          setError(`Verzoekfout: ${error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle user form changes
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle property form changes
  const handlePropertyFormChange = (e) => {
    const { name, value } = e.target;
    setPropertyForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Handle role selection change
  const handleRoleChange = (value) => {
    setUserForm(prev => ({
      ...prev,
      rol: value,
    }));
  };
  
  // Handle property status change
  const handleStatusChange = (value) => {
    setPropertyForm(prev => ({
      ...prev,
      status: value,
    }));
  };

  // Open edit dialog for user
  const handleEditUser = (user) => {
    setSelectedItem(user);
    setUserForm({
      naam: user.naam || `${user.voornaam || ''} ${user.achternaam || ''}`.trim() || "",
      email: user.email || "",
      rol: typeof user.rol === 'number' ? 
        (user.rol === 3 ? "admin" : user.rol === 2 ? "verkoper" : "koper") : 
        (user.rol || "koper"),
      telefoonnummer: user.telefoonnummer || user.telefoon || "",
    });
    setIsEditing(true);
    setUserDialogOpen(true);
  };
  
  // Open edit dialog for property
  const handleEditProperty = (property) => {
    setSelectedItem(property);
    setPropertyForm({
      titel: property.titel || "",
      prijs: property.prijs?.toString() || "",
      straat: property.straat || "",
      huisnummer: property.huisnummer || "",
      stad: property.stad || "",
      postcode: property.postcode || "",
      oppervlakte: property.oppervlakte?.toString() || "",
      slaapkamers: property.slaapkamers?.toString() || "",
      status: property.status || "beschikbaar",
    });
    setIsEditing(true);
    setPropertyDialogOpen(true);
  };

  // Handle creating/updating a user
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      if (isEditing && selectedItem) {
        // Update existing user
        await api.gebruiker.updateGebruiker(selectedItem.id, userForm);
        
        // If role is being changed, also update role
        if (selectedItem.rol !== userForm.rol) {
          // Convert string role to numeric role for API
          const numericRole = 
            userForm.rol === "admin" ? 3 : 
            userForm.rol === "verkoper" ? 2 : 1;
            
          await api.beheerder.updateGebruikerRol(selectedItem.id, { rol: numericRole });
        }
        
        // Update user in state
        setUsers(users.map(user => 
          user.id === selectedItem.id ? { ...user, ...userForm } : user
        ));
      } else {
        // Create new user
        const newUserData = {
          ...userForm,
          wachtwoord: "tijdelijk123", // Temporary password - in real app, generate or handle differently
          voornaam: userForm.naam.split(' ')[0],
          achternaam: userForm.naam.split(' ').slice(1).join(' ') || "-"
        };
        
        const response = await api.auth.registreren(newUserData);
        const newUser = extractData(response);
        
        // Add new user to state
        setUsers([...users, newUser]);
      }
      
      // Close dialog and reset form
      setUserDialogOpen(false);
      setUserForm({
        naam: "",
        email: "",
        rol: "koper",
        telefoonnummer: "",
      });
      setIsEditing(false);
      setSelectedItem(null);
      
    } catch (error) {
      console.error("Error saving user:", error);
      setError("Er is een fout opgetreden bij het opslaan van de gebruiker.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle creating/updating a property
  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    
    // Convert string values to numbers where appropriate
    const formattedForm = {
      ...propertyForm,
      prijs: parseFloat(propertyForm.prijs),
      oppervlakte: parseFloat(propertyForm.oppervlakte),
      slaapkamers: parseInt(propertyForm.slaapkamers),
      // Ontbrekende velden toevoegen
      beschrijving: propertyForm.beschrijving || `${propertyForm.titel} in ${propertyForm.stad}`,
      verkoperId: selectedItem?.verkoperId || 1, // Default verkoperId als we geen hebben
    };
    
    try {
      setIsLoading(true);
      
      if (isEditing && selectedItem) {
        // Update existing property
        await api.woning.updateWoning(selectedItem.id, formattedForm);
        
        // Update status if changed
        if (selectedItem.status !== formattedForm.status) {
          await api.beheerder.updateWoningStatus(selectedItem.id, { status: formattedForm.status });
        }
        
        // Update property in state
        setProperties(properties.map(property => 
          property.id === selectedItem.id ? { ...property, ...formattedForm } : property
        ));
      } else {
        // Create new property
        const response = await api.woning.maakWoning(formattedForm);
        const newProperty = extractData(response);
        
        // Add new property to state
        setProperties([...properties, newProperty]);
      }
      
      // Close dialog and reset form
      setPropertyDialogOpen(false);
      setPropertyForm({
        titel: "",
        prijs: "",
        straat: "",
        huisnummer: "",
        stad: "",
        postcode: "",
        oppervlakte: "",
        slaapkamers: "",
        status: "beschikbaar",
      });
      setIsEditing(false);
      setSelectedItem(null);
      
    } catch (error) {
      console.error("Error saving property:", error);
      setError("Er is een fout opgetreden bij het opslaan van de woning.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async (userId) => {
    if (!confirm("Weet je zeker dat je deze gebruiker wilt verwijderen?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete user
      await api.gebruiker.verwijderGebruiker(userId);
      
      // Remove user from state
      setUsers(users.filter(user => user.id !== userId));
      
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("Er is een fout opgetreden bij het verwijderen van de gebruiker.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle deleting a property
  const handleDeleteProperty = async (propertyId) => {
    if (!confirm("Weet je zeker dat je deze woning wilt verwijderen?")) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Delete property
      await api.woning.verwijderWoning(propertyId);
      
      // Remove property from state
      setProperties(properties.filter(property => property.id !== propertyId));
      
    } catch (error) {
      console.error("Error deleting property:", error);
      setError("Er is een fout opgetreden bij het verwijderen van de woning.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle toggling a property as featured
  const handleToggleFeatured = async (property) => {
    try {
      setIsLoading(true);
      
      // Toggle featured status
      const newStatus = !property.isUitgelicht;
      await api.beheerder.toggleWoningUitgelicht(property.id, { uitgelicht: newStatus });
      
      // Update property in state
      setProperties(properties.map(p => 
        p.id === property.id ? { ...p, isUitgelicht: newStatus } : p
      ));
      
    } catch (error) {
      console.error("Error toggling featured status:", error);
      setError("Er is een fout opgetreden bij het wijzigen van de uitgelichte status.");
    } finally {
      setIsLoading(false);
    }
  };

  // Utility to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Add new user dialog
  const handleAddUser = () => {
    setUserForm({
      naam: "",
      email: "",
      rol: "koper",
      telefoonnummer: "",
    });
    setIsEditing(false);
    setSelectedItem(null);
    setUserDialogOpen(true);
  };
  
  // Add new property dialog
  const handleAddProperty = () => {
    setPropertyForm({
      titel: "",
      prijs: "",
      straat: "",
      huisnummer: "",
      stad: "",
      postcode: "",
      oppervlakte: "",
      slaapkamers: "",
      status: "beschikbaar",
    });
    setIsEditing(false);
    setSelectedItem(null);
    setPropertyDialogOpen(true);
  };

  return (
    <div className="min-h-screen w-screen p-2 bg-black">
      <div className="h-full w-full rounded-xl bg-white p-6 md:p-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
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
              <h1 className="text-xl font-semibold">Bunda Admin Dashboard</h1>
            </div>
            <Button
              type="button"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => router.push("/")}
            >
              Terug naar site
            </Button>
          </div>

          {/* Error message if any */}
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md flex items-center space-x-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Main content */}
          <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <PieChart size={16} />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users size={16} />
                Gebruikers
              </TabsTrigger>
              <TabsTrigger value="properties" className="flex items-center gap-2">
                <Home size={16} />
                Woningen
              </TabsTrigger>
              <TabsTrigger value="debug" className="flex items-center gap-2">
                <Bug size={16} />
                Debug
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
                    <Users className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalUsers || users.length}</div>
                    <p className="text-xs text-gray-500">Actieve gebruikers in het systeem</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Totaal Woningen</CardTitle>
                    <Home className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProperties || properties.length}</div>
                    <p className="text-xs text-gray-500">Totaal aantal geregistreerde woningen</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Actieve Bezichtigingen</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeViewings || 0}</div>
                    <p className="text-xs text-gray-500">Open bezichtigingen deze week</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uitgelichte Woningen</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.featuredProperties || properties.filter(p => p.isUitgelicht).length}</div>
                    <p className="text-xs text-gray-500">Woningen gemarkeerd als uitgelicht</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gebruikers beheren</h2>
                <Button 
                  onClick={handleAddUser}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nieuwe Gebruiker
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Naam</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telefoonnummer</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Gegevens laden...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Geen gebruikers gevonden
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.naam || `${user.voornaam || ''} ${user.achternaam || ''}`}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.telefoonnummer || user.telefoon || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs 
                              ${user.rol === "admin" || user.rol === 3 ? "bg-red-100 text-red-700" : 
                                user.rol === "verkoper" || user.rol === 2 ? "bg-blue-100 text-blue-700" : 
                                "bg-green-100 text-green-700"}`}>
                              {typeof user.rol === 'number' ? 
                                (user.rol === 3 ? "admin" : user.rol === 2 ? "verkoper" : "koper") : 
                                user.rol || "koper"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit size={16} className="text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent value="properties">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Woningen beheren</h2>
                <Button 
                  onClick={handleAddProperty}
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
                >
                  <Plus size={16} />
                  Nieuwe Woning
                </Button>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Adres</TableHead>
                      <TableHead>Prijs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uitgelicht</TableHead>
                      <TableHead className="text-right">Acties</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Gegevens laden...
                        </TableCell>
                      </TableRow>
                    ) : properties.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          Geen woningen gevonden
                        </TableCell>
                      </TableRow>
                    ) : (
                      properties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell>{property.titel}</TableCell>
                          <TableCell>{`${property.straat || ''} ${property.huisnummer || ''}, ${property.postcode || ''} ${property.stad || ''}`}</TableCell>
                          <TableCell>{property.prijs ? formatCurrency(property.prijs) : '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs 
                              ${property.status === "verkocht" ? "bg-red-100 text-red-700" : 
                                property.status === "onder_optie" ? "bg-amber-100 text-amber-700" : 
                                "bg-green-100 text-green-700"}`}>
                              {property.status || 'beschikbaar'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(property)}
                            >
                              {property.isUitgelicht ? (
                                <CheckCircle size={16} className="text-green-500" />
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-400"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10"></circle>
                                </svg>
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProperty(property)}
                              >
                                <Edit size={16} className="text-gray-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Debug Tab */}
            <TabsContent value="debug">
              <div className="p-4 border rounded-md bg-gray-50">
                <h2 className="text-lg font-semibold mb-2">API Response Data</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="font-medium">Dashboard Stats:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
                      {JSON.stringify(apiResponses.dashboard, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">Users:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
                      {JSON.stringify(apiResponses.users, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">Properties:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs max-h-60">
                      {JSON.stringify(apiResponses.properties, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">Database Schema Info:</h3>
                    <pre className="bg-gray-100 p-2 rounded overflow-auto text-xs">
{`Database error: SQLITE_ERROR: no such column: favorietVanGebruikers.id

Tables:
- bezichtigings: Bezichtigingen van woningen
- favoriets: Favoriete woningen van gebruikers
- gebruikers: Gebruikersaccounts (rol: 1=koper, 2=verkoper, 3=admin)
- kenmerks: Kenmerken van woningen
- woningAfbeeldings: Afbeeldingen van woningen
- woningKenmerks: Koppeltabel kenmerken-woningen
- wonings: Woninggegevens (let op: isUitgelicht, niet uitgelicht)`}
                    </pre>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Gebruiker bewerken" : "Nieuwe gebruiker toevoegen"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Wijzig de gegevens van deze gebruiker" 
                : "Voeg een nieuwe gebruiker toe aan het systeem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="naam" className="text-right">
                  Naam
                </Label>
                <Input
                  id="naam"
                  name="naam"
                  value={userForm.naam}
                  onChange={handleUserFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefoonnummer" className="text-right">
                  Telefoon
                </Label>
                <Input
                  id="telefoonnummer"
                  name="telefoonnummer"
                  value={userForm.telefoonnummer}
                  onChange={handleUserFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rol" className="text-right">
                  Rol
                </Label>
                <Select value={userForm.rol} onValueChange={handleRoleChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer een rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koper">Koper</SelectItem>
                    <SelectItem value="verkoper">Verkoper</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setUserDialogOpen(false)}
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Opslaan..." : "Opslaan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Property Dialog */}
      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Woning bewerken" : "Nieuwe woning toevoegen"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Wijzig de gegevens van deze woning" 
                : "Voeg een nieuwe woning toe aan het systeem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePropertySubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="titel" className="text-right">
                  Titel
                </Label>
                <Input
                  id="titel"
                  name="titel"
                  value={propertyForm.titel}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prijs" className="text-right">
                  Prijs (€)
                </Label>
                <Input
                  id="prijs"
                  name="prijs"
                  type="number"
                  value={propertyForm.prijs}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="straat" className="text-right">
                  Straat
                </Label>
                <Input
                  id="straat"
                  name="straat"
                  value={propertyForm.straat}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="huisnummer" className="text-right">
                  Huisnummer
                </Label>
                <Input
                  id="huisnummer"
                  name="huisnummer"
                  value={propertyForm.huisnummer}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="postcode" className="text-right">
                  Postcode
                </Label>
                <Input
                  id="postcode"
                  name="postcode"
                  value={propertyForm.postcode}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stad" className="text-right">
                  Plaats
                </Label>
                <Input
                  id="stad"
                  name="stad"
                  value={propertyForm.stad}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="oppervlakte" className="text-right">
                  Oppervlakte (m²)
                </Label>
                <Input
                  id="oppervlakte"
                  name="oppervlakte"
                  type="number"
                  value={propertyForm.oppervlakte}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slaapkamers" className="text-right">
                  Slaapkamers
                </Label>
                <Input
                  id="slaapkamers"
                  name="slaapkamers"
                  type="number"
                  value={propertyForm.slaapkamers}
                  onChange={handlePropertyFormChange}
                  className="col-span-3"
                  required
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select value={propertyForm.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecteer een status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beschikbaar">Beschikbaar</SelectItem>
                    <SelectItem value="onder_optie">Onder Optie</SelectItem>
                    <SelectItem value="verkocht">Verkocht</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPropertyDialogOpen(false)}
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Opslaan..." : "Opslaan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}