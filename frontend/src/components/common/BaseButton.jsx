import { Button } from "@mui/material";

export const BaseButton = ({ children, ...props }) => {
  return <Button {...props}>{children}</Button>;
};
