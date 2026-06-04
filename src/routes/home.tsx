import { useState } from "react";
import { Code, Brain, Target, PenTool, Award, Book, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

import { Link } from 'react-router-dom';
export default function Home() {
  const [activeTab, setActiveTab] = useState("tech");


  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-white to-purple-100">

      {/* Hero Section */}

      <section className="flex flex-col items-center justify-center flex-1 pt-28 pb-16">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 text-center mb-6 mt-6">
          Your Personal <span className="text-violet-600">AI Interview</span> Coach
        </h1>
        <p className="text-2xl md:text-2xl text-gray-500 text-center mb-10">
          Double your chances of landing that job offer with our AI-powered interview prep
        </p>
        <div className="flex gap-6">
          <Link to="/signin">
            <button className="px-8 py-3 rounded-lg text-white bg-[#4F46E5] hover:bg-violet-900 font-semibold text-lg shadow transition">
              Get started
            </button>
          </Link>
        </div>
      </section>


      {/* Resource Tabs Section */}
      <section className="w-full py-16 px-4 bg-white/95 flex flex-col items-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-3">
          B.Tech Interview & Preparation Resources
        </h2>
        <p className="text-xl text-gray-500 text-center mb-10 max-w-2xl">
          Comprehensive collection of resources to support your professional growth and interview preparation
        </p>

        {/* Tabs */}
        <div className="flex gap-4 mb-12">
          {["tech", "aptitude", "interview"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-8 py-2 rounded-full font-semibold text-lg transition-all duration-300",
                activeTab === tab
                  ? "bg-[#4F46E5] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 border border-gray-300 hover:shadow-md hover:bg-violet-50"
              )}
            >
              {tab === "tech" && "Tech Resources"}
              {tab === "aptitude" && "Aptitude Resources"}
              {tab === "interview" && "Interview Resources"}
            </button>
          ))}
        </div>

        {/* Tab Contents */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {activeTab === "tech" && (
            <>
              {/* Coding Platforms */}

              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <Code size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Coding Platforms</h2>
                </div>
                <p className="text-gray-600">Practice coding and algorithmic problem-solving</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.geeksforgeeks.org/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      GeeksforGeeks →
                    </a>
                  </li>
                  <li>
                    <a href="https://leetcode.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      LeetCode
                    </a>
                  </li>
                  <li>
                    <a href="https://www.hackerrank.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      HackerRank
                    </a>
                  </li>
                  <li>
                    <a href="https://www.codechef.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      CodeChef
                    </a>
                  </li>
                </ul>
              </div>

              {/* Technical Interview */}
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <Target size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Technical Interview Preparation</h2>
                </div>
                <p className="text-gray-600">Resources for system design and technical interviews</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.interviewbit.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      InterviewBit
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/donnemartin/system-design-primer" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      System Design Primer
                    </a>
                  </li>
                  <li>
                    <a href="https://www.pramp.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Pramp
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}

          {activeTab === "aptitude" && (
            <>
              {/* Aptitude Reasoning */}
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <PenTool size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Aptitude & Reasoning</h2>
                </div>
                <p className="text-gray-600">Practice quantitative and logical reasoning skills</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.indiabix.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      IndiaBix
                    </a>
                  </li>
                  <li>
                    <a href="https://www.smartkeeda.com/reasoning-aptitude" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      SmartKeeda Aptitude
                    </a>
                  </li>
                  <li>
                    <a href="https://www.geeksforgeeks.org/aptitude-questions-and-answers/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      GeekForGeeks
                    </a>
                  </li>
                  <li>
                    <a href="https://www.competitiveexamprep.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Competitive Exam Prep
                    </a>
                  </li>
                </ul>
              </div>



              {/* Competitive Exams */}
              {/* Resources for Competitive Exams */}
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <Award size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Competitive Exam Prep</h2>
                </div>
                <p className="text-gray-600">Resources for various competitive exams</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://gateoverflow.in/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      GATE Overflow
                    </a>
                  </li>
                  <li>
                    <a href="https://www.careerpower.in/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Career Power
                    </a>
                  </li>
                  <li>
                    <a href="https://brilliant.org/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Brilliant.org
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}

          {activeTab === "interview" && (
            <>
              {/* Interview Guides */}

              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <Book size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Interview Guides</h2>
                </div>
                <p className="text-gray-600">Insider tips and preparation materials</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://interviewbuddy.net/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      InterviewBuddy
                    </a>

                  </li>
                  <li>
                    <a href="https://www.preplaced.in/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Preplaced
                    </a>
                  </li>
                  <li>
                    <a href="https://interviewing.io/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Interviewing.io
                    </a>

                  </li>
                </ul>
              </div>
              {/* Global Learning Platforms */}
              <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col gap-4 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
                <div className="flex items-center gap-3">
                  <Globe size={28} className="text-[#4F46E5]" />
                  <h2 className="text-2xl font-semibold text-black">Global Learning Platforms</h2>
                </div>
                <p className="text-gray-600">Top global platforms for courses</p>
                <ul className="space-y-2">
                  <li>
                    <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Coursera
                    </a>
                  </li>
                  <li>
                    <a href="https://www.udemy.com/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Udemy
                    </a>
                  </li>
                  <li>
                    <a href="https://www.pw.live/" target="_blank" rel="noopener noreferrer" className="text-[#4F46E5] hover:underline">
                      Physics Wallah
                    </a>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Additional Preparation Tips */}
      <section className="w-full py-16 px-4 flex flex-col items-center bg-white/95">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-3">Additional Preparation Tips</h2>
        <p className="text-xl text-gray-500 text-center mb-10 max-w-2xl">
          Explore supplementary resources to enhance your interview and career preparation journey
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
            <div className="mb-2 text-[#4F46E5]" aria-hidden="true">
              <Book size={40} className="text-[#4F46E5]" />
            </div>
            <div className="text-xl font-semibold mb-2">Resume Building</div>
            <div className="text-gray-600 mb-2 text-center">Create a standout professional resume</div>
            <a
              href="https://www.canva.com/resumes/templates/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F46E5] font-medium hover:underline flex items-center"
            >
              Explore <span className="ml-1">→</span>
            </a>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
            <div className="mb-2 text-green-600" aria-hidden="true">
              <Target size={40} className="text-green-600" />
            </div>
            <div className="text-xl font-semibold mb-2">Mock Interviews</div>
            <div className="text-gray-600 mb-2 text-center">Practice with AI-powered interview simulations</div>
            <a href="#" className="text-[#4F46E5] font-medium hover:underline flex items-center">Explore <span className="ml-1">→</span></a>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-violet-50 active:scale-95">
            <div className="mb-2 text-purple-600" aria-hidden="true">
              <Brain size={40} className="text-purple-600" />
            </div>
            <div className="text-xl font-semibold mb-2">Skill Assessment</div>
            <div className="text-gray-600 mb-2 text-center">Identify and improve your key skills</div>
            <Link to="/dsa-roadmap" className="text-[#4F46E5] font-medium hover:underline flex items-center">
                       Explore <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="w-full bg-gray-900 text-white text-lg mt-auto py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-col md:flex-row gap-4">
          <div>© 2025 MockMate AI. All Rights Reserved.</div>
          <div className="flex gap-4 text-2xl">
            <a href="https://github.com/" title="GitHub" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.893 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.682-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.338 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.698 1.028 1.591 1.028 2.682 0 3.842-2.337 4.687-4.566 4.934.359.31.678.923.678 1.861 0 1.343-.012 2.426-.012 2.756 0 .268.18.58.688.481A10.013 10.013 0 0022 12c0-5.523-4.477-10-10-10z" /></svg>
            </a>
            <a href="https://linkedin.com/" title="LinkedIn" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.026-3.062-1.866-3.062-1.867 0-2.154 1.459-2.154 2.965v5.701h-3v-10h2.881v1.367h.041c.401-.761 1.379-1.562 2.838-1.562 3.036 0 3.6 2 3.6 4.59v5.605z" /></svg>
            </a>
            <a href="https://twitter.com/" title="Twitter" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14.86 4.48 4.48 0 001.98-2.48 9.06 9.06 0 01-2.88 1.1 4.52 4.52 0 00-7.7 4.12 12.85 12.85 0 01-9.33-4.73 4.5 4.5 0 001.4 6.07 4.5 4.5 0 01-2.05-.57v.06a4.52 4.52 0 003.63 4.43 4.52 4.52 0 01-2.04.08 4.52 4.52 0 004.22 3.13 9.05 9.05 0 01-5.6 1.93c-.36 0-.71-.02-1.06-.06a12.78 12.78 0 006.92 2.03c8.3 0 12.85-6.88 12.85-12.85 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg>
            </a>
          </div>
        </div>
      </footer> */}
    </div>
  );
}