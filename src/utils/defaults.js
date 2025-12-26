export function defaultRow(wordLen) {
  return Array.from({ length: wordLen }).map(() => "")
}

export function defaultWords(rows, wordLen) {
  return Array.from({ length: rows }).map((_, i) => ({
    type: i == 0 ? "activeRow" : "default",
    word: Array.from({ length: wordLen }).map(() => ""),
  }))
}