import * as React from "react";
import * as ReactDOM from "react-dom";


declare module '@mui/material/styles' {
    interface Theme {
        name: string;
        logo: string;
    }
  
    // allow configuration using `createTheme`
    interface ThemeOptions {
        name?: string;
        logo?: string;
    }
}

export const reactDomRender = (
    reactElement: React.ReactElement
  ): HTMLElement | undefined => {
    const div = document.createElement("div");
    ReactDOM.render(reactElement, div);
    return div;
  };
  