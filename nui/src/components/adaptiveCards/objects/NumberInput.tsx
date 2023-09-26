import * as React from "react";
import * as AC from "adaptivecards";
import TextField from "../components/TextField";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);

export class NumberInput extends AC.NumberInput {
  static readonly JsonTypeName = "Input.Number";

  // For form submission
  private _value = 0
  public get value(): number {
    return this._value;
  }
  public isSet(): boolean {
    return this._value ? true : false;
  }
  protected onChange(newValue:number) {
    this._value = newValue;
    this.render();
    return !this.isValid();
  }

  public isValid() {
    const isValid =
      (this.isRequired && (!this.isDirty() || this._value != null)) ||
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
            <TextField
            label={this.label || this.placeholder}
            type="number"
            pattern= '[0-9]*'
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
