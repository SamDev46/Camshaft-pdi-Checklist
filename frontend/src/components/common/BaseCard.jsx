import { Card, CardContent } from "@mui/material";

export const BaseCard = ({ children, ...props }) => {
  return (
    <Card {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
