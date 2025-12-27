import { useEffect, useState, useCallback } from 'react'
import { defaultRow, defaultWords } from "../utils/defaults";

const options = {
  solo: {
    count: 1,
    rows: 6,
    wordLen: 5,
  },
  dupla: {
    count: 2,
    rows: 7,
    wordLen: 5,
  },
  quarteto: {
    count: 4,
    rows: 9,
    wordLen: 5,
  },
  grupinho: {
    count: 8,
    rows: 10,
    wordLen: 5,
  }
}

export function useGame({ type }) {
  const rows = options[type]?.rows
  const wordLen = options[type]?.wordLen || 5
  const rightWords = ['termo', 'vasco', 'termo', 'termo', 'termo', 'vasco', 'termo', 'termo']
  const LOCAL_STORAGE_KEY = 'palavrinha-game-state';

  const [selectedLetter, setSelectedLetter] = useState(0);
  const [rowActive, setRowActive] = useState(getRowActive());
  const [actualRow, setActualRow] = useState(defaultRow(wordLen));
  const [lastEffect, setLastEffect] = useState(null);
  const [countWinners, setCountWinners] = useState(0);

  function getBoardById(id) {
    const board = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (board) {
      const boardObj = JSON.parse(board);

      if (boardObj[type] && boardObj[type][id]) {
        return boardObj[type][id].board || defaultWords(rows, wordLen);
      }
    }

    return defaultWords(rows, wordLen);
  }

  function getRowActive() {
    const board = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (board) {
      const boardObj = JSON.parse(board);

      if (boardObj[type] && boardObj[type].rowActive !== undefined) {
        return boardObj[type].rowActive;
      }
    }

    return 0;
  }

  function getIsWinnerById(id) {
    const board = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (board) {
      const boardObj = JSON.parse(board);

      if (boardObj[type] && boardObj[type][id]) {
        return boardObj[type][id].winner || false;
      }
    }
    return false;
  }

  function saveBoardById(id, boardData, winner = false, rowActive = 0) {
    const board = localStorage.getItem(LOCAL_STORAGE_KEY);
    let boardObj = {};

    if (board) {
      boardObj = JSON.parse(board);

      if (boardObj[type] && boardObj[type][id]) {
        boardObj[type][id].board = boardData;
        boardObj[type][id].winner = winner;
        boardObj[type].rowActive = rowActive;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boardObj));
        return;
      } else {
        boardObj[type] = {
          ...boardObj[type],
          [id]: {
            board: boardData,
            winner
          },
          rowActive
        }
      }
    } else {
      boardObj = {
        [type]: {
          [id]: {
            board: boardData,
            winner
          },
          rowActive,
        }
      }
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boardObj));
  }

  const handleKeyUp = (event) => {
    const key = event.key

    // se é uma letra (a-z ou A-Z)
    if (key.length === 1 && /^[a-zA-Z]$/.test(key) && selectedLetter < wordLen) {
      const newWord = [...actualRow];

      newWord[selectedLetter] = key;
      const wordMapped = newWord.map((letter, idx) => ({letter, idx}));
      const wordSliced = wordMapped.slice(selectedLetter).concat(wordMapped.slice(0, selectedLetter));
      const firstEmpty = wordSliced.find(l => l.letter === "");

      if (firstEmpty) {
        setSelectedLetter(firstEmpty.idx);
      } else {
        setSelectedLetter(wordLen);
      }

      setActualRow(newWord);
      setLastEffect({ type: 'bump-cell', rowIndex: rowActive, cellIndex: selectedLetter });
      return;
    }

    // se é uma tecla especial
    switch (key) {
      case 'Escape':
       
        break;

      case 'ArrowRight':
        setSelectedLetter((prev) => (prev < wordLen - 1 ? prev + 1 : 0));
        break;

      case 'ArrowLeft':
        setSelectedLetter((prev) => (prev > 0 ? prev - 1 : wordLen - 1));
        break;

      case 'Backspace':
        const newRow = [ ...actualRow ]
        if (selectedLetter < wordLen && newRow[selectedLetter] !== "") {
          newRow[selectedLetter] = "";
        } else {
          newRow[selectedLetter - 1] = "";
          setSelectedLetter((prev) => Math.max(prev - 1, 0));
        }

        setActualRow(newRow);
        break;

      case 'Enter':
        setLastEffect({ type: 'submit-row', rowIndex: rowActive });
        break;
        
      default:
        break;
    }
  }

  const handlePointerDown = useCallback((event) => {
    const letterEl = event.target.closest(".row.active .letter");
    if (!letterEl) return;

    const value = parseInt(letterEl?.dataset.letter);
    setSelectedLetter(!isNaN(value) ? value : wordLen);
  })
  
  useEffect(() => {
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('pointerdown', handlePointerDown)

    return () => {
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [handleKeyUp])

  useEffect(() => {
    if (lastEffect && lastEffect.type === 'submit-row' && lastEffect.result === 'success') {
      const nextRowActive = rowActive < rows - 1 ? rowActive + 1 : rows;

      setSelectedLetter(0);
      setRowActive(nextRowActive);
      if (nextRowActive < rows) setActualRow(defaultRow(wordLen));
      setLastEffect(null);

      return;
    }

    if (lastEffect && lastEffect.type === 'game-over' && lastEffect.result === 'win') {
      console.log('Jogador venceu no tabuleiro', lastEffect.boardId);
      setCountWinners((prev) => prev + 1);

      return;
    }

    if (lastEffect && lastEffect.type === 'game-over' && lastEffect.result === 'lose') {
      window.alert('Fim de jogo! Você perdeu.');

      return;
    }

  }, [lastEffect])

  useEffect(() => {
    if (countWinners === (options[type]?.count || 1)) {
      window.alert('Parabéns! Você venceu o jogo!');
    }
  }, [countWinners])

  return { 
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
  }
}