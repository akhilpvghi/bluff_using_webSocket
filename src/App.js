import React, {useState, useEffect, useRef, useReducer} from 'react';
import useWebSocket from 'react-use-websocket';
import './App.css';
import './card.css'


function App() {

  // const [playerNumber, setPlayerNumber] = useState(0);
  // const [playerNum, setPlayerNum] = useState(null);
  // const [count, setCount] = useState(0);
  
  const [my_cards, setMy_cards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [throwCards, setThrowCards] = useState(null);
  const [playerNUmmm,setplayerNUmmm]=useState(null);
  const [claimedCard,setClaimedCard]=useState("");
  const [password,setPassword]=useState("");
  const [card_to_throw,setCard_to_throw]=useState([]);
  const socket = useRef(null);
  const [userInput, setUserInput] = useReducer(
    (state, newState) => ({...state, ...newState}),
  {password:"",
claimedCard:""}
);


  // const [socket, setsocket] = useState(new WebSocket('ws://localhost:6789'));
  // const socket = new WebSocket('ws://localhost:6789');


  let playerNumber=0;
  let playerNum=null;
  // let count=0;
  
  // let url = window.location.hostName;
  // let socket=null;
  // let getSocket=(socket)=>{
  //   return socket;
  // }

  // useEffect(() => {
  //   const socket = new WebSocket(`ws://${window.location.href.split('//')[1].split(':')[0]}:1234`)
  //   return () =>  getSocket(socket);
  // }, []);

  useEffect(() => {
    console.log('creating one time socket');
    socket.current = new WebSocket(`ws://${window.location.href.split('//')[1].split(':')[0]}:1234`);
    socket.current.onopen = () => console.log("ws opened");
    
    socket.current.addEventListener('message', function (event) {
      // console.log('Message from server ', event.data);
    if(JSON.parse(event.data).type=="users")
      {playerNumber = JSON.parse(event.data).count;
    console.log("client is listening playerNumber playerNumber",playerNumber);
    playerNum=`player ${playerNumber}` ;
    setplayerNUmmm(playerNum);
    }},{once: true})

    socket.current.onclose = () => console.log("ws closed");
}, []);

  useEffect(() => {
    // const socket = new Websocket.current('ws://localhost:6789');
    // console.log("window.location.hostName window.location.hostName",window.location.href.split('//')[1].split(':')[0]);
    // const socket.current = getsocket.current();
    //  const socket.current = new Websocket.current(`ws://${window.location.href.split('//')[1].split(':')[0]}:1234`);
    if(socket.current!=null && playerNUmmm!=null){
    socket.current.addEventListener('open', function (event) {
      console.log("client is listening ");
    });
            
    // if(throwCards!=true && throwCards==null){
  
  socket.current.addEventListener('message', function (event) {
    let card_status;
    // console.log("------------------->",event.data.split("Message from server")[0]);
    const all_cards = JSON.parse(event.data.split("Message from server")[0]);
    // console.log("playerNum playerNum playerNum",playerNUmmm)
    if(event.data.split("Message from server")[0].includes("player")){
      setMy_cards([])
      const my_card = Object.entries(all_cards).filter(([key,val])=>{
        console.log("player ",key ,"its card",val);
        return key==playerNUmmm
      }
      
      );
      // console.log("my_card my_card my_card",my_card);
      my_card[0][1]["total_cards"].map((card)=>{
        card_status = {"card": card, "isSelected": false};
        // setMy_cards( [card_status])
        console.log("my cardssssssss======>",card);
        setMy_cards(spreadSheetData => [...spreadSheetData, card_status])
        // setMy_cards({my_cards,...card_status})
      })
      // setSelectedCards({})
      // debugger;
    }
  }
  )


  if(playerNUmmm!=null){
    // console.log("sending messsage to socket srver");
    // socket.current.addEventListener('open', function (event) {
      socket.current.send(`{"action": "plus","playerNumber":"${playerNUmmm}","userType":"user"}`);
  // });

  } 
// }

  // if((throwCards==true || throwCards==false) && playerNUmmm!=null){
    
  // }
}

  
  }, [playerNUmmm])


  
  
  
  
  let getIconContent=(alpha,index,isIcon)=>{
    if (alpha[index]==='C')
  return isIcon ? "♣": "clubs";
  else if (alpha[index]==='D')
  return isIcon ? "♦" : "diams";
  else if (alpha[index]==='H')
  return isIcon ? "♥" : "hearts";
  else if (alpha[index]==='S')
  return isIcon ? "♠" : "spades";
}

let findDesign=(ele,isIcon)=>{
  let  alpha = ele.split("");
  if(alpha.length!==3)
  return getIconContent(alpha,1,isIcon)
  else
  return getIconContent(alpha,2,isIcon);
}
// useEffect(() => {
//   if(card_to_throw.length!=0){
//     setCard_to_throw(card_to_throw)
//     // console.log("muy scards state====>",my_cards);
// }
// }, [card_to_throw])

let helperFnToThrowCard= (sendToServer)=>{
  let card_to_be_thrown = my_cards.filter((ele)=>
  ele.isSelected!==false
  )
  if(sendToServer)
  card_to_be_thrown.map((ele) =>    //deleting other property
  delete ele.isSelected
  )
console.log("card_to_be_thrown card_to_be_thrown ",card_to_be_thrown);
 setCard_to_throw(card_to_be_thrown)
return card_to_be_thrown;
}

let toggleCardSelection= (cardall,cardToToggleStatus)=>{
  let isSelectedCard=false;
  let toggleStatus={};
    let updatedCards=cardall.filter((ele)=>
    {
      if(ele.card===cardToToggleStatus)
      { 
        isSelectedCard = !ele.isSelected;} 
      return ele.card!==cardToToggleStatus;
    }
    )
    toggleStatus = {"card": cardToToggleStatus,"isSelected":isSelectedCard};
     
    setCard_to_throw([...updatedCards,toggleStatus].filter((ele)=>ele.isSelected!=false))
    setMy_cards([...updatedCards,toggleStatus] )
    // helperFnToThrowCard(false)
    
    // debugger;
}

let findno=(ele)=>{
  let alpha=ele.split("");
  if(alpha.length!==3)
  return alpha[0];
  else 
  return [alpha[0],alpha[1]].join("");

}

let pickCards=()=>{
  console.log("pick_card_request_send of player no ",playerNUmmm);
  socket.current.send(`{"action": "pick_cards","playerNumber":"${playerNUmmm}","userType":"user"}`);
}


let throwCardsfn=()=>{
  console.log("claimrd carddddd ",userInput.claimedCard)
  const card_to_be_thrown = helperFnToThrowCard(true);
  const create_throwObject = {...{"action": "throw_card","playerNumber":`${playerNUmmm}`,"userType":"user"},...{"thrown_cards":card_to_be_thrown},...{"claiming":`${card_to_throw.length}_${userInput.claimedCard}`}}
  console.log("create_throwObject ************** ",create_throwObject);
  socket.current.send(JSON.stringify(create_throwObject) );
  setCard_to_throw([])
}

// let handleChange=(e)=>{
//   console.log("e.target.value",e.target.value)
//   setClaimedCard(e.target.value)
// }

// let handleUser=(e)=>{
//   console.log("e.target.value",e.target.value)
//   setPassword(e.target.value)
// }
let authenticateAdmin=()=>{
  if(userInput.password==="8799717085"){
    socket.current.send(`{"action": "plus","player":"player ${playerNumber}", "userType":"admin"}`);
  }else if(userInput.password!==""){
    setUserInput({["password"]: "ready_to_go"})
  }
  console.log("userInput.password userInput.password ",userInput.password);

}


const handleChange = evt => {
  console.log("evt.target.value  ",evt.target.value);
    const name = evt.target.name;
    const newValue = evt.target.value;
    setUserInput({[name]: newValue});}




return (  
  <div className="App">
    <h3>Hello</h3>
      {my_cards.length===0 && userInput.password==="ready_to_go" ?<h3>You are Ready to go...!! Admin is about to start the game and cards will appear in seconds</h3>:null}
      {my_cards.length===0 && userInput.password!=="ready_to_go"?
      <div className="a">
      <input type="text" value={userInput.password} name="password" onChange={handleChange}></input>
      <button onClick={()=>authenticateAdmin()}>submit</button>
      </div>
      :null}
      <div className="playingCards fourColours rotateHand">
<ul className="hand">
      {my_cards ?my_cards.map((ele)=>{return !ele.isSelected ?  (
        <li onClick={()=>toggleCardSelection(my_cards,ele.card) 
        }>
        <a className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
                </a>
        </li>
		
    ): (
      <li onClick={()=>toggleCardSelection(my_cards,ele.card)}>
        <a style={{bottom: "1em"}} className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
        </a>
        </li>
        )
      }): null}
      </ul>
		</div>
    {my_cards.length!=0?(
    <div className="a">
      <label>Claim to throw card</label>
      {card_to_throw.length!==0?<h3>Total card selected {card_to_throw.length}</h3>:null}
      <input type="text" value={userInput.claimedCard} name="claimedCard" onChange={handleChange}></input>
      {card_to_throw.length!==0?<button onClick={()=>throwCardsfn()}>Throw</button>:null}
    
    <button onClick={()=>pickCards()}>Pick cards</button>
    </div>
    ):null}
    </div>
  );
}

export default App;
