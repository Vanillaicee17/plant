import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Container,
  Card,
  CardContent,
  CardMedia,
  Grid,
  CircularProgress,
  Button,
  Paper,
  CardActionArea,
} from "@mui/material";
import { Clear } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText("#ffffff"),
  backgroundColor: "#ffffff",
  "&:hover": {
    backgroundColor: "#ffffff7a",
  },
}));

const useStyles = () => ({
  grow: {
    flexGrow: 1,
  },
  clearButton: {
    width: "100%",
    borderRadius: "15px",
    padding: "15px 22px",
    color: "#000000a6",
    fontSize: "20px",
    fontWeight: 900,
  },
  media: {
    height: 400,
  },
  mainContainer: {
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundSize: "cover",
    height: "93vh",
    marginTop: "8px",
  },
  imageCard: {
    margin: "auto",
    maxWidth: 400,
    height: 500,
    backgroundColor: "transparent",
    boxShadow: "0px 9px 70px 0px rgb(0 0 0 / 30%) !important",
    borderRadius: "15px",
  },
  loader: {
    color: "#be6a77",
  },
});

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendFile = async () => {
    if (image) {
      let formData = new FormData();
      formData.append("file", selectedFile);
      try {
        setIsLoading(true);
        // Updated to use FastAPI endpoint
        const res = await axios.post(
          "http://localhost:8000/api/predict",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Cleanup
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (preview) {
      sendFile();
    }
  }, [preview]);

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(acceptedFiles[0]);
    setData(undefined);
    setImage(true);
  };

  let confidence = 0;
  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [],
    },
    onDrop,
  });

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Potato Disease Classification</Typography>
          <div className={classes.grow} />
          <Avatar src="/cblogo.png" />
        </Toolbar>
      </AppBar>
      <Container
        maxWidth={false}
        className={classes.mainContainer}
        disableGutters
      >
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item xs={12}>
            <Card
              className={`${classes.imageCard} ${
                !image ? classes.imageCardEmpty : ""
              }`}
            >
              {image && (
                <CardActionArea>
                  <CardMedia className={classes.media} image={preview} />
                </CardActionArea>
              )}
              {!image && (
                <CardContent>
                  <div
                    {...getRootProps({
                      style: {
                        border: "2px dashed #cccccc",
                        borderRadius: "15px",
                        padding: "20px",
                        textAlign: "center",
                        color: "#666666",
                        cursor: "pointer",
                      },
                    })}
                  >
                    <input {...getInputProps()} />
                    <Typography variant="h6">
                      Drag and drop an image of a potato plant leaf to process,
                      or click to select one
                    </Typography>
                  </div>
                </CardContent>
              )}

              {data && (
                <CardContent>
                  <Paper>
                    <Typography variant="h6">Prediction</Typography>
                    <p>Label: {data.class}</p>
                    <p>Confidence: {confidence}%</p>
                  </Paper>
                </CardContent>
              )}
              {isLoading && (
                <CardContent>
                  <CircularProgress
                    color="secondary"
                    className={classes.loader}
                  />
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && (
            <Grid item>
              <ColorButton variant="contained" onClick={clearData}>
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
