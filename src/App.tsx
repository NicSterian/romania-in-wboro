import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import NewsPost from "./pages/NewsPost";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import HealthSafety from "./pages/HealthSafety";
import EqualityPolicy from "./pages/EqualityPolicy";
import VolunteerCode from "./pages/VolunteerCode";
import Enrolment from "./pages/Enrolment";
import "./i18n/config";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsPost />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enrolment" element={<Enrolment />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/health-safety" element={<HealthSafety />} />
          <Route path="/equality-policy" element={<EqualityPolicy />} />
          <Route path="/volunteer-code" element={<VolunteerCode />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
