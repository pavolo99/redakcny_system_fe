import './App.css';
import {Redirect, Route, Switch} from "react-router-dom";
import DashboardPage from "./pages/dashboard/Dashboard-page";
import EditorPage from "./pages/editor/Editor-page";

function App() {
  return (
      <div>
          <Switch>
            <Route exact path='/'>
              <Redirect to="/dashboard"/>
            </Route>
            <Route path='/dashboard' component={DashboardPage} />
            <Route path='/editor' component={EditorPage} />
          </Switch>
      </div>
  );
}

export default App;
