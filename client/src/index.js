import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './index.css';
import reportWebVitals from './reportWebVitals';
import Tool from './components/Tool';
import LoginForm from './components/Login';
import RegisterForm from './components/Register';
import Home from './components/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/player/" element={ <Tool /> }/>
      <Route path='/login/' element={ <LoginForm /> }/>
      <Route path='/register' element={ <RegisterForm /> }/>
      <Route path='/' element={ <Home /> }/>
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
