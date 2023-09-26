import * as React from "react";
import * as AC from "adaptivecards";
import ACTextField from "../components/TextField";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);
export class TextInput extends AC.TextInput {
  static readonly JsonTypeName = "Input.Text";

  // For form submission
  private _value = ""
  public get value(): string {
    return this._value;
  }
  public isSet(): boolean {
    return this._value ? true : false;
  }
  protected onChange(newValue:string) {
    this._value = newValue;
    this.render();
    return !this.isValid();
  }

  public isValid() {
    const isValid =
      (this.isRequired && (!this.isDirty() || this._value != "")) ||
      !this.isRequired;
    //console.log("isValid", isValid);
    return isValid;
  }

  render(): HTMLElement | undefined {
    return reactDomRender(this.renderElement());
  }

  private renderElement() {
    let sharedProps: any = {
      placeholder: this.placeholder,
      required: this.isRequired
    };

    if (!this.isValid()) {
      sharedProps.error = true;
    }

    if (this.errorMessage) {
      sharedProps.helperText = this.errorMessage;
    }

    return (
        <ThemeProvider theme={menuTheme}>
            <ACTextField
            label={this.label || this.placeholder}
            onChangeHandler={(e: any) => {
                return this.onChange(e);
            }}
            {...sharedProps}
            // error={() => {!this.isValid() || undefined}
            />
        </ThemeProvider>
    );
  }
}
