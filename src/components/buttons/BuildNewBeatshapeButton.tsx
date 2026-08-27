import { Button, Typography } from "@mui/material";
import { appColors } from "../../theme";
import AddIcon from "@mui/icons-material/Add";

type ButtonProps = {
  openDialog: () => void;
  color: string;
};

export default function BuildNewBeatshapeButton(props: ButtonProps) {
  return (
    <Button
      onClick={props.openDialog}
      sx={{
        display: "flex",
        height: "100",
        width: "100%",
        backgroundColor: props.color,
        justifyContent: "start",
        alignItems: "center",
        borderRadius: 0,
        padding: 2,
        paddingY: 1,
        boxShadow: " 0 0 14px rgba(30,30,30,0.24)",
        "&:hover": {
          backgroundColor: props.color,
          color: appColors.white,
          boxShadow: " 0 0 18px rgba(30,30,30,0.3)",
        },
        color: appColors.black,
      }}
    >
      <AddIcon
        sx={{
          fontSize: 45,
          ml: 1,
        }}
      />
      <Typography variant="h5" sx={{ padding: 1.5, paddingLeft: 3 }}>
        Neuen Takt erstellen
      </Typography>
    </Button>
  );
}
