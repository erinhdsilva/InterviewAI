import { ExternalLink } from "lucide-react";

export default function DSARoadmap() {
  const sections = [
    {
      title: "DSA",
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
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-100 p-10">
      <h1 className="text-5xl font-bold text-center mb-4">
        Placement Preparation Hub
      </h1>

      <p className="text-center text-gray-600 mb-12 text-lg">
        Curated resources for placements, interviews, development and learning
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={index}
            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <h2 className="text-2xl font-bold mb-6 text-violet-600">
              {section.title}
            </h2>

            <div className="space-y-4">
              {section.resources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-violet-50"
                >
                  <span>{resource.name}</span>
                  <ExternalLink size={18} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}