import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./Login";
import Browse from "./Browse";

const Body = () => {
  const appRouter = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/browse", element: <Browse /> },
  ]);

  // The auth listener (onAuthStateChanged) now lives in Header.js,
  // because Header is rendered inside the router and can use navigate().
  return <RouterProvider router={appRouter} />;
};

export default Body;