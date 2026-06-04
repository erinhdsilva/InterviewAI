import { useState } from "react";
import {
  ExternalLink,
  Code,
  Globe,
  Brain,
  BookOpen,
  Building2,
  MessageSquare,
} from "lucide-react";
export default function DSARoadmap() {
  const [search, setSearch] = useState("");

  const sections = [
    {
      title: "DSA",
      icon: <Code className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "Striver A2Z Sheet",
          link: "https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/",
        },
        {
          name: "Blind 75",
          link: "https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions",
        },
        {
          name: "NeetCode 150",
          link: "https://neetcode.io/roadmap",
        },
      ],
    },
    {
      title: "Web Development",
      icon: <Globe className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "The Odin Project",
          link: "https://www.theodinproject.com/",
        },
        {
          name: "Full Stack Open",
          link: "https://fullstackopen.com/en/",
        },
        {
          name: "MDN Web Docs",
          link: "https://developer.mozilla.org/",
        },
      ],
    },
    {
      title: "Machine Learning",
      icon: <Brain className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "Andrew Ng ML",
          link: "https://www.coursera.org/specializations/machine-learning-introduction",
        },
        {
          name: "Kaggle Learn",
          link: "https://www.kaggle.com/learn",
        },
        {
          name: "AI Roadmap",
          link: "https://roadmap.sh/ai-data-scientist",
        },
      ],
    },
    {
      title: "CS Fundamentals",
      icon: <BookOpen className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "DBMS",
          link: "https://www.geeksforgeeks.org/dbms/",
        },
        {
          name: "Operating Systems",
          link: "https://www.geeksforgeeks.org/operating-systems/",
        },
        {
          name: "Computer Networks",
          link: "https://www.geeksforgeeks.org/computer-network-tutorials/",
        },
        {
          name: "OOPs",
          link: "https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/",
        },
      ],
    },
    {
      title: "Company Preparation",
      icon: <Building2 className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "Amazon Interview Prep",
          link: "https://www.geeksforgeeks.org/amazon-interview-experience/",
        },
        {
          name: "Google Interview Prep",
          link: "https://www.geeksforgeeks.org/google-interview-experience/",
        },
        {
          name: "Microsoft Interview Prep",
          link: "https://www.geeksforgeeks.org/microsoft-interview-experience/",
        },
        {
          name: "Adobe Interview Prep",
          link: "https://www.geeksforgeeks.org/adobe-interview-experience/",
        },
      ],
    },
    {
      title: "Interview Experiences",
      icon: <MessageSquare className="w-8 h-8 text-violet-600" />,
      resources: [
        {
          name: "GeeksForGeeks Experiences",
          link: "https://www.geeksforgeeks.org/company-interview-corner/",
        },
        {
          name: "LeetCode Discuss",
          link: "https://leetcode.com/discuss/interview-question",
        },
        {
          name: "Glassdoor Interviews",
          link: "https://www.glassdoor.com/Interview/index.htm",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold mb-5">
            🚀 Placement Resources
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold mb-5">
            Placement Preparation Hub
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to crack placements:
            DSA, Development, CS Core Subjects, Machine Learning,
            Interview Experiences and Company Preparation.
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-12">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search resources..."
            className="w-full px-5 py-4 rounded-2xl border border-violet-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {sections.map((section, index) => {
            const filteredResources = section.resources.filter((resource) =>
              resource.name.toLowerCase().includes(search.toLowerCase())
            );

            if (
              filteredResources.length === 0 &&
              search.trim() !== ""
            ) {
              return null;
            }

            return (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-6">
                  {section.icon}
                  <h2 className="text-2xl font-bold text-violet-600">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {filteredResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl border hover:bg-violet-50 hover:border-violet-300 transition"
                    >
                      <span className="font-medium">
                        {resource.name}
                      </span>

                      <ExternalLink
                        size={18}
                        className="text-violet-600"
                      />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}