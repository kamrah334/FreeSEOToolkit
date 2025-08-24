import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: August 24, 2025</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose max-w-none">
            <h2>Information We Collect</h2>
            <p>
              We collect information you provide directly to us when using our SEO tools, such as:
            </p>
            <ul>
              <li>Content you submit for analysis (titles, descriptions, articles)</li>
              <li>Usage data to improve our services</li>
              <li>Technical information like IP address and browser type</li>
            </ul>

            <h2>How We Use Information</h2>
            <p>We use the information to:</p>
            <ul>
              <li>Provide and improve our SEO tools</li>
              <li>Generate SEO-optimized content</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h2>Third-Party Services</h2>
            <p>
              Our AI-powered tools may use third-party services like Hugging Face for content generation. 
              Please review their privacy policies as well.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our contact page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}