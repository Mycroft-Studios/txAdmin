import Button from "@mui/material/Button";

export default (props: any) => {
  const { label } = props;
  return (
    <Button variant="outlined" sx={
        {mt: 1.25}
    } {...props}>
        {label ? label : null}
    </Button>
  );
};