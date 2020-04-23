import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let style;
  if (props.inWinnerLine) {
    style = {
      background: 'yellow',
    }
  } else {
    style = {
      background: 'white',
    }
  }
  return (
    <button className="square" onClick={props.onClick} style={style}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winnerLine = this.props.winnerLine;
    let inWinnerLine = false;
    if (winnerLine && winnerLine.some(n => n === i)) {
      inWinnerLine = true;
    }
    return(
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        inWinnerLine={inWinnerLine}
      />
    );
  }

  render() {
    let lines = [];
    let squares;
    for (let i = 0; i < 3; i++) {
      squares = []
      for (let j = 0; j < 3; j++) {
        squares = squares.concat(this.renderSquare(i * 3 + j))
      }
      lines = lines.concat(
        <div className="board-row">
          {squares}
        </div>
      )
    }
    return (
      <div>
        {lines}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      positionHistory: [{
        position: Array(2).fill(null)
      }],
      historyButtonAsc: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const positionHistory = this.state.positionHistory.slice(0, this.state.stepNumber + 1);
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      positionHistory: positionHistory.concat([{
        position: [calculateCol(i), calculateRow(i)]
      }]),
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  // 着手履歴並び順切り替え
  sortHistoryButtons() {
    this.setState({
      historyButtonAsc: !this.state.historyButtonAsc,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const winnerLine = calculateWinnerLine(current.squares);
    const positionHistory = this.state.positionHistory;
    const moves = history.map((step, move) => {
      // Go to ~ の文
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';

      // OXを付けたポジション
      let position;
      if (move) {
        const col = positionHistory[move].position[0];
        const row = positionHistory[move].position[1]
        position = '(' + col + ', ' + row + ')';
      } else {
        position = '';
      }

      // 選択したボタンを太字にする
      let fontWeight;
      if (this.state.stepNumber === move) {
        fontWeight = {fontWeight: 'bold'}
      } else {
        fontWeight = {fontWeight: 'normal'}
      }

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)} style={fontWeight}>{desc} {position}</button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (!current.squares.some(value => value === null)) {
      status = 'Draw'
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    // 着手履歴ボタンリスト作成
    let historyButtons;
    if (this.state.historyButtonAsc) {
      historyButtons = <ol>{moves}</ol>;
    } else {
      const reversedMoves = moves.slice(0, moves.length).reverse();
      historyButtons = <ol reversed>{reversedMoves}</ol>
    }
    
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winnerLine={winnerLine}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.sortHistoryButtons()}>Sort</button>
          {historyButtons}
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  return searchInSquares(squares, 'winner');
}

function calculateWinnerLine(squares) {
  return searchInSquares(squares, 'winnerLine');
}

function searchInSquares(squares, object) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      let result;
      if (object === 'winner') {
        result = squares[a];
      } else if (object === 'winnerLine') {
        result = [a, b, c]
      }
      return result;
    }
  }
  return null;
}

function calculateCol(i) {
  const n = i % 3;
  let col;
  if (n === 0) {
    col = 1;
  } else if (n === 1) {
    col = 2;
  } else {
    col = 3;
  }
  return col;
}

function calculateRow(i) {
  let row;
  if (i <= 2) {
    row = 1;
  } else if (i <= 5) {
    row = 2;
  } else if (i <= 8){
    row = 3;
  }
  return row;
}