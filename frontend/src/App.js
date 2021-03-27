import { React } from "react";
import Home from "./components/HomeContent";
import TaskList from "./components/TaskList";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import CreateTask from "./components/CreateTask";
import LoginScreen from "./components/LoginScreen";
import ProtectedRoute from "./components/Helpers/ProtectedRoutes";

import { Route, BrowserRouter as Router, Switch } from "react-router-dom";

//Notification
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Navbar */}
        <Navigation />
        <Switch>
          <Route path="/signIn" component={LoginScreen} />
          <ProtectedRoute path="/tasks" component={TaskList} />
          <ProtectedRoute path="/createTask" component={CreateTask} />
          <Route path="/" component={Home} />
        </Switch>
        {/* Footer */}
        <Footer />
      </div>

      <ToastContainer autoClose={3000} />
    </Router>
  );
}

export default App;
