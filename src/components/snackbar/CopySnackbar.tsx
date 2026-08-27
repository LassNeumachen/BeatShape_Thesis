import { Snackbar } from "@mui/material";
import * as React from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { appColors } from "../../theme";

type SnackbarProps = {
  open: boolean;
  handleClose: () => void;
};

export default function CopySnackbar(props: SnackbarProps) {
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={props.handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Snackbar
      open={props.open}
      autoHideDuration={4000}
      onClose={props.handleClose}
      message="Kopieren erfolgreich"
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      action={action}
      slotProps={{
        content: {
          sx: {
            backgroundColor: appColors.black,
            color: appColors.white,
            fontFamily: '"Inter", sans-serif',
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1.2,
          },
        },
      }}
    />
  );
}
