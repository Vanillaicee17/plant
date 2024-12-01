import { useState } from "react";
import { ImageUpload } from "./home";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <ImageUpload />
    </>
  );
}

export default App;
