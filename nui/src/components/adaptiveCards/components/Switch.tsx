import * as React from "react";
import {Switch, styled, FormControlLabel} from "@mui/material";

const SwitchWithLabel = (props: any) => {
  const { onChangeHandler } = props;
  const [value, setValue] = React.useState("false");
  const handleChange = (e: any) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onChangeHandler) onChangeHandler(newValue);
  };
  return (
    <FormControlLabel
      {...props}
      sx={
        {mt: 1.25}
      }
      labelPlacement="start"
      control={<Switch color="primary" value={value} onChange={handleChange} />}
    />
  );
};

export default styled(SwitchWithLabel)`
  margin-top: 10px;
`;
