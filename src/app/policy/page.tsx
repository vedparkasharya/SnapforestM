'use client';

import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';

export default function Policy() {
  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Studio <span className="text-gradient">Damage Policy</span>
          </h1>
          <p className="text-gray-400">
            Please read carefully before booking
          </p>
        </div>

        <div className="space-y-6">
          {/* Introduction */}
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Policy Overview</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This damage policy outlines the responsibilities of creators when using SnapforestX studios. 
                  By booking a studio, you agree to abide by these terms. We want to ensure a great experience 
                  for all creators while protecting the quality of our equipment and spaces.
                </p>
              </div>
            </div>
          </div>

          {/* What's Covered */}
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">What's Covered in Your Booking</h2>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Normal wear and tear during content creation
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Use of all listed equipment as per studio guidelines
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    30-minute setup and cleanup buffer time
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Technical support during your session
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                    Access to WiFi, AC, and basic amenities
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* What's Not Covered */}
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Damage Charges (Not Covered)</h2>
                <p className="text-gray-400 text-sm mb-3">
                  You will be charged for the following damages caused by negligence or misuse:
                </p>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Broken or cracked camera equipment (Rs. 5,000 - 50,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Damaged lighting equipment - LED panels, softboxes (Rs. 2,000 - 15,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Damaged microphones or audio equipment (Rs. 3,000 - 25,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Wall/property damage - scratches, holes, paint (Rs. 1,000 - 10,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Stains or burns on furniture/flooring (Rs. 2,000 - 8,000)
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    Lost or stolen equipment items (Full replacement cost)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Studio Rules</h2>
                <ul className="space-y-2 text-gray-400 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">1.</span>
                    No food or drinks near electronic equipment
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">2.</span>
                    Maximum occupancy must not be exceeded
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">3.</span>
                    Smoking and alcohol are strictly prohibited
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">4.</span>
                    Do not move heavy equipment without assistance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">5.</span>
                    Report any pre-existing damage before your session
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">6.</span>
                    Clean up after your session - dispose of trash
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 font-medium">7.</span>
                    Turn off all equipment and lights before leaving
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reporting */}
          <div className="bg-[#13131f] rounded-xl p-6 border border-[#1e1e2e]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Damage Reporting</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  If you notice any damage during your session, report it immediately to the studio manager. 
                  Failure to report damage discovered after your session will result in automatic charges. 
                  All disputes will be resolved through photo/video evidence and studio logs.
                </p>
                <p className="text-gray-400 text-sm leading-relaxed mt-2">
                  For any questions about this policy, contact us at{' '}
                  <a href="mailto:snapforestx@gmail.com" className="text-purple-400 hover:text-purple-300">
                    snapforestx@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
