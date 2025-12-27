import React, { useState } from "react";
import { RouterProvider, Route, createHashRouter, createRoutesFromElements, Outlet } from 'react-router-dom'
import Header from "./components/Header";
import Solo from "./pages/Solo"
import Dupla from "./pages/Dupla";
import Grupo from "./pages/Grupo";

function RootLayout() {
  return (
    <>
      <Header title="Palavrinha" />
      <Outlet />
    </>
  )
}

const router = createHashRouter(createRoutesFromElements(
  <Route path="/" element={<RootLayout/>}>
    <Route index element={<Solo />}/>
    <Route path="/dupla" element={<Dupla/>}/>
    <Route path="/grupo" element={<Grupo />}/>
  </Route>
))

export default function App() {
  return <RouterProvider router={router} />
}
  