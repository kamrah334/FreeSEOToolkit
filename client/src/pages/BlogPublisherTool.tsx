import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Upload, Download, Copy, Globe, FileText, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function BlogPublisherTool() {
  const [blogContent, setBlogContent] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const { toast } = useToast();

  const generateHTML = () => {
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${blogTitle}</title>
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${blogTitle}">
    <meta property="og:description" content="${metaDescription}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${publishedUrl}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${blogTitle}">
    <meta name="twitter:description" content="${metaDescription}">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${blogTitle}",
      "description": "${metaDescription}",
      "keywords": "${keywords}",
      "author": {
        "@type": "Person",
        "name": "Your Name"
      },
      "datePublished": "${new Date().toISOString()}",
      "dateModified": "${new Date().toISOString()}"
    }
    </script>
    
    <style>
        body {
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3 {
            color: #2c3e50;
            margin-top: 30px;
        }
        h1 {
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
        }
        h2 {
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        .meta-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
            font-size: 0.9em;
            color: #666;
        }
        .keywords {
            margin-top: 10px;
        }
        .keyword-tag {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 2px 8px;
            border-radius: 3px;
            margin-right: 5px;
            font-size: 0.8em;
        }
    </style>
</head>
<body>
    <div class="meta-info">
        <strong>Published:</strong> ${new Date().toLocaleDateString()}<br>
        <strong>Reading Time:</strong> ${Math.ceil(blogContent.split(' ').length / 200)} minutes
        <div class="keywords">
            <strong>Tags:</strong> 
            ${keywords.split(',').map(k => `<span class="keyword-tag">${k.trim()}</span>`).join('')}
        </div>
    </div>
    
    <h1>${blogTitle}</h1>
    
    ${blogContent.replace(/\n/g, '<br>').replace(/## (.*?)<br>/g, '<h2>$1</h2>').replace(/### (.*?)<br>/g, '<h3>$1</h3>')}
    
    <div class="meta-info" style="margin-top: 40px;">
        <strong>About this article:</strong> This content was created using professional SEO tools to ensure optimal search engine visibility and user engagement.
    </div>
</body>
</html>`;
    
    return htmlTemplate;
  };

  const downloadHTML = () => {
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${blogTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Downloaded",
      description: "Your SEO-optimized HTML file has been downloaded successfully.",
    });
  };

  const copyHTML = () => {
    const html = generateHTML();
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Copied",
      description: "SEO-optimized HTML code copied to clipboard.",
    });
  };

  const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${publishedUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sitemap Generated",
      description: "XML sitemap downloaded for search engine submission.",
    });
  };

  const seoTips = [
    "Upload your HTML file to your website's root directory",
    "Submit your sitemap to Google Search Console",
    "Add internal links to other relevant pages on your site",
    "Ensure your content has proper header structure (H1, H2, H3)",
    "Use the provided meta description and keywords",
    "Add alt text to any images you include",
    "Submit your URL to Google for indexing",
    "Share your content on social media for better visibility"
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-800 mb-4"
            data-testid="link-back-to-tools"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tools
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Publisher</h1>
          <p className="text-gray-600">
            Export your blog content as SEO-optimized HTML for maximum Google ranking potential
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Blog Content
                </CardTitle>
                <CardDescription>
                  Paste your blog content and metadata for SEO optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="blog-title" data-testid="label-blog-title">Blog Title</Label>
                  <Input
                    id="blog-title"
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="Enter your blog title..."
                    data-testid="input-blog-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meta-description" data-testid="label-meta-description">Meta Description</Label>
                  <Textarea
                    id="meta-description"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Enter SEO meta description (150-160 characters)..."
                    rows={2}
                    data-testid="textarea-meta-description"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {metaDescription.length}/160 characters
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="keywords" data-testid="label-keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Enter keywords separated by commas..."
                    data-testid="input-keywords"
                  />
                </div>
                
                <div>
                  <Label htmlFor="published-url" data-testid="label-published-url">Published URL (Optional)</Label>
                  <Input
                    id="published-url"
                    value={publishedUrl}
                    onChange={(e) => setPublishedUrl(e.target.value)}
                    placeholder="https://yoursite.com/blog-post"
                    data-testid="input-published-url"
                  />
                </div>
                
                <div>
                  <Label htmlFor="blog-content" data-testid="label-blog-content">Blog Content</Label>
                  <Textarea
                    id="blog-content"
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Paste your blog content here..."
                    rows={10}
                    data-testid="textarea-blog-content"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {blogContent.split(' ').length} words
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Export & Publish
                </CardTitle>
                <CardDescription>
                  Download SEO-optimized files for your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={downloadHTML}
                    disabled={!blogTitle || !blogContent}
                    className="w-full"
                    data-testid="button-download-html"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download HTML
                  </Button>
                  
                  <Button 
                    onClick={copyHTML}
                    disabled={!blogTitle || !blogContent}
                    variant="outline"
                    className="w-full"
                    data-testid="button-copy-html"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML
                  </Button>
                  
                  <Button 
                    onClick={generateSitemap}
                    disabled={!publishedUrl}
                    variant="outline"
                    className="w-full col-span-2"
                    data-testid="button-generate-sitemap"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Generate Sitemap
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">SEO Features Included:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Meta tags
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Open Graph
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Twitter Cards
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Schema markup
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Mobile responsive
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Fast loading
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  SEO Publishing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seoTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <Badge variant="outline" className="mr-3 mt-0.5 min-w-6 justify-center">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}