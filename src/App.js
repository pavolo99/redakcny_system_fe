import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import LoginPage from "./pages/login/Login-page";
import DashboardPage from "./pages/dashboard/Dashboard-page";
import EditorPage from "./pages/editor/Editor-page";
import React from "react";
import LoginCallbackPage from "./pages/login-callback/Login-callback-page";

function App() {

  return (
      <div>
        <Switch>
          <Route exact path='/'>
            <Redirect to="/login"/>
          </Route>
          <Route path='/login' component={LoginPage}/>
          <Route path='/login-callback' component={LoginCallbackPage}/>
          <Route path='/dashboard' component={DashboardPage}/>
          <Route path='/editor' component={EditorPage}/>

          <Route exact path='/**'>
            <Redirect to="/dashboard"/>
          </Route>
        </Switch>
      </div>
  );
}

export default App;
