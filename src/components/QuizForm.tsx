import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionForm from './QuestionForm';

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

interface Quiz {
    name: string;
    questions: Question[];
    timeLimit: number;
}

const QuizForm: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedQuizName, setSelectedQuizName] = useState('');
    const [name, setName] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [timeLimit, setTimeLimit] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const savedQuizzes = localStorage.getItem('quizzes');
        if (savedQuizzes) {
            setQuizzes(JSON.parse(savedQuizzes));
        }
    }, []);

    useEffect(() => {
        if (selectedQuizName) {
            const selectedQuiz = quizzes.find(quiz => quiz.name === selectedQuizName);
            if (selectedQuiz) {
                setName(selectedQuiz.name);
                setQuestions(selectedQuiz.questions);
                setTimeLimit(selectedQuiz.timeLimit);
            }
        }
    }, [selectedQuizName, quizzes]);

    const handleAddQuestion = (question: string, answer: Answer, type: QuestionType) => {
        let updatedQuestions = [...questions];
        const questionIndex = updatedQuestions.findIndex(q => q.question === question);

        if (questionIndex > -1) {
            updatedQuestions[questionIndex].answers.push(answer);
            if (type === 'radio' && updatedQuestions[questionIndex].answers.filter(a => a.isCorrect).length > 1) {
                updatedQuestions[questionIndex].type = 'checkbox';
            }
        } else {
            if (type === 'radio' && answer.isCorrect) {
                const correctAnswers = updatedQuestions.reduce((acc, q) => acc + q.answers.filter(a => a.isCorrect).length, 0);
                if (correctAnswers > 1) {
                    type = 'checkbox';
                }
            }
            updatedQuestions.push({ question, answers: [answer], type });
        }

        setQuestions(updatedQuestions);
        saveQuiz(name, updatedQuestions, timeLimit);
    };

    const handleDeleteQuestion = (questionIndex: number) => {
        const updatedQuestions = questions.filter((_, index) => index !== questionIndex);
        setQuestions(updatedQuestions);
        saveQuiz(name, updatedQuestions, timeLimit);
    };

    const handleDeleteAnswer = (questionIndex: number, answerIndex: number) => {
        const updatedQuestions = questions.map((question, qIndex) => {
            if (qIndex === questionIndex) {
                return {
                    ...question,
                    answers: question.answers.filter((_, aIndex) => aIndex !== answerIndex)
                };
            }
            return question;
        });
        setQuestions(updatedQuestions);
        saveQuiz(name, updatedQuestions, timeLimit);
    };

    const handleClearQuiz = () => {
        setName('');
        setQuestions([]);
        setTimeLimit(0);
    };

    const handleStartQuiz = () => {
        navigate(`/quiz/${encodeURIComponent(name)}`, { state: { questions, timeLimit } });
    };

    const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTimeLimit = parseInt(e.target.value);
        setTimeLimit(newTimeLimit);
    };

    const handleSaveTimeLimit = () => {
        saveQuiz(name, questions, timeLimit);
    };

    const saveQuiz = (name: string, questions: Question[], timeLimit: number) => {    const updatedQuizzes = quizzes.filter(quiz => quiz.name !== name);
        updatedQuizzes.push({ name, questions, timeLimit });
        setQuizzes(updatedQuizzes);
        localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
    };

    const handleQuizSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedQuizName(e.target.value);
    };

    const handleCreateNewQuiz = () => {
        handleClearQuiz();
        setSelectedQuizName('');
    };

    return (
        <div>
            <h1>Создать Тест</h1>
            <div className="choice-test">
                <div className="choice-test-text">Выберите тест: </div>
                <select value={selectedQuizName} onChange={handleQuizSelect}>
                    <option value="" disabled>Выберите тест</option>
                    {quizzes.map(quiz => (
                        <option key={quiz.name} value={quiz.name}>{quiz.name}</option>
                    ))}
                </select>
            </div>

            <div className="choice-test">
                <button onClick={handleCreateNewQuiz}>Создать новый тест</button>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Название теста"
                />
            </div>

            <QuestionForm onAddQuestion={handleAddQuestion}/>
            <h2>Ваши вопросы</h2>
            <ul>
                {questions.map((q, questionIndex) => (
                    <li key={questionIndex}>
                        <strong>{q.question}</strong> ({q.type === 'radio' ? 'Один выбор' : q.type === 'checkbox' ? 'Множественный выбор' : q.type === 'short_answer' ? 'Короткий ответ' : 'Развернутый ответ'})
                        <button onClick={() => handleDeleteQuestion(questionIndex)}>Удалить вопрос</button>
                        {q.type !== 'short_answer' && q.type !== 'long_answer' && (
                            <ul>
                                {q.answers.map((ans, answerIndex) => (
                                    <li key={answerIndex} style={{ color: ans.isCorrect ? 'green' : 'red' }}>
                                        {ans.text} {ans.isCorrect ? '(Правильный)' : '(Неправильный)'}
                                        <button onClick={() => handleDeleteAnswer(questionIndex, answerIndex)}>Удалить ответ</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <div>
                <label>Ограничение по времени (в минутах): </label>
                <input
                    type="number"
                    value={timeLimit}
                    onChange={handleTimeLimitChange}
                    placeholder="Введите время в минутах"
                />
                <button onClick={handleSaveTimeLimit}>Сохранить время</button>
            </div>
            <button onClick={handleStartQuiz} disabled={questions.length === 0}>Начать тест</button>
            <button onClick={handleClearQuiz}>Очистить тест</button>
        </div>
    );
};

export default QuizForm;