import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HomePage from "@/pages/HomePage";
import MetaDescriptionTool from "@/pages/MetaDescriptionTool";
import TitleCaseTool from "@/pages/TitleCaseTool";
import KeywordDensityTool from "@/pages/KeywordDensityTool";
import BlogOutlineTool from "@/pages/BlogOutlineTool";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/meta-description" component={MetaDescriptionTool} />
          <Route path="/title-case" component={TitleCaseTool} />
          <Route path="/keyword-density" component={KeywordDensityTool} />
          <Route path="/blog-outline" component={BlogOutlineTool} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
