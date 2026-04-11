import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/Auth";

function ProtectedRoute({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();

  }, []);

  if (loading) {
  return (
    <div style={{ minHeight: "100vh" }}></div>
  );
}

  if (!user) {
    return <Navigate to="/loginAdmin" />;
  }

  return children;
}

export default ProtectedRoute;