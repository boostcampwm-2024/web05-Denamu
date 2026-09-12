import { Link } from "react-router-dom";

import logo from "@/assets/logo-denamu-main.svg";

import { footerLinks, teamMembers } from "@/constants/footer";

import type { FooterLink } from "@/types/footer";

export const Footer = () => {
  const renderFooterLink = (link: FooterLink) => (
    <div className="flex flex-col space-y-1.5">
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col space-y-1.5">
        <div className="flex items-center gap-2 text-gray-400 transition-colors group-hover:text-primary">
          <link.icon className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">{link.label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-700 transition-colors group-hover:text-primary">
          {link.value}
        </span>
      </a>
      {link.subLinks && link.subLinks.length > 0 && (
        <div className="flex flex-row gap-4">
          {link.subLinks.map((subLink, subIdx) => (
            <a
              key={subIdx}
              href={subLink.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 transition-colors hover:text-primary"
            >
              {subLink.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <footer className="relative z-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-8 py-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-2">
            <img src={logo} alt="Denamu" className="h-14 w-auto self-start" />
          </div>
          {footerLinks.map((link, idx) => (
            <div key={idx}>{renderFooterLink(link)}</div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-gray-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-sm">
            <Link to="/privacy" className="text-gray-500 transition-colors hover:text-primary">
              개인정보처리방침
            </Link>
            <span className="text-gray-300">·</span>
            <span className="text-gray-400">© {new Date().getFullYear()} Denamu</span>
          </div>
          <div className="text-xs text-gray-400">
            <span>Made by </span>
            {teamMembers.map((name, idx) => (
              <span key={idx}>
                {name}
                {idx !== teamMembers.length - 1 && ", "}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
