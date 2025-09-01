import { Link } from "wouter";
import { FileText, Type, BarChart3, Upload, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const tools = [
    {
      icon: FileText,
      title: "Meta Description",
      description: "Generate SEO-optimized meta descriptions (150-160 characters) using AI",
      badge: "AI-Powered • Free",
      badgeColor: "text-primary-600",
      iconBg: "bg-primary-100 group-hover:bg-primary-200",
      iconColor: "text-primary-600",
      href: "/meta-description",
    },
    {
      icon: Type,
      title: "Title Case",
      description: "Convert titles to proper SEO title case with smart capitalization rules",
      badge: "Instant • Free",
      badgeColor: "text-green-600",
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      href: "/title-case",
    },
    {
      icon: BarChart3,
      title: "Keyword Density",
      description: "Analyze keyword frequency and density in your content with detailed reports",
      badge: "Analytics • Free",
      badgeColor: "text-orange-600",
      iconBg: "bg-orange-100 group-hover:bg-orange-200",
      iconColor: "text-orange-600",
      href: "/keyword-density",
    },
    {
      icon: Target,
      title: "SEO Title Generator",
      description: "Generate SEO-optimized titles and 30 related keywords for your images and content",
      badge: "AI-Powered • Free",
      badgeColor: "text-blue-600",
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      href: "/seo-title-generator",
    },
    {
      icon: Upload,
      title: "Blog Publisher",
      description: "Export SEO-optimized HTML files and get publishing tips for maximum Google ranking",
      badge: "SEO Export • Free",
      badgeColor: "text-purple-600",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      href: "/blog-publisher",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional <span className="text-primary-600">SEO Tools</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Boost your content's search engine performance with our comprehensive suite of AI-powered SEO tools. Generate meta descriptions, optimize titles, analyze keyword density, create blog outlines, and write complete SEO-optimized content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary-600 hover:bg-primary-700 text-white"
              data-testid="button-get-started"
              onClick={() => {
                const toolsSection = document.querySelector('#tools-section');
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              data-testid="button-view-tools"
              onClick={() => {
                const toolsSection = document.querySelector('#tools-section');
                if (toolsSection) {
                  toolsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              View Tools
            </Button>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div id="tools-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your SEO Tool</h2>
            <p className="text-lg text-gray-600">Each tool is designed to solve specific SEO challenges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 cursor-pointer group"
                data-testid={`tool-card-${tool.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="text-center">
                  <div className={`${tool.iconBg} w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors`}>
                    <tool.icon className={`h-8 w-8 ${tool.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                  <div className={`text-xs ${tool.badgeColor} font-medium`}>{tool.badge}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
