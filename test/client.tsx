import React from "react";
import ReactDOM from "react-dom";
import { loadableReady } from "@loadable/component";

import App from "./app";

loadableReady(() => {
  const root = document.getElementById("root");
  ReactDOM.hydrate(<App />, root);
});
