import { useEffect, useState } from "react";

export default function DSAAssessment() {
  const questions = [
//   {
//     question: "What is the time complexity of Binary Search?",
//     options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
//     answer: "O(log n)",
//     difficulty: "Easy",
//     category: "Searching",
//   },
//   {
//     question: "Which data structure uses FIFO?",
//     options: ["Stack", "Queue", "Tree", "Graph"],
//     answer: "Queue",
//     difficulty: "Easy",
//     category: "Queue",
//   },
//   {
//     question: "Which traversal uses a queue?",
//     options: ["DFS", "BFS", "Inorder", "Preorder"],
//     answer: "BFS",
//     difficulty: "Medium",
//     category: "Graphs",
//   },
  {
    question: "What is the worst case complexity of Quick Sort?",
    options: ["O(n log n)", "O(log n)", "O(n²)", "O(n)"],
    answer: "O(n²)",
    difficulty: "Medium",
    category: "Sorting",
  },
//   {
//     question: "Which data structure is used in recursion?",
//     options: ["Queue", "Heap", "Stack", "Graph"],
//     answer: "Stack",
//     difficulty: "Easy",
//     category: "Stack",
//   },
  {
    question: "Which data structure is best for implementing LRU Cache?",
    options: ["Array", "Linked List + HashMap", "Stack", "Queue"],
    answer: "Linked List + HashMap",
    difficulty: "Medium",
    category: "Linked List",
  },
//   {
//     question: "How many children can a binary tree node have?",
//     options: ["1", "2", "3", "Unlimited"],
//     answer: "2",
//     difficulty: "Easy",
//     category: "Trees",
//   },
  {
    question: "Which algorithm is used to find shortest path?",
    options: ["Merge Sort", "Dijkstra", "Binary Search", "KMP"],
    answer: "Dijkstra",
    difficulty: "Medium",
    category: "Graphs",
  },
  {
    question: "Which data structure provides O(1) average search?",
    options: ["Array", "Hash Table", "Queue", "Tree"],
    answer: "Hash Table",
    difficulty: "Easy",
    category: "Hashing",
  },
  {
    question: "What is the best case complexity of Merge Sort?",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(n²)"],
    answer: "O(n log n)",
    difficulty: "Medium",
    category: "Sorting",
  },
  {
    question: "Which traversal gives sorted order in BST?",
    options: ["Preorder", "Postorder", "Inorder", "Level Order"],
    answer: "Inorder",
    difficulty: "Easy",
    category: "Trees",
  },
  {
    question: "What is Dynamic Programming mainly used for?",
    options: [
      "Sorting",
      "Optimization Problems",
      "Searching",
      "Traversal",
    ],
    answer: "Optimization Problems",
    difficulty: "Medium",
    category: "DP",
  },
  {
    question: "Which data structure works on LIFO?",
    options: ["Queue", "Heap", "Stack", "Graph"],
    answer: "Stack",
    difficulty: "Easy",
    category: "Stack",
  },
  {
    question: "What is the space complexity of BFS?",
    options: ["O(1)", "O(V)", "O(log V)", "O(E)"],
    answer: "O(V)",
    difficulty: "Hard",
    category: "Graphs",
  },
  {
    question: "Which technique is used in Binary Search?",
    options: [
      "Greedy",
      "Divide and Conquer",
      "Backtracking",
      "DP",
    ],
    answer: "Divide and Conquer",
    difficulty: "Easy",
    category: "Searching",
  },
];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [correctCategories, setCorrectCategories] = useState<string[]>([]);
const [wrongCategories, setWrongCategories] = useState<string[]>([]);
  const [bestScore, setBestScore] = useState(
  Number(localStorage.getItem("bestDSAScore")) || 0
);

useEffect(() => {
  if (finished) return;

  if (timeLeft === 0) {
    setFinished(true);
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [timeLeft, finished]);

const minutes = Math.floor(timeLeft / 60);
const seconds = timeLeft % 60;


  const handleAnswer = (option: string) => {
    if (option === questions[current].answer) {
      setScore((prev) => prev + 1);
      setCorrectCategories((prev) => [
      ...prev,
      questions[current].category,
    ]);
  } else {
    setWrongCategories((prev) => [
      ...prev,
      questions[current].category,
    ]);
    }
if (current + 1 === questions.length) {

  const finalScore =
    option === questions[current].answer
      ? score + 1
      : score;

  const previousBest =
    Number(localStorage.getItem("bestDSAScore")) || 0;

  if (finalScore > previousBest) {
    localStorage.setItem(
      "bestDSAScore",
      finalScore.toString()
    );
    setBestScore(finalScore);
  }

  setFinished(true);
}
     else {
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
const strengths = [...new Set(correctCategories)];
const weaknesses = [...new Set(wrongCategories)];
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-purple-100">
        <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg">
          <h1 className="text-5xl font-bold mb-6">
            🎉 Assessment Complete
          </h1>

          <p className="text-3xl font-semibold mb-4">
            Score: {score}/{questions.length}
          </p>

          <p className="text-lg text-violet-700 font-semibold mb-6">
  🏆 Best Score: {Math.max(score, bestScore)}/{questions.length}
</p>

          <p className="text-lg text-violet-700 font-semibold mb-8">
            {percentage >= 80
              ? "Excellent! You're placement ready 🚀"
              : percentage >= 60
              ? "Good job! Keep practicing 💪"
              : "More practice needed 📚"}
          </p>
<div className="text-left mb-8">
  <h3 className="font-bold text-xl mb-3 text-green-600">
    ✅ Strengths
  </h3>

  <ul className="mb-6">
    {strengths.length > 0 ? (
      strengths.map((item) => (
        <li key={item}>• {item}</li>
      ))
    ) : (
      <li>No strengths identified</li>
    )}
  </ul>

  <h3 className="font-bold text-xl mb-3 text-red-600">
    ❌ Needs Improvement
  </h3>

  <ul>
    {weaknesses.length > 0 ? (
      weaknesses.map((item) => (
        <li key={item}>• {item}</li>
      ))
    ) : (
      <li>No weak areas identified</li>
    )}
  </ul>
</div>
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
        <div className="flex justify-between items-center mb-6">
  <h2 className="text-lg font-semibold">
    ⏱ Time Remaining
  </h2>

  <span
    className={`font-bold text-xl ${
      timeLeft < 60 ? "text-red-600" : "text-violet-600"
    }`}
  >
    {minutes}:{seconds.toString().padStart(2, "0")}
  </span>
</div>
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