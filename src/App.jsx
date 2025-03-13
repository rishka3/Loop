import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import Header from './components/Header/Header';
import Home from './pages/Home/Home';

import './App.css'



function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <Header />
                <Home />
            </div>
        </BrowserRouter>dfadfadfadfa
    );
}

export default App;