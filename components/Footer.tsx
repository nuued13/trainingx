import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    Product: [
      { label: "Practice Zone", href: "#practice-zone" },
      { label: "App Studio", href: "#app-studio" },
      { label: "Career Hub", href: "#careers" },
      { label: "Assessments", href: "#" },
    ],
    Company: [
      { label: "About Us", href: "#track-record" },
      { label: "Our Story", href: "#track-record" },
      { label: "Team", href: "#track-record" },
      { label: "Careers", href: "#careers" },
    ],
    // Resources: [
    //   { label: "Help Center", href: "/help" },
    //   { label: "Documentation", href: "/docs" },
    //   { label: "Blog", href: "/blog" },
    //   { label: "Community", href: "/community" }
    // ],
    Legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "GDPR", href: "/gdpr" },
    ],
  };

  const contact = [
    { icon: <Mail className="h-4 w-4" />, label: "hello@trainingx.ai" },
    { icon: <Phone className="h-4 w-4" />, label: "+1 (555) 123-4567" },
    { icon: <MapPin className="h-4 w-4" />, label: "San Francisco, CA" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mb-4">
              TrainingX.Ai
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Universal Prompting for the 21st Century. Master AI skills with
              our proven 10-year track record and join the AI economy.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              {contact.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 text-gray-400"
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                      data-testid={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 TrainingX.Ai. All rights reserved. Built for the AI
              economy.
            </div>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
