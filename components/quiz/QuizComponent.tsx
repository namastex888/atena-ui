'use client';

import { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizComponentProps {
  questions: QuizQuestion[];
  topic: string;
}

export function QuizComponent({ questions, topic }: QuizComponentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Resultado do Quiz: {topic}
        </h2>
        <div className="mb-6">
          <div className="text-4xl font-bold text-center mb-2">
            <span className={percentage >= 70 ? 'text-green-600' : 'text-orange-500'}>
              {score}/{questions.length}
            </span>
          </div>
          <div className="text-center text-gray-600">
            {percentage}% de acertos
          </div>
        </div>
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {selectedAnswers[idx] === q.correctAnswer ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <X className="w-5 h-5 text-red-500" />
              )}
              <span className="text-sm">Questão {idx + 1}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setCurrentQuestion(0);
            setSelectedAnswers(new Array(questions.length).fill(null));
            setShowResults(false);
            setShowExplanation(false);
          }}
          className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const hasAnswered = selectedAnswers[currentQuestion] !== null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-700">
            Quiz: {topic}
          </h3>
          <span className="text-sm text-gray-500">
            Questão {currentQuestion + 1} de {questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg font-medium text-gray-800 mb-4">
          {question.question}
        </p>
        <div className="space-y-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestion] === idx;
            const isCorrect = idx === question.correctAnswer;
            const showCorrectness = hasAnswered;

            return (
              <button
                key={idx}
                onClick={() => !hasAnswered && handleAnswer(idx)}
                disabled={hasAnswered}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  !hasAnswered
                    ? 'hover:border-blue-400 hover:bg-blue-50 border-gray-200'
                    : isSelected
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                } ${!hasAnswered ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className={showCorrectness && isCorrect ? 'font-semibold' : ''}>
                    {option}
                  </span>
                  {showCorrectness && isCorrect && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {showCorrectness && isSelected && !isCorrect && (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showExplanation && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-gray-700">
            <strong>Explicação:</strong> {question.explanation}
          </p>
        </div>
      )}

      {hasAnswered && (
        <button
          onClick={nextQuestion}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          {currentQuestion < questions.length - 1 ? (
            <>
              Próxima Questão
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            'Ver Resultados'
          )}
        </button>
      )}
    </div>
  );
}