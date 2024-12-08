import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App.jsx";
import { Provider } from "./components/ui/provider.jsx";

const root = createRoot(document.getElementById("app"));
root.render(
  <Provider>
    <App />
  </Provider>,
);
