import { Link } from "wouter";
import { ArrowLeft, Mail, MessageCircle, Github } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium mb-4 flex items-center" data-testid="link-back">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">Get in touch with our team</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">We're Here to Help</h2>
            <p className="text-gray-600">
              Have questions about our SEO tools or need support? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
              <p className="text-gray-600 text-sm mb-3">
                Get help with technical issues or general questions
              </p>
              <p className="text-blue-600 font-medium">support@seotoolbox.com</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feedback</h3>
              <p className="text-gray-600 text-sm mb-3">
                Share your ideas for new features or improvements
              </p>
              <p className="text-green-600 font-medium">feedback@seotoolbox.com</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Github className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Open Source</h3>
              <p className="text-gray-600 text-sm mb-3">
                Contribute to the project or report bugs
              </p>
              <p className="text-purple-600 font-medium">View on GitHub</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Are the SEO tools really free?</h4>
                <p className="text-gray-600 text-sm">
                  Yes! All our SEO tools are completely free to use. No registration required.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Do you store the content I submit?</h4>
                <p className="text-gray-600 text-sm">
                  We process your content to provide results but do not permanently store your submissions for privacy protection.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Can I use generated content commercially?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can use all generated content for personal and commercial purposes without restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}