import React, { useState } from "react";
import Board from "../components/Board";

import { useGame } from "../hooks/useGame";

export default function Solo() {
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
  } = useGame({ type: "solo" })

  return (
    <main className="w-full px-8 flex items-center justify-center gap-8">
      <Board
        boardId={0}
        rightWord={rightWords[0]}
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
    </main>
  )
}