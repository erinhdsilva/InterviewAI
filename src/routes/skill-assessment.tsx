import { Link } from "react-router-dom";
import { Brain, Globe, BookOpen, Code, ArrowRight } from "lucide-react";

export default function SkillAssessment() {
  const assessments = [
    {
      title: "DSA Assessment",
      icon: <Code className="w-8 h-8 text-violet-600" />,
      questions: 20,
      route: "/assessment/dsa",
    },
    {
      title: "Web Development",
      icon: <Globe className="w-8 h-8 text-violet-600" />,
      questions: 20,
      route: "/assessment/webdev",
    },
    {
      title: "Machine Learning",
      icon: <Brain className="w-8 h-8 text-violet-600" />,
      questions: 20,
      route: "/assessment/ml",
    },
    {
      title: "CS Fundamentals",
      icon: <BookOpen className="w-8 h-8 text-violet-600" />,
      questions: 20,
      route: "/assessment/cs",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold mb-4">
            🚀 Skill Assessment
          </div>

          <h1 className="text-5xl font-bold mb-4">
            Skill Assessment Hub
          </h1>

          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Test your skills, identify weak areas, and improve with curated learning resources.
          </p>
        </div>

        {/* Assessment Cards */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          Take Assessments
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {assessments.map((item, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-3xl shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              <div className="mb-5">
                {item.icon}
              </div>

              <h2 className="text-2xl font-bold mb-3">
                {item.title}
              </h2>

              <p className="text-gray-500 mb-6">
                {item.questions} Questions • Beginner to Intermediate
              </p>

              <Link
                to={item.route}
                className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition"
              >
                Start Assessment
                <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Learning Resources
          </h2>

          <div className="bg-white p-8 rounded-3xl shadow-md hover:shadow-xl transition">
            <h3 className="text-2xl font-bold text-violet-600 mb-4">
              Placement Preparation Hub
            </h3>

            <p className="text-gray-600 mb-6">
              Explore DSA sheets, Web Development roadmaps, Machine Learning resources,
              CS Fundamentals, Company Preparation, and Interview Experiences.
            </p>

            <Link
              to="/dsa-roadmap"
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition"
            >
              Explore Resources
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Future Feature
        <div className="mt-12 bg-violet-100 border border-violet-200 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-violet-700 mb-3">
            📈 Coming Soon
          </h3>

          <p className="text-gray-700">
            Personalized skill reports, placement readiness scores,
            AI-powered recommendations, and progress tracking.
          </p> */}
        {/* </div> */}
      </div>
    </div>
  );
}