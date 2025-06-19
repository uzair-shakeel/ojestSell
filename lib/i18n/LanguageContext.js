import { createContext, useContext, useState, useEffect } from "react";

// Define translations
const translations = {
  en: {
    // Home page
    findBuyOwn: "Find, buy, and own your dream car in Easy steps.",

    // Navigation
    home: "Home",
    cars: "Cars",
    sellers: "Sellers",
    aboutUs: "About Us",
    contactUs: "Contact Us",
    login: "Login",
    register: "Register",

    // Car filters
    search: "Search",
    make: "Make",
    model: "Model",
    year: "Year",
    price: "Price",
    location: "Location",

    // Car listings
    carsNearYou: "Cars Near You",
    featuredCategories: "Featured Categories",
    browseByCategory: "Browse By Category",
    browseByLocation: "Browse By Location",
    browseByMake: "Browse By Make",
    viewAll: "View All",

    // Footer
    followUs: "Follow Us",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    copyright: "© 2024 OjestSell. All rights reserved.",
  },
  pl: {
    // Home page
    findBuyOwn:
      "Znajdź, kup i posiadaj samochód swoich marzeń w prostych krokach.",

    // Navigation
    home: "Strona główna",
    cars: "Samochody",
    sellers: "Sprzedawcy",
    aboutUs: "O nas",
    contactUs: "Kontakt",
    login: "Logowanie",
    register: "Rejestracja",

    // Car filters
    search: "Szukaj",
    make: "Marka",
    model: "Model",
    year: "Rok",
    price: "Cena",
    location: "Lokalizacja",

    // Car listings
    carsNearYou: "Samochody w pobliżu",
    featuredCategories: "Wyróżnione kategorie",
    browseByCategory: "Przeglądaj według kategorii",
    browseByLocation: "Przeglądaj według lokalizacji",
    browseByMake: "Przeglądaj według marki",
    viewAll: "Zobacz wszystkie",

    // Footer
    followUs: "Obserwuj nas",
    termsOfService: "Warunki korzystania",
    privacyPolicy: "Polityka prywatności",
    copyright: "© 2024 OjestSell. Wszelkie prawa zastrzeżone.",
  },
};

// Create the context
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to English or browser preference
  const [language, setLanguage] = useState("en");
  // Track if we're on client side for localStorage access
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true once component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Try to load language preference from localStorage on client side
  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem("language");
      if (savedLanguage) {
        setLanguage(savedLanguage);
      } else {
        // Try to detect browser language
        const browserLang = navigator.language.split("-")[0];
        if (browserLang === "pl") {
          setLanguage("pl");
        }
      }
    }
  }, [isClient]);

  // Function to change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    if (isClient) {
      localStorage.setItem("language", lang);
    }
  };

  // Get translation for a key
  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, isClient }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
