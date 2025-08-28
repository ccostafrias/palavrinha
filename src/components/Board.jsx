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

  const [scope, animate] = useAnimate();
  const isAnimating = useRef(false);
  const [words, setWords] = useState(
    Array.from({ length: rows }).map((_, i) => ({
      type: i == 0 ? "activeRow" : "default",
      word: Array.from({ length: rightWord.length }).map(() => ""),
    }))
  );

  const wordSize = rightWord.length;

  const handleKeyPress = (event) => {
    if (rowActive < 0 || isAnimating.current) return;

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

      animateBumpCell(selectedLetter);
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
        animateShake(rowActive);
      } else if (currentWord.length < wordSize) {
        animateShake(rowActive);
      } else {
        const currentWord = [...words[rowActive].word];

        const wordLetter = {};
        for (let i in rightWord) {
          const l = rightWord[i];
          if (!wordLetter[l]) {
            wordLetter[l] = {
              count: 1,
            };
          } else {
            wordLetter[l].count++;
          }
        }

        const status = currentWord.map((l, i) => {
          if (l === rightWord[i]) {
            wordLetter[l].count--;
            return "correct";
          }
          if (rightWord.includes(l) && wordLetter[l].count > 0) {
            wordLetter[l].count--;
            return "present";
          }
          return "absent";
        });

        setWords((prevWords) =>
          prevWords.map((row, rowIndex) => {
            if (rowIndex === rowActive) {
              return { ...row, isRevealed: true, status };
            }
            return row;
          })
        );
        setSelectedLetter(wordSize);
      }
    }
  };

  const handleCellPointerDown = (event) => {
    const letterEl = event.target.closest(".row.active .letter");
    if (!letterEl) return;

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
    if (words[rowActive].isRevealed && !isAnimating.current) {
      animateTurn(rowActive);
    }
  }, [words]);

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

    const nextRowActive = row < rows - 1 ? row + 1 : rows - 1;
    isAnimating.current = false;

    console.log(actualRow);
    if (actualRow.status.every((s) => s === "correct")) {
      // Se a palavra foi adivinhada corretamente, faz algo
      console.log("Parabéns! Você adivinhou a palavra!");
      animateWin(rowActive);
    } else {
      setSelectedLetter(0);
      setWords((prevWords) =>
        prevWords.map((r, rowIndex) => {
          if (rowIndex === nextRowActive) {
            return { ...r, type: "activeRow" };
          }
          return r;
        })
      );
      setRowActive(nextRowActive);
    }
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
      onPointerDown={handleCellPointerDown}
      ref={scope}
    >
      {words.map((w, i) => (
        <div
          key={i}
          id={`row-${i}`}
          className={`grid gap-2 row ${i == rowActive ? "active" : ""}`}
          style={{ gridTemplateColumns: `repeat(${wordSize}, minmax(0, 1fr))` }}
        >
          {w.word.map((letter, j) => (
            <Cell
              key={j}
              index={j}
              letter={letter}
              active={rowActive == i && j === selectedLetter}
              type={w.type}
              status={w.status && w.status[j]}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const Cell = memo(({ letter, index, type, status, active }) => {
  const clxFront = clsx(
    "front transition-[background] ease-in duration-500",
    type == "default" && "bg-(--c3) border-(--c3)",
    type == "activeRow" && "bg-[#00000000] border-(--c2) cursor-pointer"
  );

  const clxBack = clsx(
    "back rotate-y-180",
    status == "correct" && "bg-(--cRight)",
    status == "present" && "bg-(--cPlace)",
    status == "absent" && "bg-(--cWrong)"
  );

  return (
    <>
      <div
        className="letter transform-3d perspective-near aspect-square"
        data-letter={index}
      >
        <motion.div className="flip transform-3d rotate-y-0 w-full h-full">
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
