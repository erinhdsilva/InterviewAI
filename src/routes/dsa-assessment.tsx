import { useState } from "react";

export default function DSAAssessment() {
  const questions = [
    {
      question: "What is the time complexity of Binary Search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: "O(log n)",
      difficulty: "Easy",
      category: "Searching",
    },
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: "Queue",
      difficulty: "Easy",
      category: "Queue",
    },
    {
      question: "Which traversal uses a queue?",
      options: ["DFS", "BFS", "Inorder", "Preorder"],
      answer: "BFS",
      difficulty: "Medium",
      category: "Graphs",
    },
    {
      question: "What is the worst case complexity of Quick Sort?",
      options: ["O(n log n)", "O(log n)", "O(n²)", "O(n)"],
      answer: "O(n²)",
      difficulty: "Medium",
      category: "Sorting",
    },
    {
      question: "Which data structure is used in recursion?",
      options: ["Queue", "Heap", "Stack", "Graph"],
      answer: "Stack",
      difficulty: "Easy",
      category: "Stack",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option: string) => {
    if (option === questions[current].answer) {
      setScore((prev) => prev + 1);
    }

    if (current + 1 === questions.length) {
      setFinished(true);
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const restartAssessment = () => {
    setCurrent(0);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-purple-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
          <h1 className="text-5xl font-bold mb-6">
            🎉 Assessment Complete
          </h1>

          <p className="text-3xl font-semibold mb-4">
            Score: {score}/{questions.length}
          </p>

          <p className="text-xl text-gray-600 mb-6">
            Accuracy: {percentage}%
          </p>

          <p className="text-lg text-violet-700 font-semibold mb-8">
            {percentage >= 80
              ? "Excellent! You're placement ready 🚀"
              : percentage >= 60
              ? "Good job! Keep practicing 💪"
              : "More practice needed 📚"}
          </p>

          <button
            onClick={restartAssessment}
            className="bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  const progress =
    ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-purple-100 p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-3xl">

        {/* Progress */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
          <div
            className="bg-violet-600 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <h2 className="text-xl font-bold mb-4">
          Question {current + 1} of {questions.length}
        </h2>

        {/* Badges */}
        <div className="flex gap-3 mb-6">
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            {questions[current].difficulty}
          </span>

          <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm">
            {questions[current].category}
          </span>
        </div>

        <p className="text-2xl font-semibold mb-8">
          {questions[current].question}
        </p>

        <div className="space-y-4">
          {questions[current].options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="w-full border p-4 rounded-xl text-left hover:bg-violet-50 hover:border-violet-500 transition"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}