import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter} from "react-router-dom";
import axios from "axios";

axios.interceptors.request.use(request => {
  let loggedUser = JSON.parse(localStorage.getItem('loggedUser'));

  if (loggedUser && !request.url.endsWith('loggedUser')) {
    request.headers.common.Authorization = `Bearer ${loggedUser.accessToken}`;
  }

  return request;
});

ReactDOM.render(
    <BrowserRouter>
      <App/>
    </BrowserRouter>,
    document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
