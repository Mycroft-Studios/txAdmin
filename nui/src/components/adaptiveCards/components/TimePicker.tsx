import * as React from "react";
import { DesktopTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

export default (props: any) => {
  const { onChangeHandler } = props;
  const [value, setValue] = React.useState(null);

  const handleChange = (newValue: any) => {
    setValue(newValue);
    if (onChangeHandler) onChangeHandler(newValue); // Pass state info to implementer
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DesktopTimePicker
        {...props}
        sx={
            {mt: 1.25}
        }
        value={value}
        onChange={handleChange}
      />
    </LocalizationProvider>
  );
};
