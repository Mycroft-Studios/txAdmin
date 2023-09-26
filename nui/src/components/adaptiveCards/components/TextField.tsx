import * as React from "react";
import {styled, TextField} from "@mui/material";

export const ACTextField = (props: any) => {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState("");
  const { size = "small", color = "primary", variant = "outlined", onChangeHandler } = props;

  const handleChange = (event: any) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (onChangeHandler) {
      const anyError = onChangeHandler(newValue); // Pass state info to implementer, take any error
      setError(anyError);
      setHelperText(anyError ? "Field is required" : "");
    }
  };
  return (
        <TextField
        autoFocus
        fullWidth 
        type="text"
        color="primary"
        size={size}
        variant={variant}
        sx={
            {mt: 1.25}
        }
        value={value}
        error={error}
        helperText={helperText}
        onChange={handleChange}
        onBlur={handleChange}
        {...props}
    />
  );
};

export default ACTextField;