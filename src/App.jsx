import React, { useState } from "react";
import Board from "./components/Board";

export default function App() {
  const [selectedLetter, setSelectedLetter] = useState(0);
  const [rowActive, setRowActive] = useState(0);

  return (
    <>
      <header className="w-full py-12 text-center text-5xl font-bold">
        <h1>Palavrinha</h1>
      </header>
      <main className="w-full px-8 flex items-center justify-center gap-8">
        <Board
          rightWord="termo"
          selectedLetter={selectedLetter}
          setSelectedLetter={setSelectedLetter}
          rowActive={rowActive}
          setRowActive={setRowActive}
        />
        {/* <Board
          rightWord="termo"
          selectedLetter={selectedLetter}
          setSelectedLetter={setSelectedLetter}
          rowActive={rowActive}
          setRowActive={setRowActive}
        /> */}
      </main>
    </>
  );
}
