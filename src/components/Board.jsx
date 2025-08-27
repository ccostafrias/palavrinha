import React, { memo, useEffect, useState, useRef } from "react";
import { motion, useAnimate } from "framer-motion";
import clsx from "clsx";

import "../styles/Board.css";

export default function Board(props) {
  const {
    rightWord,
    rows = 6,
    rowActive = 0,
    setRowActive,
    selectedLetter = 0,
    setSelectedLetter,
  } = props;

  const [words, setWords] = useState(
    Array.from({ length: rows }).map((_, i) => ({
      type: i == 0 ? "activeRow" : "default",
      word: Array.from({ length: rightWord.length }).map(() => ""),
    }))
  );

  const lastTyped = useRef(null);
  const wordSize = rightWord.length;

  const handleKeyPress = (event) => {
    if (rowActive < 0) return;
    lastTyped.current = event.key;

    if (
      event.key.length === 1 &&
      /^[a-zA-Z]$/.test(event.key) &&
      selectedLetter < wordSize
    ) {
      const newWords = [...words];
      const newRow = { ...newWords[rowActive] };
      const newWord = [...newRow.word];

      newWord[selectedLetter] = event.key;
      const isWordFull = newWord.every((l) => l !== "");
      if (isWordFull) {
        setSelectedLetter(wordSize);
      } else {
        let i = selectedLetter;
        while (true) {
          if (newWord[i] === "") {
            setSelectedLetter(i);
            break;
          }
          i = (i + 1) % wordSize;
        }
      }

      newRow.word = newWord;
      newWords[rowActive] = newRow;

      setWords(newWords);
    } else if (event.key === "ArrowRight") {
      setSelectedLetter((prev) => (prev < rightWord.length - 1 ? prev + 1 : 0));
    } else if (event.key === "ArrowLeft") {
      setSelectedLetter((prev) => (prev > 0 ? prev - 1 : rightWord.length - 1));
    } else if (event.key === "Backspace") {
      const newWords = [...words];
      const newRow = { ...newWords[rowActive] };
      const newWord = [...newRow.word];

      if (selectedLetter < wordSize && newWord[selectedLetter] !== "") {
        newWord[selectedLetter] = "";
      } else {
        newWord[selectedLetter - 1] = "";
        setSelectedLetter((prev) => Math.max(prev - 1, 0));
      }

      newRow.word = newWord;
      newWords[rowActive] = newRow;

      setWords(newWords);
    } else if (event.key === "Enter") {
      const currentWord = words[rowActive].word.join("");
      if (!currentWord) {
        console.log("No word");
        shake(rowActive);
      } else if (currentWord.length < wordSize) {
        shake(rowActive);
        console.log("Word too short");
      } else {
        setWords((prevWords) =>
          prevWords.map((row, rowIndex) => {
            if (rowIndex === rowActive) {
              return { ...row, revealed: true };
            }
            return row;
          })
        );
        turn(rowActive);
        // setRowActive((prev) => (prev < rows - 1 ? prev + 1 : -1));
      }
    }
  };

  const handleCellPointerDown = (event) => {
    const letterEl = event.target.closest(".letter");
    const value = parseInt(letterEl?.dataset.letter);
    setSelectedLetter(!isNaN(value) ? value : wordSize);
  };

  useEffect(() => {
    const handleKeyUp = (event) => {
      handleKeyPress(event);
    };

    window.addEventListener("keyup", handleKeyUp);

    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [words, selectedLetter]);

  useEffect(() => {
    const select = () => {
      if (selectedLetter < wordSize) {
        animate(
          `#row-${rowActive} .letter[data-letter="${selectedLetter}"] .front`,
          { borderBottomWidth: "8px" },
          { duration: 0.2 }
        );
      }
      animate(
        `#row-${rowActive} .letter:not([data-letter="${selectedLetter}"]) .front`,
        { borderBottomWidth: "4px" },
        { duration: 0.2 }
      );
    };
    select();
  }, [selectedLetter]);

  async function shake(id) {
    await animate(
      `#row-${id}`,
      { x: [0, -10, 10, -10, 10, 0] },
      { duration: 0.5, ease: "easeInOut" }
    );
  }

  async function turn(row, index) {
    const actualRow = words[row];

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

    const nextRowActive = (row < rows - 1 ? row + 1 : rows-1);

    setRowActive(nextRowActive);
    setSelectedLetter(0);
    setWords((prevWords) =>
      prevWords.map((row, rowIndex) => {
        if (rowIndex === nextRowActive) {
          return { ...row, type: "activeRow" };
        } else if (rowIndex === actualRow) {
          return { ...row, type: "turned" };
        }
        return row;
      })
    );
  }

  const [scope, animate] = useAnimate();

  return (
    <div
      className="board flex flex-col gap-2 w-9/10 max-w-[350px]"
      onPointerDown={handleCellPointerDown}
      ref={scope}
    >
      {words.map((w, i) => (
        <div
          key={i}
          id={`row-${i}`}
          className="grid gap-2 row"
          style={{ gridTemplateColumns: `repeat(${wordSize}, minmax(0, 1fr))` }}
        >
          {w.word.map((letter, j) => (
            <Cell
              key={j}
              index={j}
              letter={letter}
              active={rowActive == i && j === selectedLetter}
              type={w.type}
              revealed={w.revealed}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const Cell = memo(({ letter, type, index }) => {
  const classes = clsx(
    "front",
    type == "default" && "bg-(--c3)",
    type == "activeRow" && "border-4 border-(--c2) cursor-pointer"
  );

  return (
    <>
      <div
        className="letter transform-3d perspective-near aspect-square"
        data-letter={index}
      >
        <motion.div className="flip transform-3d rotate-y-0 w-full h-full">
          <motion.div className={classes}>
            {letter && (
              <motion.span
                initial={{
                  opacity: 0,
                  y: -20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{ duration: 0.2 }}
              >
                {letter}
              </motion.span>
            )}
          </motion.div>
          {type !== "default" && (
            <div className="back rotate-y-180">{letter}</div>
          )}
        </motion.div>
      </div>
    </>
  );
});
