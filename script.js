// ---------- THREADS PER INCH ----------
function threadsPerInch(yarn) {
  if (yarn == 10) return 42;
  if (yarn == 14) return 48;
  if (yarn == 26) return 60;
  if (yarn == 32) return 64;
  if (yarn == 40) return 74;
  if (yarn == 60) return 80;
  if (yarn == 84) return 96;
  return 0;
}

function toInches(v, unit) {
  return unit === "cm" ? v / 2.54 : v;
}

// ---------- PREFILL ----------
function prefillByCount() {
  const yarn = Number(document.getElementById("yarnCount").value);
  const hankInput = document.getElementById("hankLength");
  const fabricInput = document.getElementById("fabricLength");

  // default fabric length
  if (!fabricInput.value) fabricInput.value = 29;

  if (yarn == 10) hankInput.value = 2900;
  else if (yarn == 14) hankInput.value = 2950;
  else if (yarn == 26) hankInput.value = 3000;
  else if (yarn == 32) hankInput.value = 3000;
  else if (yarn == 40) hankInput.value = 3000;
  else if (yarn == 60) hankInput.value = 3100;
  else if (yarn == 84) hankInput.value = 3200;
}

// ---------- GLOBAL ----------
let blockCount = 0;

// ---------- BLOCK ----------
function addNewBlock(afterBlock = null, cloneFrom = null) {
  blockCount++;

  const block = document.createElement("div");
  block.className = "block";

  block.innerHTML = `
    <div class="block-title">Block ${blockCount}</div>
    <div class="rows"></div>
    <div class="block-actions">
      <button onclick="addRow(this)">Add Row</button>
      <button onclick="copyBlockBelow(this)">Copy Below</button>
      <button onclick="copyBlockToEnd(this)">Copy to End</button>
    </div>
  `;

  if (afterBlock) afterBlock.after(block);
  else document.getElementById("blocks").appendChild(block);

  if (cloneFrom) {
    cloneFrom.querySelectorAll(".row").forEach(r => {
      addRowToBlock(
        block,
        r.querySelector(".color").value,
        r.querySelector(".width").value
      );
    });
  } else {
    for (let i = 0; i < 3; i++) addRowToBlock(block);
  }
}

// ---------- ROW ----------
function addRow(btn) {
  const block = btn.closest(".block");
  addRowToBlock(block);
}

function addRowToBlock(block, color = "", width = "") {
  const row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `
    <input class="color" placeholder="Colour name" value="${color}">
    <input class="width" type="number" placeholder="Width" value="${width}">
  `;

  block.querySelector(".rows").appendChild(row);
}

// ---------- COPY ----------
function copyBlockBelow(btn) {
  const block = btn.closest(".block");
  addNewBlock(block, block);
}

function copyBlockToEnd(btn) {
  const block = btn.closest(".block");
  addNewBlock(null, block);
}

// ---------- INIT ----------
addNewBlock();

// ---------- CALCULATION ----------
function calculate() {
  const yarn = Number(document.getElementById("yarnCount").value);
  const fabricLength = Number(document.getElementById("fabricLength").value);
  const hankLength = Number(document.getElementById("hankLength").value);
  const wastage = Number(document.getElementById("wastage").value) || 0;
  const repeat = Number(document.getElementById("designRepeat").value) || 1;
  const unit = document.getElementById("globalUnit").value;

  const tpi = threadsPerInch(yarn);
  if (!tpi || !fabricLength || !hankLength) {
    alert("Fill all required fields");
    return;
  }

  let baseThreads = 0;
  let dyeTotals = {};
  let seq = 1;

  let weaverHTML = `
    <table>
      <tr><th>Seq</th><th>Colour</th><th>Threads</th></tr>
  `;

  document.querySelectorAll(".row").forEach(r => {
    const c = r.querySelector(".color").value;
    const w = r.querySelector(".width").value;
    if (!c || !w) return;

    const threads = toInches(Number(w), unit) * tpi;
    baseThreads += threads;
    dyeTotals[c] = (dyeTotals[c] || 0) + threads;

    weaverHTML += `
      <tr>
        <td>${seq++}</td>
        <td>${c}</td>
        <td>${threads.toFixed(0)}</td>
      </tr>
    `;
  });

  weaverHTML += `
    <tfoot>
      <tr><td colspan="2">Base Total</td><td>${baseThreads.toFixed(0)}</td></tr>
      <tr><td colspan="2">After Repeat × ${repeat}</td><td>${(baseThreads * repeat).toFixed(0)}</td></tr>
    </tfoot>
    </table>
  `;

  document.getElementById("weaverTable").innerHTML = weaverHTML;

  let dyeHTML = `
    <table>
      <tr><th>Colour</th><th>Total Threads</th><th>Hanks</th></tr>
  `;

  let totalThreads = 0;
  let totalHanks = 0;

  for (const c in dyeTotals) {
    const threads = dyeTotals[c] * repeat;
    const yarnLen = threads * fabricLength;
    const yarnWaste = yarnLen + (yarnLen * wastage / 100);
    const hanks = yarnWaste / hankLength;

    totalThreads += threads;
    totalHanks += hanks;

    dyeHTML += `
      <tr>
        <td>${c}</td>
        <td>${threads.toFixed(0)}</td>
        <td>${hanks.toFixed(2)}</td>
      </tr>
    `;
  }

  dyeHTML += `
    <tfoot>
      <tr><td>TOTAL</td><td>${totalThreads.toFixed(0)}</td><td>${totalHanks.toFixed(2)}</td></tr>
    </tfoot>
    </table>
  `;

  document.getElementById("dyeTable").innerHTML = dyeHTML;
}

// ---------- PDF ----------
function printPDF() {
  window.print();
}
