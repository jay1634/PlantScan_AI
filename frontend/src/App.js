import React, { useState, useEffect } from "react";
import { auth } from "./components/firebase"; // Import auth from firebase.js
import { firestore } from "./components/firebase"; // Import firestore from firebase.js
import FileUpload from "./components/FileUpload";
import ResultDisplay from "./components/ResultDisplay";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logo from "./components/Logo";

const App = () => {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [isUploaded, setIsUploaded] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleResult = (data) => {
    setResult(data);
    setIsUploaded(true);
    if (user) {
      const userHistoryRef = firestore.collection("users").doc(user.uid).collection("history");
      userHistoryRef.add({
        result: data,
        timestamp: new Date(),
      });
    }
  };

  return (
    <div className="app-container">
      <Logo />
      <hr className="dividers" />
      {!user ? (
        <>
          <Login setUser={setUser} />
          <Signup setUser={setUser} />
        </>
      ) : (
        <>
          {!isUploaded && <FileUpload setResult={handleResult} user={user} />}
          {isUploaded && <ResultDisplay result={result} />}
        </>
      )}
    </div>
  );
};

export default App;