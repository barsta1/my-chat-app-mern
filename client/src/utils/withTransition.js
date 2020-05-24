import React, { Component } from "react";
import { Transition } from "react-transition-group";

const withTransition = (WrappedComponent) => {
  return class extends Component {
    render() {
      return (
        <Transition timeout={0} in={true}>
          {(status) => (
            <div className={`box-${status}`}>
              <WrappedComponent />
            </div>
          )}
        </Transition>
      )
    }
  }
};
export default withTransition;