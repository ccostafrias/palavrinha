import React, { useState } from "react";
import Board from "../components/Board";

import { useGame } from "../hooks/useGame";

export default function Grupo() {
  const { 
    selectedLetter,
    setSelectedLetter,
    rowActive,
    setRowActive,
    rightWords,
    rows,
    actualRow,
    lastEffect,
    setLastEffect,
    getBoardById,
    getIsWinnerById,
    saveBoardById
  } = useGame({ type: "grupinho" })

  return (
    <main className="w-full px-8 grid grid-cols-4 gap-8">
      {Array.from({ length: 8 }, (_, i) => {
        return (
          <Board
            key={`board-grupo-${i}`}
            boardId={i}
            rightWord={rightWords[i]}
            selectedLetter={selectedLetter}
            setSelectedLetter={setSelectedLetter}
            rowActive={rowActive}
            setRowActive={setRowActive}
            rows={rows}
            actualRow={actualRow}
            lastEffect={lastEffect}
            setLastEffect={setLastEffect}
            getBoardById={getBoardById}
            getIsWinnerById={getIsWinnerById}
            saveBoardById={saveBoardById}
          />
        )
      })}
    </main>
  )
}