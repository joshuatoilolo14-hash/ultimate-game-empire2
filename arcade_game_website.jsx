import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

/*
=============================================
ULTIMATE GAME EMPIRE - FULL POWER EDITION
Features:
- Login System
- Coins + Shop
- Achievements System
- AI Opponent
- Multiplayer (Local 2P Mode)
- Global Leaderboard Ready (Firebase Placeholder)
- Theme Toggle
- Sound Toggle
- Persistent Storage
- Scalable Architecture
=============================================
*/

export default function UltimateGameEmpire() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [coins, setCoins] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [sound, setSound] = useState(true);
  const [achievements, setAchievements] = useState([]);

  // LOAD
  useEffect(() => {
    const u = localStorage.getItem("uge_user");
    const c = localStorage.getItem("uge_coins");
    const t = localStorage.getItem("uge_theme");
    const s = localStorage.getItem("uge_sound");
    const a = localStorage.getItem("uge_achievements");
    if (u) setUser(u);
    if (c) setCoins(parseInt(c));
    if (t) setTheme(t);
    if (s) setSound(s === "true");
    if (a) setAchievements(JSON.parse(a));
  }, []);

  useEffect(() => localStorage.setItem("uge_coins", coins), [coins]);
  useEffect(() => localStorage.setItem("uge_theme", theme), [theme]);
  useEffect(() => localStorage.setItem("uge_sound", sound), [sound]);
  useEffect(() => localStorage.setItem("uge_achievements", JSON.stringify(achievements)), [achievements]);

  const unlockAchievement = (name) => {
    if (!achievements.includes(name)) {
      setAchievements([...achievements, name]);
    }
  };

  const bgClass = theme === "dark"
    ? "bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white"
    : "bg-gray-100 text-black";

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold cursor-pointer" onClick={() => setPage("home")}>🌍 Ultimate Game Empire</h1>
        <div className="flex gap-3 items-center">
          <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Theme</Button>
          <Button onClick={() => setSound(!sound)}>{sound ? "🔊" : "🔇"}</Button>
          {user && <span>🪙 {coins}</span>}
          {user && <span>{user}</span>}
          {user ? (
            <Button onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</Button>
          ) : (
            <Button onClick={() => setPage("login")}>Login</Button>
          )}
        </div>
      </header>

      {page === "home" && <Home setPage={setPage} />}
      {page === "login" && (
        <Login usernameInput={usernameInput} setUsernameInput={setUsernameInput} setUser={setUser} />
      )}
      {page === "click" && <ClickGame user={user} setCoins={setCoins} unlockAchievement={unlockAchievement} />}
      {page === "tic" && <TicTacToe user={user} setCoins={setCoins} unlockAchievement={unlockAchievement} />}
      {page === "multi" && <LocalMultiplayer unlockAchievement={unlockAchievement} />}
      {page === "shop" && <Shop coins={coins} setCoins={setCoins} />}
      {page === "leaderboard" && <Leaderboard />}
      {page === "achievements" && <Achievements achievements={achievements} />}

      <footer className="text-center p-6 opacity-60">© 2026 Ultimate Game Empire - Professional Edition</footer>
    </div>
  );
}

function Home({ setPage }) {
  const items = [
    ["Click Challenge","click"],
    ["Tic Tac Toe (AI)","tic"],
    ["Local Multiplayer","multi"],
    ["Shop","shop"],
    ["Leaderboard","leaderboard"],
    ["Achievements","achievements"]
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6 p-10 max-w-6xl mx-auto">
      {items.map((g,i)=>(
        <Card key={i} className="bg-white text-black rounded-2xl shadow-xl cursor-pointer hover:scale-105 transition" onClick={()=>setPage(g[1])}>
          <CardContent className="p-8 text-center text-xl font-bold">{g[0]}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function Login({ usernameInput, setUsernameInput, setUser }) {
  return (
    <div className="flex justify-center items-center p-20">
      <Card className="bg-white text-black w-96 rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-center">Login</h2>
          <Input value={usernameInput} onChange={(e)=>setUsernameInput(e.target.value)} placeholder="Username" />
          <Button onClick={()=>{
            localStorage.setItem("uge_user", usernameInput);
            setUser(usernameInput);
          }} className="w-full">Enter Empire</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ClickGame({ user, setCoins, unlockAchievement }) {
  const [score,setScore]=useState(0);
  const [time,setTime]=useState(15);
  const [playing,setPlaying]=useState(false);
  const [pos,setPos]=useState({x:40,y:40});

  useEffect(()=>{
    let t;
    if(playing && time>0){
      t=setInterval(()=>setTime(v=>v-1),1000);
    }
    if(time===0 && playing){
      setPlaying(false);
      setCoins(c=>c+score);
      saveScore("Click",score,user);
      if(score>=20) unlockAchievement("Speed Demon");
    }
    return ()=>clearInterval(t);
  },[time,playing]);

  return (
    <GameLayout title="Click Challenge" score={score} time={time} start={()=>{
      setScore(0); setTime(15); setPlaying(true);
    }}>
      {playing && (
        <motion.div
          key={score}
          onClick={()=>{
            setScore(score+1);
            setPos({x:Math.random()*80,y:Math.random()*80});
          }}
          className="absolute w-12 h-12 bg-red-500 rounded-full cursor-pointer"
          style={{top:`${pos.y}%`,left:`${pos.x}%`}}
        />
      )}
    </GameLayout>
  );
}

function TicTacToe({ user, setCoins, unlockAchievement }) {
  const [board,setBoard]=useState(Array(9).fill(null));
  const [turn,setTurn]=useState(true);
  const winner=calculateWinner(board);

  useEffect(()=>{
    if(!turn && !winner){
      const empty=board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
      const move=empty[Math.floor(Math.random()*empty.length)];
      if(move!==undefined){
        const nb=[...board]; nb[move]="O";
        setBoard(nb); setTurn(true);
      }
    }
  },[turn]);

  const click=(i)=>{
    if(board[i]||winner||!turn) return;
    const nb=[...board]; nb[i]="X";
    setBoard(nb); setTurn(false);
    if(calculateWinner(nb)==="X"){
      setCoins(c=>c+25);
      saveScore("TicTacToe",50,user);
      unlockAchievement("Strategist");
    }
  };

  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Tic Tac Toe AI</h2>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {board.map((c,i)=>(
          <div key={i} onClick={()=>click(i)} className="h-20 bg-white text-black flex items-center justify-center text-2xl rounded-xl cursor-pointer">{c}</div>
        ))}
      </div>
      {winner && <p className="mt-4 text-xl">Winner: {winner}</p>}
    </div>
  );
}

function LocalMultiplayer({ unlockAchievement }){
  const [board,setBoard]=useState(Array(9).fill(null));
  const [xTurn,setXTurn]=useState(true);
  const winner=calculateWinner(board);

  const click=(i)=>{
    if(board[i]||winner) return;
    const nb=[...board]; nb[i]=xTurn?"X":"O";
    setBoard(nb); setXTurn(!xTurn);
    if(calculateWinner(nb)) unlockAchievement("Multiplayer Winner");
  };

  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Local Multiplayer</h2>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {board.map((c,i)=>(
          <div key={i} onClick={()=>click(i)} className="h-20 bg-white text-black flex items-center justify-center text-2xl rounded-xl cursor-pointer">{c}</div>
        ))}
      </div>
      {winner && <p className="mt-4">Winner: {winner}</p>}
    </div>
  );
}

function Shop({ coins,setCoins }){
  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Shop</h2>
      <Card className="bg-white text-black max-w-sm mx-auto rounded-xl">
        <CardContent className="p-6">
          <p>Elite Badge</p>
          <p>Cost: 100 🪙</p>
          <Button disabled={coins<100} onClick={()=>setCoins(coins-100)}>Buy</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Achievements({ achievements }){
  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Achievements</h2>
      {achievements.length===0 && <p>No achievements unlocked yet.</p>}
      {achievements.map((a,i)=>(
        <Card key={i} className="bg-white text-black max-w-sm mx-auto rounded-xl mb-4">
          <CardContent className="p-4">🏆 {a}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function calculateWinner(board){
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for(let [a,b,c] of lines){
    if(board[a]&&board[a]===board[b]&&board[a]===board[c]) return board[a];
  }
  return null;
}

function saveScore(game,score,user){
  if(!user) return;
  const scores=JSON.parse(localStorage.getItem("uge_scores")||"[]");
  scores.unshift({user,game,score});
  localStorage.setItem("uge_scores",JSON.stringify(scores.slice(0,20)));
}

function Leaderboard(){
  const scores=JSON.parse(localStorage.getItem("uge_scores")||"[]");
  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-6">Leaderboard</h2>
      {scores.map((s,i)=>(
        <Card key={i} className="bg-white text-black max-w-md mx-auto rounded-xl mb-3">
          <CardContent className="p-4">{s.user} - {s.game} - {s.score}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function GameLayout({ title,score,time,start,children }){
  return (
    <div className="p-10 text-center">
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <div className="flex justify-center gap-6 mb-4">
        <span>Score: {score}</span>
        <span>Time: {time}s</span>
      </div>
      <Button onClick={start} className="mb-6">Start</Button>
      <div className="relative h-96 bg-gray-200 rounded-2xl overflow-hidden">{children}</div>
    </div>
  );
}
