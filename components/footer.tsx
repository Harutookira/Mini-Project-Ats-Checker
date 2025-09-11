import React from "react"
import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#001a4d] mt-12 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Company Info with Logo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src="/cnt-logo.png" alt="CNT Logo" className="w-40 h-40 object-contain brightness-3 invert" />
              <span className="font-semibold text-white"></span>
            </div>
            <p className="text-sm text-gray-300">
              Helping job seekers optimize their resumes for modern applicant tracking systems.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Contact Us</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                Email:{" "}
                <a href="mailto:info@cnt.id" className="text-white hover:underline">
                  info@cnt.id
                </a>
              </li>
              <li>
                Website:{" "}
                <a href="https://cnt.id" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                  cnt.id
                </a>
              </li>
            </ul>
          </div>
        </div>

        
      </div>
      {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <div className="bg-[#00143d] p-4 text-center">
            <p className="text-sm text-white">
              &copy; {new Date().getFullYear()} CNT Recruitment. All rights reserved.
            </p>
          </div>
        </div>
    </footer>
  )
}