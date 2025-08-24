import { Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Search className="h-6 w-6 text-primary-600 mr-2" />
            <span className="text-lg font-bold text-gray-900">SEO Toolbox</span>
          </div>
          <p className="text-gray-600 mb-4">
            Built with ❤️ on Replit
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900" data-testid="link-privacy">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-900" data-testid="link-terms">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900" data-testid="link-contact">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
