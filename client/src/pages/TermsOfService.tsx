import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: August 24, 2025</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose max-w-none">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using SEO Toolbox, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to temporarily use SEO Toolbox for personal and commercial use. 
              This includes:
            </p>
            <ul>
              <li>Generating SEO content for your websites and projects</li>
              <li>Analyzing keyword density and content optimization</li>
              <li>Creating meta descriptions and titles</li>
            </ul>

            <h2>Prohibited Uses</h2>
            <p>You may not:</p>
            <ul>
              <li>Use the service for illegal purposes or to violate any laws</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Generate content that is harmful, offensive, or violates others' rights</li>
              <li>Overload our servers with excessive requests</li>
            </ul>

            <h2>Disclaimer</h2>
            <p>
              The materials on SEO Toolbox are provided on an 'as is' basis. We make no warranties, 
              expressed or implied, and hereby disclaim all other warranties including, without limitation, 
              implied warranties or conditions of merchantability or fitness for any particular purpose.
            </p>

            <h2>Service Availability</h2>
            <p>
              We strive to provide continuous service but do not guarantee 100% uptime. 
              AI-powered features depend on third-party services and may be temporarily unavailable.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We reserve the right to revise these terms of service at any time without notice. 
              By using this service, you are agreeing to be bound by the current version of these terms.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}