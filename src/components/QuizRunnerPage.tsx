import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import QuizRunner from './QuizRunner';

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

interface LocationState {
    questions: Question[];
    timeLimit: number;
}

const QuizRunnerPage: React.FC = () => {
    const { quizName } = useParams<{ quizName: string }>();
    const location = useLocation();
    const { questions, timeLimit } = (location.state as LocationState) || { questions: [], timeLimit: 0 };

    if (!quizName) {
        return <div>Error: Quiz name is required</div>;
    }

    return (
        <div>
            <QuizRunner questions={questions} timeLimit={timeLimit} quizName={quizName} />
        </div>
    );
};

export default QuizRunnerPage;