(() => {
  // -------- Helpers --------
  const LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function winnerOfNine(cells){
    for(const [a,b,c] of LINES){
      if(cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    }
    return null;
  }
  function full(cells){ return cells.every(v => v); }

  function emptyBoards(){
    return Array.from({length:9}, () => Array(9).fill(null));
  }

  // -------- State --------
  let boards = emptyBoards();
  let winners = Array(9).fill(null);
  let turn = "X";
  let active = null; // 0..8 or null
  let score = { X: 0, O: 0, D: 0 };
  let roundResult = null; // "X" | "O" | "D" | null

  // -------- DOM --------
  const elBoard = document.getElementById("board");
  const elStatus = document.getElementById("status");
  const inpX = document.getElementById("playerX");
  const inpO = document.getElementById("playerO");
  const elScoreX = document.getElementById("scoreX");
  const elScoreO = document.getElementById("scoreO");
  const elScoreD = document.getElementById("scoreD");
  const elScoreNameX = document.getElementById("scoreNameX");
  const elScoreNameO = document.getElementById("scoreNameO");

  const nextRoundBtn = document.getElementById("nextRoundBtn");
  const resetMatchBtn = document.getElementById("resetMatchBtn");

  const roundBanner = document.getElementById("roundBanner");
  const bannerText = document.getElementById("bannerText");
  const startNextRoundBtn = document.getElementById("startNextRoundBtn");
  const bannerResetBtn = document.getElementById("bannerResetBtn");

  function nameFor(p){
    return p === "X" ? (inpX.value || "Player X") : (inpO.value || "Player O");
  }

  function bigWinner(){
    return winnerOfNine(winners);
  }

  function roundDraw(){
    return !bigWinner() && winners.every((w, i) => w || full(boards[i]));
  }

  function playableBoard(b){
    if (bigWinner() || roundDraw()) return false;
    if (active === null) return !winners[b] && !full(boards[b]);
    if (winners[active] || full(boards[active])) return !winners[b] && !full(boards[b]);
    return b === active;
  }

  function statusText(){
    const bw = bigWinner();
    if (bw) return `Winner: ${nameFor(bw)} (${bw})`;
    if (roundDraw()) return "Round ended: Draw";
    const who = `${nameFor(turn)} (${turn})`;
    if (active === null) return `Turn: ${who} — play anywhere`;
    if (winners[active] || full(boards[active])) return `Turn: ${who} — play anywhere`;
    return `Turn: ${who} — play in the highlighted board`;
  }

  function updateScoreUI(){
    elScoreX.textContent = String(score.X);
    elScoreO.textContent = String(score.O);
    elScoreD.textContent = String(score.D);
    elScoreNameX.textContent = inpX.value || "Player X";
    elScoreNameO.textContent = inpO.value || "Player O";
  }

  function checkRoundEnd(){
    if (roundResult) return;
    const bw = bigWinner();
    if (bw){
      roundResult = bw;
      score[bw] += 1;
      return;
    }
    if (roundDraw()){
      roundResult = "D";
      score.D += 1;
    }
  }

  function showBanner(){
    if (!bigWinner() && !roundDraw()){
      roundBanner.classList.add("hidden");
      return;
    }
    roundBanner.classList.remove("hidden");
    const bw = bigWinner();
    bannerText.textContent = bw ? `Round winner: ${nameFor(bw)} (${bw})` : "Round result: Draw";
  }

  // -------- Render --------
  function render(){
    // Score + status
    elStatus.textContent = statusText();
    updateScoreUI();

    // Controls always available
    // (Next Round keeps score; Reset Match clears score)
    // Render big board
    elBoard.innerHTML = "";

    for (let b = 0; b < 9; b++){
      const sb = document.createElement("div");
      sb.className = "smallBoard" + (playableBoard(b) ? " playable" : "");

      const grid = document.createElement("div");
      grid.className = "innerGrid";

      for (let c = 0; c < 9; c++){
        const btn = document.createElement("button");
        btn.className = "cell";

        // Thick inner tic-tac-toe lines
        if (c % 3 !== 2) btn.classList.add("rline");
        if (c < 6) btn.classList.add("bline");

        const playableHere = playableBoard(b) && !boards[b][c] && !bigWinner() && !roundDraw();
        if (playableHere) btn.classList.add("playable");

        btn.textContent = boards[b][c] ? boards[b][c] : "";

        btn.disabled = !playableHere;
        btn.addEventListener("click", () => {
          move(b, c);
        });

        grid.appendChild(btn);
      }

      sb.appendChild(grid);

      // Winner overlay for small board
      if (winners[b]){
        const ov = document.createElement("div");
        ov.className = "overlay";
        const mark = document.createElement("div");
        mark.className = "mark";
        mark.textContent = winners[b];
        ov.appendChild(mark);
        sb.appendChild(ov);
      } else if (full(boards[b])){
        // Small board draw pill
        const pill = document.createElement("div");
        pill.className = "drawPill";
        pill.textContent = "Draw";
        sb.appendChild(pill);
      }

      elBoard.appendChild(sb);
    }

    // Round end bookkeeping + banner
    checkRoundEnd();
    updateScoreUI();
    showBanner();
  }

  // -------- Game actions --------
  function move(b, c){
    if (!playableBoard(b)) return;
    if (boards[b][c]) return;

    boards[b][c] = turn;

    const w = winnerOfNine(boards[b]);
    if (w) winners[b] = w;

    // Next active small board is the cell index chosen
    active = c;

    // Switch player
    turn = (turn === "X") ? "O" : "X";

    render();
  }

  function nextRound(){
    boards = emptyBoards();
    winners = Array(9).fill(null);
    turn = "X";
    active = null;
    roundResult = null;
    render();
  }

  function resetMatch(){
    nextRound();
    score = { X: 0, O: 0, D: 0 };
    render();
  }

  // -------- Events --------
  inpX.addEventListener("input", () => render());
  inpO.addEventListener("input", () => render());
  nextRoundBtn.addEventListener("click", nextRound);
  resetMatchBtn.addEventListener("click", resetMatch);
  startNextRoundBtn.addEventListener("click", nextRound);
  bannerResetBtn.addEventListener("click", resetMatch);

  // First render
  render();
})();