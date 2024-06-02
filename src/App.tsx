import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuizForm from "./components/QuizForm";
import QuizRunnerPage from "./components/QuizRunnerPage";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<QuizFormWithClearStorage />} />
                <Route path="/quiz/:quizName" element={<QuizRunnerPage />} />
            </Routes>
        </Router>
    );
};

const QuizFormWithClearStorage: React.FC = () => {
    useEffect(() => {
        return () => {
            sessionStorage.clear();
        };
    }, []);

    return <QuizForm />;
};

export default App;