import * as AC from "adaptivecards";
import Select from "../components/Select";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);

export class ChoiceSetInput extends AC.ChoiceSetInput {
  static readonly JsonTypeName = "Input.ChoiceSet";

  // For form submission
  private _value = ""
  public get value(): any {
    return this._value;
  }
  public isSet(): boolean {
    return this._value?.length > 0 ? true : false;
  }
  protected onChange(newValue: string) {
    this._value = newValue;
  }

  render(): HTMLElement | undefined {
    return reactDomRender(this.renderElement());
  }

  private renderElement = (): JSX.Element => {
    interface item {
        label: string | undefined
        value: string | undefined
    }
    var items:item[] = []

    this.choices.map((item, key) => (
        items.push({ label: item.title, value:item.value})
    ))
  
    return (
        <ThemeProvider theme={menuTheme}>
            <Select
                label={this.label || this.placeholder}
                onChange={(e: any) => this.onChange(e)}
                items={items}
                value={this._value}
            />
        </ThemeProvider>
    );
  };
}
