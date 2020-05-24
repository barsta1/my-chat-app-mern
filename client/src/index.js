import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./styles/index.scss";
import App from "./App";

ReactDOM.render(
  <Router>
    <Route path="/" component={App}>
      <App />
    </Route>
  </Router>,
  document.getElementById("root")
);
