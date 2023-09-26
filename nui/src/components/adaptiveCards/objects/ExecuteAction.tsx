import * as AC from "adaptivecards";
import Button from "../components/Button";
import { reactDomRender } from "./render";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
const menuTheme = createTheme(rawMenuTheme);

export class ExecuteAction extends AC.ExecuteAction {
  private internalRenderedElement: any;

  // Get the properites of the action
  static readonly textProperty = new AC.StringProperty(
    AC.Versions.v1_0,
    "text",
    true
  );

  static readonly titleProperty = new AC.StringProperty(
    AC.Versions.v1_0,
    "title",
    true
  );

  static readonly dataProperty = new AC.PropertyDefinition(
    AC.Versions.v1_0,
    "data"
  );

  getTitle(): string | undefined {
    return this.getValue(ExecuteAction.titleProperty);
  }

  getText(): string | undefined {
    return this.getValue(ExecuteAction.textProperty);
  }

  getData(): string | undefined {
    return this.getValue(ExecuteAction.dataProperty);
  }

  getInputs(): any {
    return this.getValue(ExecuteAction.associatedInputsProperty);
  }

  getInputValues(): any {
    return this.parent?.getAllInputs().map((input) => {
      return { id: input.id, value: input.value };
    });
  }

  get renderedElement(): HTMLElement | undefined {
    return this.internalRenderedElement;
  }
  
  getColourValue(): string {
    switch (this.style) {
        case "positive":
            return "success";
        case "destructive":
            return "error";
        default:
            return "primary";
    }
  }

  render() {
    const element = reactDomRender(this.renderElement());;
    this.internalRenderedElement = element;
  }

  private renderElement = (): JSX.Element => {
    return (
        <ThemeProvider theme={menuTheme}>
            <Button 
                disabled={!this.isEnabled} 
                label={this.title} 
                color={this.getColourValue()}
                onClick={() => this.execute()} 
            />
        </ThemeProvider>
    )
  };
}
