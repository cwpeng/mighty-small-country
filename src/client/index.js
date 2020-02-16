import React from "react";
import ReactDOM from "react-dom";
import App from "../components/App.js";
ReactDOM.hydrate(<App
	chapters={window.__INIT_DATA__.chapters}
	sections={window.__INIT_DATA__.sections}
	page={window.__INIT_DATA__.page}
/>, document.querySelector("#root"));