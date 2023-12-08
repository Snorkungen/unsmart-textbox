import { createElement } from './lib/create-element';
import './style.css'


const textBox = document.getElementById("textbox") as HTMLElement
const informationContainer = document.getElementById("information-container") as HTMLElement;

// information container element
const icelTimeElapsed = createElement(informationContainer, "p"),
  icelKeysPressed = createElement(informationContainer, "p"),
  icelAccuracy = createElement(informationContainer, "p"),
  logEl = createElement(informationContainer, "div")

const colWidth = 60;

// const text = `export const createElement = (
// \tparent: null | HTMLElement,
// \telemName: string,
// \t...attributes: Parameters<typeof attributesHandler>[1][]
// ) => {
// \tconst element = document.createElement(elemName);

// \tattributesHandler(element, ...attributes);

// \tif (parent) {
// \t\tparent.appendChild(element);
// \t};

// \treturn element;
// };`

const texts = [
  '<body>\n\t<div id="textbox"></div>\n\t<div id="information-container"></div>\n\t<script type="module" src="/src/main.ts"></script>\n</body>',
  "# Swap two variables\ndef swap(a, b):\n\ttemp = a\n\ta = b\n\tb = temp",
  "# create directory for http-file-server program\nif  [ ! -d $PATH_TO_HTTP_FILE_SERVER ]; then \n\tmkdir $PATH_TO_HTTP_FILE_SERVER\nfi\n\nif  [ ! -d $FILES_PATH ]; then\n\tmkdir -p $FILES_PATH\nfi"
]

if (!(textBox instanceof HTMLElement)) {
  throw 0
}

textBox.style.setProperty("--col-width", colWidth.toString() + "ch")

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

const state = {
  textIdx: 0,
  row: 0,
  index: 0,
  matrix: processText(texts[0]),
  done: false,
  history: [] as { row: number, index: number, expected: string, char: string, time: number, removed?: true }[]
}

fillTextBox(textBox!, state.matrix)

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

function getPositonInText({ matrix, row, index }: typeof state): number {
  let pit = index;

  for (let i = 0; i < row; i++) {
    pit += matrix[i].length;
  }

  return pit;
}

function getStateInfo() {
  let ms = state.history[state.history.length - 1].time - state.history[0].time,
    secs = ms / 1000;

  let keyPresseses = state.history.length;

  //@ts-ignore | this uses type coercion
  const rawAccuracy = state.history.reduce((sum, val) => sum + (val.char == val.expected), 0) / keyPresseses;


  let posInText = getPositonInText(state);
  //@ts-ignore | this uses type coercion
  const realAccuracy = state.history.reduce((sum, val) => sum + (!val.removed & val.char == val.expected), 0) / posInText;

  return {
    secs, keyPresseses, rawAccuracy, realAccuracy
  }
}

function crunchState() {
  if (state.history.length <= 0) {
    return;
  }

  const { keyPresseses, rawAccuracy, realAccuracy, secs } = getStateInfo();
  icelTimeElapsed.textContent = `${secs.toFixed(2)}s`
  icelKeysPressed.textContent = `${keyPresseses} keys pressed`
  icelAccuracy.textContent =
    `Real Accuracy: ${(realAccuracy * 100).toFixed(1)}% Raw Accuracy: ${(rawAccuracy * 100).toFixed(1)}%`
}

function ignoreKey(key: string): boolean {
  if (key.length == 1) return false;

  switch (key) {
    case NEW_LINE:
    case TAB:
    case BACKSPACE:
      return false

    default: return true
  }
}

window.addEventListener("keydown", function (event) {
  const key = event.key


  if (ignoreKey(key)) {
    return;
  }

  event.stopImmediatePropagation()
  event.preventDefault()
  if (state.done) {
    console.log("Done")
    return false;
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

    el.classList.remove("item-1", "item-12", "item-2")


    if (state.history.length) {
      let lastIndex = state.history.length - 1
      while (lastIndex > 0) {
        if (state.history[lastIndex].removed) {
          lastIndex--;
          continue;
        }

        state.history[lastIndex].removed = true;
        break;
      }
    }

    setActive()

    return;
  }


  let element = row.children[state.index] as HTMLElement;

  element.classList.remove("item-active")
  if (element.dataset.char == key) {
    if (!!element.dataset.touched) {
      element.classList.add("item-12")
    } else {
      element.classList.add("item-1")
    }
  } else {
    element.classList.add("item-2")
    element.dataset.touched = "1"
  }

  state.history.push({
    row: state.row,
    index: state.index,
    char: key,
    expected: element.dataset!.char!.toString(),
    time: Date.now()
  })

  // Move Cursor IE state

  if (row.children.length - 1 > state.index) {
    state.index++
  } else {
    state.row++;
    state.index = 0;
  }

  if (textBox.children.length - 1 < state.row) {
    state.done = true;

    const { keyPresseses, rawAccuracy, realAccuracy, secs } = getStateInfo();
    let p = createElement(logEl, "p", {
      children: [`${state.textIdx}: kp=${keyPresseses}, raw=${(rawAccuracy * 100).toFixed(1)}, real:${(realAccuracy * 100).toFixed(1)}, secs=${secs}`]
    })
    // purge and redo game
    state.textIdx = (state.textIdx + 1) % texts.length;
    state.done = false;
    state.matrix = processText(texts[state.textIdx])
    state.history = [];
    state.index = 0;
    state.row = 0;

    textBox.innerHTML = ""
    fillTextBox(textBox!, state.matrix)
  }
  setActive()
  crunchState()
})

setActive()
