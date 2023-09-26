import * as React from "react";
import * as AC from "adaptivecards";
import DatePicker from "../components/DatePicker";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);

export class DateInput extends AC.DateInput {
  static readonly JsonTypeName = "Input.Date";

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
        <DatePicker label={this.label || "Date"} onChange={(e: any) => this.onChange(e)} />
      </ThemeProvider>
    );
  }
}
