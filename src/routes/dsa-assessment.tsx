import { useState } from "react";

export default function DSAAssessment() {
  const questions = [
    {
      question: "What is the time complexity of Binary Search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      answer: "O(log n)",
    },
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: "Queue",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (option: string) => {
    if (option === questions[current].answer) {
      setScore(score + 1);
    }

    if (current + 1 === questions.length) {
      setFinished(true);
    } else {
      setCurrent(current + 1);
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold mb-6">
          Assessment Complete
        </h1>

        <p className="text-2xl">
          Score: {score}/{questions.length}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-6">
          Question {current + 1}
        </h2>

        <p className="text-lg mb-8">
          {questions[current].question}
        </p>

        <div className="space-y-4">
          {questions[current].options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className="w-full border p-4 rounded-lg hover:bg-violet-50"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}