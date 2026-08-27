import { Box, Button, IconButton, Snackbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { memo, type Dispatch, type SetStateAction } from "react";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { appColors } from "../../../theme";
import UploadIcon from "@mui/icons-material/Upload";
import LinkIcon from "@mui/icons-material/Link";

type ImportExportPanelProps = {
  importExportPanelOpen: boolean;
  setImportExportPanelOpen: Dispatch<SetStateAction<boolean>>;
  onExportCode: () => void;
  onImportCode: () => void;
  onExportLink: () => void;
};

function ImportExportPanelComponent({
  importExportPanelOpen,
  setImportExportPanelOpen,
  onExportCode,
  onImportCode,
  onExportLink,
}: ImportExportPanelProps) {
  const open: boolean = true;

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        marginTop: "auto",
        pointerEvents: "none",
      }}
    >
      <Box
        onMouseDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
        sx={{
          pointerEvents: importExportPanelOpen ? "auto" : "none",
          position: "relative",
          width: importExportPanelOpen ? "100%" : 45,
          height: importExportPanelOpen ? 230 : 45,
          minHeight: 45,
          marginLeft: "auto",
          overflow: "hidden",
          boxSizing: "border-box",
          p: importExportPanelOpen ? 3 : 0,
          backgroundColor: alpha(appColors.background, 0.5),
          boxShadow: 3,
          backdropFilter: "blur(8px)",
          transition: "width 180ms ease, height 180ms ease",
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Box sx={{ mt: -1.7, ml: -1.2 }}>
            <Typography variant="h2">Beat Import / Export</Typography>
          </Box>

          <IconButton
            onClick={() => setImportExportPanelOpen((prev) => !prev)}
            sx={{
              pointerEvents: "auto",
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 45,
              height: 45,
              borderRadius: 0,
              backgroundColor: importExportPanelOpen
                ? alpha(appColors.background, 0.1)
                : appColors.black,
              color: importExportPanelOpen ? appColors.black : appColors.white,
              "&:hover": {
                backgroundColor: appColors.black,
                color: appColors.white,
              },
            }}
          >
            {importExportPanelOpen ? (
              <ArrowForwardIosIcon sx={{ fontSize: 25 }} />
            ) : (
              <FileDownloadIcon sx={{ fontSize: 25 }} />
            )}
          </IconButton>
        </Box>

        {importExportPanelOpen && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  onClick={onExportCode}
                  startIcon={<UploadIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    color: appColors.black,
                    backgroundColor: alpha(appColors.black, 0.08),
                  }}
                >
                  Exportcode kopieren
                </Button>
                <Button
                  onClick={onImportCode}
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    color: appColors.black,
                    backgroundColor: alpha(appColors.black, 0.08),
                  }}
                >
                  Importieren
                </Button>
                <Button
                  onClick={onExportLink}
                  startIcon={<LinkIcon />}
                  sx={{
                    justifyContent: "flex-start",
                    color: appColors.black,
                    backgroundColor: alpha(appColors.black, 0.08),
                  }}
                >
                  Link kopieren
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default memo(ImportExportPanelComponent);
