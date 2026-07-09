import { Container } from "@mui/material";

export const PageContainer = ({ children }) => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {children}
    </Container>
  );
};
