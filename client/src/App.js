import React from "react";
import { Route, Switch } from "react-router-dom";
import Join from "./components/Join/Join"
import Chat from "./components/Chat/Chat"
import withTransition from "./utils/withTransition"

function App() {
  return (
    <Switch>
      <Route path="/" exact component={Join} />
      <Route path="/chat" component={Chat} />
    </Switch>
  );
}

export default withTransition(App);
