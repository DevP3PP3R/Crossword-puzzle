function initializePuzzle(grid, answers, secretSequence = null) {
  const puzzle = document.getElementById('puzzle');
  const answerButtons = document.getElementById('answerButtons');
  const horizontalBtn = document.getElementById('horizontalBtn');
  const verticalBtn = document.getElementById('verticalBtn');
  const secretModal = document.getElementById('secretModal');

  let currentCell = null;
  let userSecretSequence = [];

  function checkSecretSequence() {
    if (secretSequence && userSecretSequence.length === secretSequence.length) {
      if (JSON.stringify(userSecretSequence) === JSON.stringify(secretSequence)) {
        showSecretModal();
      }
      userSecretSequence = [];
    }
  }

  function showSecretModal() {
    if (!secretModal) return;
    
    secretModal.style.display = 'flex';
    setTimeout(() => secretModal.classList.add('show'), 10);

    // 컨페티 애니메이션
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1001 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);

    // 3초 후 모달 닫기
    setTimeout(() => {
      secretModal.classList.remove('show');
      setTimeout(() => {
        secretModal.style.display = 'none';
      }, 1000);
    }, 3000);
  }

  function showAnswer(cell, type, num, index = null) {
    const answer = answers[type + num];
    if (!answer) return;

    // index가 null이면, 클릭한 칸의 인덱스를 계산
    if (index === null) {
      let idx = 0;
      let current = cell;
      if (type === 'h') {
        while (current.previousElementSibling && current.previousElementSibling.classList.contains('blank')) {
          current = current.previousElementSibling;
          idx++;
        }
      } else {
        let row = cell.parentElement;
        let cellIndex = Array.from(row.children).indexOf(cell);
        while (row.previousElementSibling) {
          const prevRow = row.previousElementSibling;
          const prevCell = prevRow.children[cellIndex];
          if (prevCell && prevCell.classList.contains('blank')) {
            row = prevRow;
            idx++;
          } else {
            break;
          }
        }
      }
      index = idx;
    }

    const answerSpan = cell.querySelector('.answer');
    if (answerSpan) {
      answerSpan.textContent = answer[index];
      answerSpan.classList.add('show');
    }
    checkAllAnswersRevealed();
  }

  function checkAllAnswersRevealed() {
    const allAnswerCells = document.querySelectorAll('td.blank .answer');
    const allRevealed = Array.from(allAnswerCells).every(cell => cell.classList.contains('show'));
    
    if (allRevealed) {
      celebrateCompletion();
    }
  }

  function celebrateCompletion() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }));
      
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }));
    }, 250);
  }

  function hasShownAnswer(cell) {
    const answerSpan = cell.querySelector('.answer');
    return answerSpan && answerSpan.classList.contains('show');
  }

  function findConnectedCells(startCell, type, num) {
    const cells = [];
    let currentCell = startCell;
    if (type === 'h') {
      // 오른쪽으로 이동
      while (currentCell && currentCell.classList.contains('blank') && currentCell.dataset[type] === num) {
        cells.push(currentCell);
        currentCell = currentCell.nextElementSibling;
      }
    } else {
      // 아래로 이동
      const cellIndex = Array.from(startCell.parentElement.children).indexOf(startCell);
      let row = startCell.parentElement;
      while (row) {
        const cell = row.children[cellIndex];
        if (cell && cell.classList.contains('blank') && cell.dataset[type] === num) {
          cells.push(cell);
          row = row.nextElementSibling;
        } else {
          break;
        }
      }
    }
    return cells;
  }

  function getNumberDisplay(cell) {
    if (cell.h && cell.v) {
      return '❶❷❸❹❺❻❼❽'[parseInt(cell.num) - 1];
    } else if (cell.v) {
      return '①②③④⑤⑥⑦⑧'[parseInt(cell.num) - 1];
    }
    return cell.num;
  }

  function revealFullAnswerFromStart(td, type, num) {
    // td가 속한 tr, cellIndex, puzzle 전체 테이블 필요
    const tr = td.parentElement;
    const cellIndex = Array.from(tr.children).indexOf(td);
    let startCell = td;
    let startTr = tr;
    let startCellIndex = cellIndex;

    // 시작점(문제 번호가 있는 칸) 찾기
    if (type === 'h') {
      let current = td;
      while (current.previousElementSibling && current.previousElementSibling.classList.contains('blank') && current.previousElementSibling.dataset.h === num) {
        current = current.previousElementSibling;
      }
      startCell = current;
    } else {
      let row = tr;
      let idx = Array.from(puzzle.children).indexOf(row);
      while (idx > 0) {
        const prevRow = puzzle.children[idx - 1];
        const prevCell = prevRow.children[cellIndex];
        if (prevCell && prevCell.classList.contains('blank') && prevCell.dataset.v === num) {
          row = prevRow;
          idx--;
        } else {
          break;
        }
      }
      startTr = row;
      startCell = row.children[cellIndex];
    }

    // 연결된 모든 칸에 정답 표시 (정확한 위치)
    const cells = [];
    if (type === 'h') {
      let current = startCell;
      while (current && current.classList.contains('blank') && current.dataset.h === num) {
        cells.push(current);
        current = current.nextElementSibling;
      }
    } else {
      let row = startTr;
      let idx = Array.from(puzzle.children).indexOf(row);
      while (row) {
        const cell = row.children[startCellIndex];
        if (cell && cell.classList.contains('blank') && cell.dataset.v === num) {
          cells.push(cell);
          row = row.nextElementSibling;
        } else {
          break;
        }
      }
    }
    const answer = answers[type + num];
    if (!answer) return;
    cells.forEach((c, idx) => {
      const answerSpan = c.querySelector('.answer');
      if (answerSpan) {
        answerSpan.textContent = answer[idx];
        answerSpan.classList.add('show');
      }
    });
    checkAllAnswersRevealed();
  }

  if (horizontalBtn && verticalBtn) {
    horizontalBtn.addEventListener('click', () => {
      if (currentCell && currentCell.h) {
        revealFullAnswerFromStart(currentCell.element, 'h', currentCell.h);
      }
      console.log('horizontalBtn clicked');
      answerButtons.classList.remove('show');
      answerButtons.style.display = '';
    });

    verticalBtn.addEventListener('click', () => {
      if (currentCell && currentCell.v) {
        revealFullAnswerFromStart(currentCell.element, 'v', currentCell.v);
      }
      answerButtons.classList.remove('show');
      answerButtons.style.display = '';
    });
  }

  document.addEventListener('click', (e) => {
    if (answerButtons && !answerButtons.contains(e.target) && 
        !e.target.classList.contains('blank')) {
      answerButtons.classList.remove('show');
    }
  });

  grid.forEach((row, y) => {
    const tr = document.createElement('tr');
    row.forEach((cell, x) => {
      const td = document.createElement('td');
      
      if (cell.block) {
        td.style.background = '#eee';
      } else {
        td.classList.add('blank');
        if (cell.h) td.dataset.h = cell.h;
        if (cell.v) td.dataset.v = cell.v;
        
        if (cell.num) {
          const num = document.createElement('div');
          num.className = 'num';
          if (cell.h && cell.v) {
            num.classList.add('both');
          } else if (cell.v) {
            num.classList.add('vertical');
          }
          num.innerText = getNumberDisplay(cell);
          td.appendChild(num);
        }
        
        const answer = document.createElement('div');
        answer.className = 'answer';
        td.appendChild(answer);

        td.addEventListener('click', (e) => {
          e.stopPropagation();

          // 이미 정답이 보이면 무시
          const answerSpan = td.querySelector('.answer');
          if (answerSpan && answerSpan.classList.contains('show')) return;

          // 가로/세로 둘 다 있는 칸(교차점)
          if (cell.h && cell.v) {
            const hCells = findConnectedCells(td, 'h', cell.h);
            const vCells = findConnectedCells(td, 'v', cell.v);
            const hRevealed = hCells.every(hasShownAnswer);
            const vRevealed = vCells.every(hasShownAnswer);
            // 두 방향 모두 공개됐을 때만 클릭 막기
            if (hRevealed && vRevealed) return;
            if (!hRevealed && vRevealed) {
              revealFullAnswerFromStart(td, 'h', cell.h);
            } else if (hRevealed && !vRevealed) {
              revealFullAnswerFromStart(td, 'v', cell.v);
            } else if (!hRevealed && !vRevealed) {
              currentCell = {
                element: td,
                h: cell.h,
                v: cell.v
              };
              answerButtons.classList.add('show');
              answerButtons.style.display = '';
            }
          } else if (cell.h) {
            const hCells = findConnectedCells(td, 'h', cell.h);
            const hRevealed = hCells.every(hasShownAnswer);
            if (hRevealed) return;
            revealFullAnswerFromStart(td, 'h', cell.h);
          } else if (cell.v) {
            const vCells = findConnectedCells(td, 'v', cell.v);
            const vRevealed = vCells.every(hasShownAnswer);
            if (vRevealed) return;
            revealFullAnswerFromStart(td, 'v', cell.v);
          }
        });
      }
      
      tr.appendChild(td);
    });
    puzzle.appendChild(tr);
  });
} 