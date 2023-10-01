import { createElement } from './lib/create-element';
import './style.css'


const textBox = document.getElementById("textbox") as HTMLElement
const colWidth = 80;

const text = `export const createElement = (
\tparent: null | HTMLElement,
\telemName: string,
\t...attributes: Parameters<typeof attributesHandler>[1][]
) => {
\tconst element = document.createElement(elemName);

\tattributesHandler(element, ...attributes);

\tif (parent) {
\t\tparent.appendChild(element);
\t};

\treturn element;
};`


if (!(textBox instanceof HTMLElement)) {
  throw 0
}

const NEW_LINE = "Enter"
const TAB = "Tab"
const BACKSPACE = "Backspace"

function processText(text: string) {
  let matrix: string[][] = [];
  let rowIdx = 0;

  for (let i = 0; i < text.length; i++) {
    let char = text[i]

    switch (char) {
      case "\n": char = NEW_LINE; break
      case "\t": char = TAB; break
    }

    if (matrix[rowIdx] == undefined) {
      matrix[rowIdx] = [];
    }

    matrix[rowIdx].push(char)


    if (
      char == NEW_LINE
      || matrix[rowIdx].length >= colWidth
    ) {
      rowIdx++
    }

  }

  return matrix
}

function fillTextBox(textBox: HTMLElement, matrix: string[][]): boolean {

  let displayChar = (char: string) => {

    switch (char) {
      case NEW_LINE: return "&#10550;"
      case TAB: return "&nbsp;&lrarr;&nbsp;"
    }
    return char;
  }

  for (let row of matrix) {
    createElement(textBox, "div", "class=row", {
      children: row.map(char => createElement(null, "span", "class=row-item", {
        children: displayChar(char),
        attributes: {
          "data-char": char
        }

      }))
    })
  }

  return true;
}

fillTextBox(textBox!, processText(text))

const state = {
  row: 0,
  index: 0,

  done: false,
  history: [] as { row: number, index: number, expected: string, char: string, time: number }[]
}

function getActiveChar(): HTMLElement | undefined {
  if (state.done) {
    return;
  }

  let row = textBox!.children[state.row];
  let element = row.children[state.index];

  return element as HTMLElement;
}

function setActive() {
  let element = getActiveChar()

  if (!element) return;

  element.classList.add("item-active")

}

window.addEventListener("keydown", function (event) {
  event.stopImmediatePropagation()
  event.preventDefault()
  if (state.done) {
    console.log("Done")
    return false;
  }

  const key = event.key

  // ignore if special char
  if (key.length > 1 && ![NEW_LINE, TAB, BACKSPACE].includes(key)) {
    return;
  }

  getActiveChar()!.classList.remove("item-active")

  let row = textBox.children[state.row];

  if (key == BACKSPACE) {
    // move state back

    if (state.row == 0 && state.index == 0) return;

    if (state.index > 0) {
      state.index--;
    } else {
      state.row--;
      state.index = textBox.children[state.row].children.length - 1
    }

    let el = getActiveChar()!

    el.classList.remove("item-1", "item-2")

    setActive()

    return;
  }


  let element = row.children[state.index] as HTMLElement;

  state.history.push({
    row: state.row,
    index: state.index,
    char: key,
    expected: element.dataset!.char!.toString() ,
    time: Date.now()
  })

  element.classList.remove("item-active")
  if (element.dataset.char == key) {
    element.classList.add("item-1")
  } else {
    element.classList.add("item-2")
  }
  // Move Cursor IE state

  if (row.children.length - 1 > state.index) {
    state.index++
  } else {
    state.row++;
    state.index = 0;
  }

  if (textBox.children.length - 1 < state.row) {
    state.done = true;

    console.log(state)
  }
  setActive()

})

setActive()
