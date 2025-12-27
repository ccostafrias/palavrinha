import React, { memo, useEffect, useState, useRef, useLayoutEffect } from "react";
import { motion, useAnimate } from "framer-motion";
import { areArraysEqual } from "../utils/compareArrays";
import clsx from "clsx";

export default function Board(props) {
  const {
    boardId,
    rightWord,
    rows,
    rowActive = 0,
    selectedLetter = 0,
    actualRow,
    lastEffect,
    setLastEffect,
    getBoardById,
    getIsWinnerById,
    saveBoardById
  } = props;

  const [words, setWords] = useState(getBoardById(boardId));
  const [isFinished, setIsFinished] = useState(getIsWinnerById(boardId));

  const [scope, animate] = useAnimate();
  const isAnimating = useRef(false);

  const wordSize = rightWord.length;

  function onSubmitRow() {
    const currentWord = words[rowActive].word.join("");

    // se a palavra atual está vazia
    if (!currentWord || currentWord.length < wordSize) {
      animateShake(rowActive);
      return
    }

    // Normaliza para evitar problemas de comparação por caixa
    const target = rightWord.toLowerCase();
    const currentWordArr = words[rowActive].word.map((ch) => ch.toLowerCase());

    // Contagem de letras da palavra alvo
    const letterCounts = target.split("").reduce((obj, key) => {
      obj[key] = (obj[key] || 0) + 1;
      return obj;
    }, {});

    const status = Array(wordSize).fill("absent");

    status.map((_, i) => {
      if (currentWordArr[i] === target[i]) {
        status[i] = "correct";
        letterCounts[currentWordArr[i]]--;
      }
    })

    status.map((_, i) => {
      if (status[i] === "correct") return;

      if (target.includes(currentWordArr[i]) && letterCounts[currentWordArr[i]] > 0) {
        status[i] = "present";
        letterCounts[currentWordArr[i]]--;
      }
    })

    setWords((prevWords) => {
      const newWords = [...prevWords];
      newWords[rowActive] = {
        ...newWords[rowActive],
        isRevealed: true,
        status,
      };
      return newWords;
    })
  }

  useLayoutEffect(() => {
    if (isAnimating.current || isFinished) return;

    if (rowActive >= rows) {
      setIsFinished(true);
      setLastEffect({ type: 'game-over', result: 'lose', boardId, boardData: words });
    }
  }, [rowActive])

  useLayoutEffect(() => {
    if (isAnimating.current) return;
    if (isFinished) return;

    const row = rowActive;
    const r = words[row];
    if (!r || !r.isRevealed || r.type !== "activeRow") return;

    let cancelled = false;

    (async () => {
      await animateTurn(row);
      if (cancelled) return;
      
      const nextRowActive = row < rows - 1 ? row + 1 : rows;
      const didWin = r.status?.every((s) => s === "correct");

      if (didWin) {
        await animateWin(row);

        const newWords = [...words];
        newWords[row] = { ...newWords[row], type: "showed" };

        setIsFinished(true);
        saveBoardById(boardId, newWords, true, nextRowActive);
        setLastEffect({ type: 'game-over', result: 'win', boardId, boardData: newWords });
        
        return;
      } else {
        const newWords = [...words];
        newWords[row] = { ...newWords[row], type: "showed" };
        if (nextRowActive < rows) newWords[nextRowActive] = { ...newWords[nextRowActive], type: "activeRow" };

        saveBoardById(boardId, newWords, false, nextRowActive);
        setLastEffect(prev => ({...prev, result: 'success', boardId, boardData: newWords }) );
        setWords(newWords);
      }
    })()

    return () => { cancelled = true }
  }, [words, rowActive])

  useEffect(() => {
    if (isAnimating.current || rowActive >= rows) return;
    if (isFinished) return;
    if (areArraysEqual(words[rowActive].word, actualRow)) return;

    setWords((prevWords) => {
      const newWords = [...prevWords];
      newWords[rowActive] = {
        ...newWords[rowActive],
        word: actualRow,
      };

      return newWords
    })
  }, [actualRow]);

  useEffect(() => {
    if (!lastEffect || isAnimating.current ) return;
    if (isFinished) return;

    if (lastEffect.type === 'bump-cell' && lastEffect.rowIndex === rowActive) {
      animateBumpCell(lastEffect.cellIndex);
      return;
    }
    if (lastEffect.type === 'shake-row' && lastEffect.rowIndex === rowActive) {
      animateShake(rowActive);
      return;
    }

    if (lastEffect.type === 'submit-row' && lastEffect.rowIndex === rowActive) {
      onSubmitRow();
    }
  }, [lastEffect, rowActive]);

  async function animateShake(id) {
    await animate(
      `#row-${id}`,
      { x: [0, -10, 10, -10, 10, 0] },
      { duration: 0.5, ease: "easeInOut" }
    );
  }

  async function animateBumpCell(index) {
    await animate(
      `#row-${rowActive} .letter[data-letter="${index}"]`,
      { scale: [1, 1.1, 1] },
      { duration: 0.2, ease: "easeOut" }
    );
  }

  async function animateTurn(row) {
    const actualRow = words[row];
    isAnimating.current = true;

    const promises = actualRow.word.map((_, l) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          await animate(
            `#row-${row} .letter[data-letter="${l}"] .flip`,
            { rotateY: [0, 180] },
            { duration: 1, ease: "easeInOut" }
          );
          resolve();
        }, l * 300);
      });
    });

    // espera todos terminarem
    await Promise.all(promises);
    isAnimating.current = false;
  }

  async function animateWin(row) {
    const actualRow = words[row];
    isAnimating.current = true;

    const promises = actualRow.word.map((_, l) => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          await animate(
            `#row-${row} .letter[data-letter="${l}"]`,
            { y: [0, -20, 0] },
            { duration: 0.5, ease: "easeInOut" }
          );
          resolve();
        }, l * 100);
      });
    });

    // espera todos terminarem
    await Promise.all(promises);

    isAnimating.current = false;
  }

  return (
    <div
      className="board flex flex-col gap-2 w-9/10 max-w-[350px]"
      ref={scope}
      aria-disabled={isFinished}
      data-finished={isFinished ? 'true' : 'false'}
    >
      {words.map((w, i) => (
        <div
          key={i}
          id={`row-${i}`}
          className={`grid gap-2 row ${i == rowActive ? "active" : ""}`}
          style={{ gridTemplateColumns: `repeat(${wordSize}, auto)` }}
        >
          {w.word.map((letter, j) => (
            <Cell
              key={j}
              index={j}
              letter={letter}
              active={rowActive == i && j === selectedLetter}
              isRevealed={w.isRevealed}
              type={w.type}
              status={w.status && w.status[j]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const Cell = memo(({ letter, index, type, status, active, isRevealed }) => {
  const defaultStyle = "backface-hidden flex items-center justify-center text-2xl font-bold capitalize text-center absolute top-0 left-0 w-full h-full p-2 rounded"

  const clxFlip = clsx(
    "flip transform-3d rotate-y-0 w-full h-full",
    type === "showed" && "rotate-y-180",
    // (type === "activeRow" && isRevealed) && "rotate-y-180", 
  );

  const clxFront = clsx(
    "front transition-[background] ease-in duration-500",
    defaultStyle,
    type == "default" && "bg-surface-2 border-surface-2",
    type == "activeRow" && "border-surface-1 cursor-pointer"
  );

  const clxBack = clsx(
    "back rotate-y-180",
    defaultStyle,
    status == "correct" && "bg-accent-correct",
    status == "present" && "bg-accent-present",
    status == "absent" && "bg-absent-bg"
  );

  return (
    <>
      <div
        className="letter transform-3d perspective-near aspect-square"
        data-letter={index}
      >
        <motion.div 
          className={clxFlip}
        >
          <motion.div
            className={clxFront}
            initial={{ borderWidth: 0 }}
            animate={{ borderWidth: type == "activeRow" ? 4 : 0 , borderBottomWidth: active ? 8 : 4 }}
          >
            {letter && (
              <motion.span
                initial={{
                  opacity: 0,
                  // y: -20,
                }}
                animate={{
                  opacity: 1,
                  // y: 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {letter}
              </motion.span>
            )}
          </motion.div>
          {type !== "default" && <div className={clxBack}>{letter}</div>}
        </motion.div>
      </div>
    </>
  );
});
