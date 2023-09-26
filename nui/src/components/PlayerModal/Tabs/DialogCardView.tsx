import React, { useState, useEffect } from "react";
import {
  Box,
  useTheme,
  styled,
  Typography,
  CircularProgress
} from "@mui/material";

import { fetchNui } from "../../../utils/fetchNui";
import { usePlayerModalResourceValue, useSetPlayerModalResource } from "../../../state/playerModal.state";
import {ProvidesHostConfigContext, AdaptiveCardUsingHostConfigContext } from "adaptivecards-react";
import * as ACData from "adaptivecards-templating";
import * as AC from "adaptivecards";
import { SubmitAction } from "../../adaptiveCards/objects/SubmitAction";
import { ExecuteAction } from "../../adaptiveCards/objects/ExecuteAction";
import { ToggleVisibilityAction } from "../../adaptiveCards/objects/ToggleVisibilityAction";
import { TextInput } from "../../adaptiveCards/objects/TextInput";
import { NumberInput } from "../../adaptiveCards/objects/NumberInput";
import { ChoiceSetInput } from "../../adaptiveCards/objects/ChoiceSetInput";
import { DateInput } from "../../adaptiveCards/objects/DateInput";
import { TimeInput } from "../../adaptiveCards/objects/TimeInput";
import { ToggleInput } from "../../adaptiveCards/objects/ToggleInput";
import { ThemeProvider, createTheme } from "@mui/material";
import rawMenuTheme from "../../../styles/theme";
import {useAssociatedPlayerValue} from "../../../state/playerDetails.state";
const menuTheme = createTheme(rawMenuTheme);

AC.GlobalRegistry.elements.register(ToggleInput.JsonTypeName,ToggleInput);
AC.GlobalRegistry.elements.register(TimeInput.JsonTypeName,TimeInput);
AC.GlobalRegistry.elements.register(DateInput.JsonTypeName,DateInput);
AC.GlobalRegistry.elements.register(ChoiceSetInput.JsonTypeName,ChoiceSetInput);
AC.GlobalRegistry.actions.register(ToggleVisibilityAction.JsonTypeName, ToggleVisibilityAction);
AC.GlobalRegistry.actions.register(ExecuteAction.JsonTypeName, ExecuteAction);
AC.GlobalRegistry.actions.register(SubmitAction.JsonTypeName, SubmitAction);
AC.GlobalRegistry.elements.register(TextInput.JsonTypeName, TextInput);
AC.GlobalRegistry.elements.register(NumberInput.JsonTypeName, NumberInput);

const TypographyDisclaimer = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: 11,
  letterSpacing: "0.02em",
  fontWeight: 200,
  position: "sticky",
  bottom: 0,
  padding: 5,
  paddingLeft: 15,
  left: 0,
}));

export type TxAdminActionRespType = "success" | "warning" | "danger";

export interface TxAdminAPIResp {
  type: TxAdminActionRespType;
  message: string;
}

const LoadingModal: React.FC = () => (
  <Box
    display="flex"
    flexGrow={1}
    width="100%"
    justifyContent="center"
    alignItems="center"
  >
    <CircularProgress />
  </Box>
);

const DialogCardView: React.FC = () => {
  const resource = usePlayerModalResourceValue();
  const [card, setCard] = useState();
  const [cardLoading, setCardLoading] = useState(false);
  const player = useAssociatedPlayerValue();
  const [refreshCounter, setRefreshCounter] = useState(0);
  var theme = useTheme();
  
  const fetchCard = async () => {
      const response = await fetchNui("getAdaptiveCard", {resource: resource, target: player.id});
      const rawCard = JSON.parse(response.card);
      const rawCardData = JSON.parse(response.data);
      var template = new ACData.Template(rawCard);
      var context: ACData.IEvaluationContext = {
        "$root": rawCardData
      } ;
      var ACard = template.expand(context);
      setCardLoading(false)
      setCard(ACard)
  }

  const onSubmit = (e: any) => {
    fetchNui("ACActionSubmit", { resource: resource, inputs: e.data, target: player.id});
    setRefreshCounter((curVal) => curVal + 1)
  };

  const onExecute = (e: any) => {
    const actionType = e.getJsonTypeName();
    const { verb } = e;

    if (actionType === "Action.Execute") {
      console.log(`executing action for ${verb}`);
      e.data.verb = verb;
      fetchNui("ACActionSubmit", { resource: resource, inputs: e.data});
      setRefreshCounter((curVal) => curVal + 1)
    }
  };
  
  useEffect(() => {
      setCardLoading(true)
      fetchCard()
  }, [refreshCounter, resource])
  
  var hostConfig = {
      fontFamily: "Roboto, Helvetica, Arial, sans-serif",
      separator: {
        lineThickness: 2,
        lineColor: theme.palette.text.secondary,
      },
      "spacing": {
        "small": 4,
        "default": 10,
        "medium": 20,
        "large": 30,
        "extraLarge": 40,
        "padding": 15
      },
      "imageSizes": {
        "small": 20,
        "medium": 40,
        "large": 80
      },
      "supportsInteractivity": true,
      "factSet": {
        "title": {
          "color": "default",
          "size": "default",
          "isSubtle": false,
          "weight": "bolder",
          "wrap": true,
          "maxWidth": 150
        },
        "value": {
          "color": "default",
          "size": "default",
          "isSubtle": false,
          "weight": "default",
          "wrap": true
        },
        "spacing": 15
      },
      containerStyles: {
        default: {
          foregroundColors: {
            default: {
              default: theme.palette.text.primary,
              subtle: theme.palette.text.secondary,
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            dark: {
              default: '#000000',
              subtle: '#66000000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            light: {
              default: '#FFFFFF',
              subtle: '#33000000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            accent: {
              default: theme.palette.warning.main,
              subtle: 'rgba(var(--color-teal), .75)',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            good: {
              default: theme.palette.success.main,
              subtle: '#DD00FF00',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            warning: {
              default: theme.palette.warning.main,
              subtle: '#DDFFD800',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            attention: {
              default: theme.palette.error.main,
              subtle: '#DDFF0000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            }
          },
          backgroundColor: theme.palette.background.default
        },
        emphasis: {
          foregroundColors: {
            default: {
              default: theme.palette.text.primary,
              subtle: theme.palette.text.secondary,
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            dark: {
              default: '#000000',
              subtle: '#66000000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            light: {
              default: '#FFFFFF',
              subtle: '#33000000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            accent: {
              default: theme.palette.warning.main,
              subtle: 'rgba(var(--color-teal), .75)',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            good: {
              default: theme.palette.success.main,
              subtle: '#DD00FF00',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            warning: {
              default: theme.palette.warning.main,
              subtle: '#DDFFD800',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            },
            attention: {
              default: theme.palette.error.main,
              subtle: '#DDFF0000',
              highlightColors: {
                default: '#22000000',
                subtle: '#11000000'
              }
            }
          },
          backgroundColor: theme.palette.background.default
        }
    }
  };


  // Handle the case when the card data is not available yet
  if (!card || cardLoading) {
    return (
      <LoadingModal />
    )
  }

  return (
    <>
      <Box>
        <ProvidesHostConfigContext hostConfig={hostConfig}>
          <AdaptiveCardUsingHostConfigContext onActionSubmit={onSubmit} onExecuteAction={onExecute} payload={card}/>  
        </ProvidesHostConfigContext>
        <TypographyDisclaimer>
        <p>Disclaimer: Card is provided by resource {resource}, <b style={{fontWeight: 900}}>not txAdmin.</b></p>
      </TypographyDisclaimer>
      </Box>
    </>
  );
};

export default DialogCardView;
