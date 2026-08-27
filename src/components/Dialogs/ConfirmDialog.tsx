import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { appColors } from "../../theme";
import { useEffect, useState } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  text: string;
  confirmText?: string;
  cancelText?: string;
  color?: string;
  onConfirm: () => void;
  onCancel: () => void;
  showTextfield?: boolean;
  confirmCode?: (code: string) => void;
};

export default function ConfirmDialog({
  open,
  text,
  title,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  color = appColors.red,
  onConfirm,
  onCancel,
  showTextfield,
  confirmCode,
}: ConfirmDialogProps) {
  const [textValue, setTextValue] = useState("");
  useEffect(() => {
    setTextValue("");
  }, [open]);
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      PaperProps={{
        sx: {
          width: 420,
          maxWidth: "calc(100vw - 64px)",
          backgroundColor: appColors.background,
          borderRadius: 0,
          boxShadow: 3,
          backdropFilter: "blur(20px)",
        },
      }}
    >
      <DialogTitle variant="h2" sx={{ pt: 2 }}>
        {" "}
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: 3, pb: 1.5 }}>
        <Typography variant="body1" sx={{ color: appColors.black }}>
          {text}
        </Typography>
        {showTextfield && (
          <TextField
            value={textValue}
            onChange={(event) => setTextValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                confirmCode?.(textValue);
              }
            }}
            placeholder="Hier einfügen..."
            variant="outlined"
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 0,
                backgroundColor: alpha(appColors.background, 0.72),
                color: appColors.black,
                fontFamily: '"Inter", sans-serif',
                fontSize: 14,
                fontWeight: 500,

                "& fieldset": {
                  borderColor: alpha(appColors.black, 0.28),
                },

                "&:hover fieldset": {
                  borderColor: appColors.black,
                },

                "&.Mui-focused fieldset": {
                  borderColor: appColors.black,
                  borderWidth: 2,
                },
              },

              "& .MuiInputBase-input": {
                px: 1.5,
                py: 1,
              },

              "& .MuiInputBase-input::placeholder": {
                color: alpha(appColors.black, 0.5),
                opacity: 1,
              },
            }}
          />
        )}
      </DialogContent>

      <DialogActions sx={{ display: "flex", gap: 1, p: 2.5, pt: 1 }}>
        <Button
          onClick={onCancel}
          sx={{
            backgroundColor: appColors.black,
            color: appColors.white,
            display: "flex",
            p: 2,
            "&:hover": {
              backgroundColor: appColors.black,
              color,
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={() => {
            if (showTextfield && confirmCode) {
              confirmCode(textValue);
              return;
            }
            onConfirm();
          }}
          sx={{
            backgroundColor: color,
            color: appColors.black,
            display: "flex",
            p: 2,
            "&:hover": {
              backgroundColor: color,
              color: appColors.white,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
