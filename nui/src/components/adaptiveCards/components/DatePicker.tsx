import * as React from "react";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default (props: any) => {
  const { onChangeHandler } = props;
  const [value, setValue] = React.useState(null);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onChangeHandler) onChangeHandler(newValue); // Pass state info to implementer
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        {...props}
        sx={
            {mt: 1.25}
        }
        value={value}
        onChange={handleChange}
        renderInput={(params: any) => <TextField size="small" {...params} />}
      />
    </LocalizationProvider>
  );
};
