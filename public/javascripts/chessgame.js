
const socket = io();
const chess=new Chess;

const boardElement=document.querySelector(".chessboard");

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null;

socket.on("Invalid Move",()=>{
    alert("invalid move");
})

const renderBoard=()=>{
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowindex)=>{
        row.forEach((sqaure,squareindex)=>{
            const squareElement=document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex+squareindex)%2===0?"light":"dark"
            );
            squareElement.dataset.row=rowindex;
            squareElement.dataset.col=squareindex;

            if(sqaure){
                const pieceElement=document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    sqaure.color==='w'?"white":"black"
                )
                pieceElement.innerText=getPieceUnicode(sqaure);
                pieceElement.draggable=playerRole===sqaure.color;
                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row:rowindex,col:squareindex};
                        e.dataTransfer.setData("text/plain","");
                    }
                });
                pieceElement.addEventListener("dragend",()=>{
                    draggedPiece=null;
                    sourceSquare=null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover",(e)=>{
                e.preventDefault();
            })

            squareElement.addEventListener("drop",(e)=>{
                e.preventDefault();
                if(draggedPiece){
                    const targetSource={
                        row:parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col)
                    }
                    handleMove(sourceSquare,targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        })

    })
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove=(source,target)=>{
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit("move",move);
};
const getPieceUnicode=(piece)=>{
    const unicodePieces={
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♞",
        B:"♝",
        Q:"♛",
        K:"♚"
    }
    return unicodePieces[piece.type]||"";
};
socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard();
})
socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard();
})
socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
})
socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
})

renderBoard();

