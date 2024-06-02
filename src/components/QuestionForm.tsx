import React, { useState } from 'react';

interface QuestionFormProps {
    onAddQuestion: (question: string, answer: Answer, type: QuestionType) => void;
}

interface Answer {
    text: string;
    isCorrect: boolean;
}

type QuestionType = 'radio' | 'checkbox' | 'short_answer' | 'long_answer';

const QuestionForm: React.FC<QuestionFormProps> = ({ onAddQuestion }) => {
    const [question, setQuestion] = useState('');
    const [answerText, setAnswerText] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [questionType, setQuestionType] = useState<QuestionType>('radio');

    const handleAddQuestion = () => {
        if (question && (answerText || questionType === 'short_answer' || questionType === 'long_answer')) {
            const answer: Answer = {
                text: answerText,
                isCorrect,
            };
            onAddQuestion(question, answer, questionType);
            setAnswerText('');
            setIsCorrect(false);
        }
    };

    const questionTypeRadioId = 'questionType-radio';
    const questionTypeCheckboxId = 'questionType-checkbox';
    const questionTypeShortAnswerId = 'questionType-short-answer';
    const questionTypeLongAnswerId = 'questionType-long-answer';
    const answerCorrectId = 'answer-correct';

    return (
        <div>
            <div>
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Введите вопрос"
            />
            {(questionType === 'radio' || questionType === 'checkbox') && (
                <>
                    <input
                        type="text"
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Введите ответ"
                    />
                    <>
                        <input
                            id={answerCorrectId}
                            type="checkbox"
                            checked={isCorrect}
                            onChange={(e) => setIsCorrect(e.target.checked)}
                        />
                        <label htmlFor={answerCorrectId}>
                            Правильный
                        </label>
                    </>
                </>
            )}
            </div>
            <div className="radio-type-group">
                <>

                    <input
                        id={questionTypeRadioId}
                        type="radio"
                        value="radio"
                        checked={questionType === 'radio'}
                        onChange={() => setQuestionType('radio')}
                    />
                    <label htmlFor={questionTypeRadioId}>
                        Один выбор
                    </label>
                </>

                <>
                    <input
                        id={questionTypeCheckboxId}
                        type="radio"
                        value="checkbox"
                        checked={questionType === 'checkbox'}
                        onChange={() => setQuestionType('checkbox')}
                    />
                    <label htmlFor={questionTypeCheckboxId}>
                    Множественный выбор
                    </label>
                </>

                <>
                    <input
                        id={questionTypeShortAnswerId}
                        type="radio"
                        value="short_answer"
                        checked={questionType === 'short_answer'}
                        onChange={() => setQuestionType('short_answer')}
                    />
                    <label htmlFor={questionTypeShortAnswerId}>
                    Короткий ответ
                    </label>
                </>
                <>
                    <input
                        id={questionTypeLongAnswerId}
                        type="radio"
                        value="long_answer"
                        checked={questionType === 'long_answer'}
                        onChange={() => setQuestionType('long_answer')}
                    />
                    <label htmlFor={questionTypeLongAnswerId}>
                    Развернутый ответ
                    </label>
                </>

            </div>
            <button onClick={handleAddQuestion}>Добавить вопрос и ответ</button>
        </div>
    );
};

export default QuestionForm;