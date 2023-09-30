import { createElement } from './lib/create-element';
import './style.css'


const textBox = document.getElementById("textbox")
const colWidth = 80;

const text = `IGPAY ATINLAY SIAY NAAY NGLISHEAY ANGUAGELAY ORDWAY
 AME GAY ROAY RGOT.AAY NGLISHEAY ORDSWAY REAAYLTEREDAAY YBAY DJUSTINGAAY OSITIONSPAY FOAY NEOAY ROAY OREMAY ETTERSLAY NDAAY DDINGAAY DDITIONALAAY UFFIXES.SAY HETAY OALGAY SIAY OTAY NDEAY PUAY ITHWAY AAY ORDWAY IMILARSAY NOUGHEAY OTAY HETAY RIGINALOAY OTAY EBAY NDERSTOODUAY YBAY OMEONESAY HOWAY SIAY AMILIARFAY ITHWAY HETAY ANGUAGELAY UTBAY LSOAAY IFFERENTDAY NOUGHEAY OTNAY OTAY EBAY NDERSTOODUAY YBAY OMEONESAY LSE.EAY`

if (!(textBox instanceof HTMLElement)) {
  throw 0
}

const matrix: string[][] = []

let rowIdx = 0;
for (let i = 0; i < text.length; i++) {
  let c = text[i]

  // if prev is new line do something

  if (text[i-1] == "\n") {
    rowIdx += 1;
  }


  if (matrix[rowIdx] == undefined) {
    matrix[rowIdx] = [];
  }


  matrix[rowIdx].push(c)

  if (matrix[rowIdx].length >= colWidth) {
    rowIdx++
  }
}


// U+02936

for (let row of matrix) {
  createElement(textBox, "div", "class=row", { children: row.map(c => createElement(null, "span", "class=row-item", `content=${c}`)) })
}

const state = {
  row: 0,
  index: 0,

  done: false
}


function resolveKey(str: string) {

  switch (str) {

    case "Space": return " "
    case "Enter": return "\n"
    case "Tab": return "\t"
  }


  return str;
}


function setActive() {
  if (state.done) {
    return;
  }

  let row = textBox!.children[state.row];
  let element = row.children[state.index]

  element.classList.add("item-active")

}

window.addEventListener("keypress", function (event) {

  if (state.done) {
    console.log("Done")
    return false;
  }

  const key = resolveKey(event.key);

  if (key == "Backspace") {

  }

  let row = textBox.children[state.row];
  let element = row.children[state.index]



  element.classList.remove("item-active")
  if (element.textContent == key) {
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
  }
  setActive()

})

setActive()
