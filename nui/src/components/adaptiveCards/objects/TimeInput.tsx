import * as React from "react";
import * as AC from "adaptivecards";
import TimePicker from "../components/TimePicker";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);

export class TimeInput extends AC.TimeInput  {
  static readonly JsonTypeName = "Input.Time";

  // For form submission
  private _value = "";
  public get value(): any {
    return this._value;
  }
  public isSet(): any {
    return this._value ? true : false;
  }
  protected onChange(newValue: any) {
    this._value = newValue?.toString();
  }

  render(): HTMLElement | undefined {
    return reactDomRender(this.renderElement());
  }

  private renderElement() {
    return (
      <ThemeProvider theme={menuTheme}>
        <TimePicker
          label={this.label || "Time"} 
          onChange={(e: any) => this.onChange(e)}
        />
      </ThemeProvider>
    );
  }
}
