const express =require('express');
const socket=require('socket.io');
const http=require('http');
const {Chess}=require('chess.js');//getting chess class from chess.js
const path=require('path');

const app=express();

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

const server=http.createServer(app);
const io=socket(server);  //socket require http server which is based on express server, we link http server and express server and socket.io will handel that

const chess=new Chess()  //now we get all rules of chess in chess

//setting variables
let players={};
let currentPlayer="w";

app.get('/',(req,res)=>{
    res.render("index",{title:"chess game"});
})

io.on("connection",(uniquesocket)=>{
    console.log('connected');
    if(!players.white){ //check if there is field of white in players
        players.white=uniquesocket.id; //if not then create
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        uniquesocket.emit("spectatorRole");//if there are both black and white then assign a spectatator role
    }

    uniquesocket.on("disconnect",()=>{
        if(uniquesocket.id===players.white){
            delete(players.white);
        }else if(uniquesocket.id===players.black){
            delete(players.black);
        }
    })

    uniquesocket.on("move",(move)=>{//when we are getting move event fron frontend
        try {
            if(chess.turn==='w' && uniquesocket.id!==players.white)return; // if turn is of white but black moved then not a valid move 
            if(chess.turn==='b' && uniquesocket.id!==players.black)return;
            const result=chess.move(move); //if move is not valid then result will get error thats why we are using try catch
            if(result){
                currentPlayer=chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());//with chess.fen() we are sending current state of board and of variable name boardSate
            }
            else{
                console.log("invalid move");
                uniquesocket.emit("Invalid Move",move);
            }
        } catch (err) {
            console.log(err);
            uniquesocket.emit("Invalid Move",move);
        }
    })
})



server.listen(3000);

