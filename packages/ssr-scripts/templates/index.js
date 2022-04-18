const app = `
import React from 'react'

export default () => {
  return <div>Hello SSR React!!!</div>
}

`

const bootstrap = `
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import { loadableReady } from "@loadable/component";

import App from "./app";

loadableReady(() => {
  ReactDOM.hydrate(
    <BrowserRouter>
      <App />
    </BrowserRouter>,
    document.getElementById("root")
  );
});

if (module.hot) {
  module.hot.accept();
}

`

module.exports = {
  app,
  bootstrap,
}
