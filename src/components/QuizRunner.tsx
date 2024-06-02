import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Answer {
    text: string;
    isCorrect: boolean;
}

type QuestionType = 'radio' | 'checkbox' | 'short_answer' | 'long_answer';

interface Question {
    question: string;
    answers: Answer[];
    type: QuestionType;
}

interface QuizRunnerProps {
    questions: Question[];
    timeLimit: number;
    quizName: string;
}

const QuizRunner: React.FC<QuizRunnerProps> = ({ questions, timeLimit, quizName }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswerIndexes, setSelectedAnswerIndexes] = useState<number[]>([]);
    const [shortAnswer, setShortAnswer] = useState('');
    const [longAnswer, setLongAnswer] = useState('');
    const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(Array(questions.length).fill(false));

    const localStorageKey = useRef(`quiz-progress-${quizName}`).current;
    const isInitialLoad = useRef(true);
    const navigate = useNavigate();

    const loadProgressFromLocalStorage = () => {
        const savedProgress = sessionStorage.getItem(localStorageKey);
        if (savedProgress) {
            const {
                currentQuestionIndex,
                selectedAnswerIndexes,
                shortAnswer,
                longAnswer,
                correctAnswersCount,
                quizFinished,
                timeLeft,
                answeredQuestions
            } = JSON.parse(savedProgress);
            setCurrentQuestionIndex(currentQuestionIndex);
            setSelectedAnswerIndexes(selectedAnswerIndexes);
            setShortAnswer(shortAnswer);
            setLongAnswer(longAnswer);
            setCorrectAnswersCount(correctAnswersCount);
            setQuizFinished(quizFinished);
            setTimeLeft(timeLeft);
            setAnsweredQuestions(answeredQuestions);
        }
    };

    // Загрузка прогресса при первой загрузке компонента
    useEffect(() => {
        loadProgressFromLocalStorage();
        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    setQuizFinished(true);
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Сохранение прогресса в localStorage при изменении состояния, если это не первая загрузка
    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return;
        }
        const progress = {
            currentQuestionIndex,
            selectedAnswerIndexes,
            shortAnswer,
            longAnswer,
            correctAnswersCount,
            quizFinished,
            timeLeft,
            answeredQuestions
        };
        sessionStorage.setItem(localStorageKey, JSON.stringify(progress));
    }, [
        currentQuestionIndex,
        selectedAnswerIndexes,
        shortAnswer,
        longAnswer,
        correctAnswersCount,
        quizFinished,
        timeLeft,
        answeredQuestions
    ]);

    const handleAnswerSelect = (index: number) => {
        if (questions[currentQuestionIndex].type === 'radio') {
            setSelectedAnswerIndexes([index]);
        } else if (questions[currentQuestionIndex].type === 'checkbox') {
            if (selectedAnswerIndexes.includes(index)) {
                setSelectedAnswerIndexes(selectedAnswerIndexes.filter(i => i !== index));
            } else {
                setSelectedAnswerIndexes([...selectedAnswerIndexes, index]);
            }
        }
    };

    const handleNextQuestion = () => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = (currentQuestion.type === 'radio' && currentQuestion.answers[selectedAnswerIndexes[0]]?.isCorrect) ||
            (currentQuestion.type === 'checkbox' && selectedAnswerIndexes.every(index => currentQuestion.answers[index]?.isCorrect)) ||
            (currentQuestion.type === 'short_answer' && shortAnswer.trim().length > 0) ||
            (currentQuestion.type === 'long_answer' && longAnswer.trim().length > 0);

        if (isCorrect) {
            setCorrectAnswersCount(prev => prev + 1);
        }

        setAnsweredQuestions(prevStatus => {
            const newStatus = [...prevStatus];
            newStatus[currentQuestionIndex] = true;
            return newStatus;
        });

        if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswerIndexes([]);
            setShortAnswer('');
            setLongAnswer('');
        } else {
            setQuizFinished(true);
        }
    };


    if (quizFinished) {
        navigate("/")
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="test-container">
            <div className="testing-header">
                <div className="testing-header-title">{quizName}</div>
                <div className="testing-header-time">{Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}</div>
            </div>

            <div className="progress-indicators-container">
                {questions.map((_, index) => (
                    <div
                        key={index}
                        className="progress-indicators-element"
                        style={{
                            backgroundColor: answeredQuestions[index]
                                ? 'black'
                                : index === currentQuestionIndex
                                    ? '#d13b3b'
                                    : 'gray',
                        }}
                    ></div>
                ))}
            </div>
            <h2 className="question-title">{currentQuestion.question}</h2>
            {currentQuestion.type === 'radio' || currentQuestion.type === 'checkbox' ? (
                <ul className="ul-no-bullets">
                    {currentQuestion.answers.map((answer, index) => {
                        const inputId = `answer-${currentQuestionIndex}-${index}`;
                        return (
                            <li className="no-bullets" key={index} style={{
                                color: selectedAnswerIndexes.includes(index) ? 'blue' : 'black'
                            }}>
                                <input
                                    id={inputId}
                                    type={currentQuestion.type === 'radio' ? 'radio' : 'checkbox'}
                                    name={`question-${currentQuestionIndex}`}
                                    checked={selectedAnswerIndexes.includes(index)}
                                    onChange={() => handleAnswerSelect(index)}
                                />
                                <label htmlFor={inputId}>{answer.text}</label>
                            </li>
                        );
                    })}
                </ul>
            ) : currentQuestion.type === 'short_answer' ? (
                <div>
                    <input
                        type="text"
                        value={shortAnswer}
                        onChange={(e) => setShortAnswer(e.target.value)}
                        placeholder="Введите короткий ответ"
                    />
                </div>
            ) : (
                <div>
                    <textarea
                        value={longAnswer}
                        onChange={(e) => setLongAnswer(e.target.value)}
                        placeholder="Введите развернутый ответ"
                    />
                </div>
            )}
            <button className="test-button" onClick={handleNextQuestion}
                    disabled={currentQuestion.type === 'radio' || currentQuestion.type === 'checkbox' ? selectedAnswerIndexes.length === 0 : currentQuestion.type === 'short_answer' ? shortAnswer.trim() === '' : longAnswer.trim() === ''}>
                {currentQuestionIndex + 1 === questions.length ? 'Завершить тест' : 'Следующий вопрос'}
            </button>
        </div>
    );
};

export default QuizRunner;