import React, {useState, useEffect, useRef} from 'react';
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
  const socket = useRef(null);
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


  let toggleCardSelection=(cardall,cardToToggleStatus)=>{
    let isSelectedCard=false;
    let toggleStatus={};
      let updatedCards=cardall.filter((ele)=>
      {
        // console.log("ele.cardele.card ele.card ele.card ele.cardklfjdkfs",cardToToggleStatus,ele.card);
        if(ele.card==cardToToggleStatus)
        { 
          // console.log("pakdaa gaya");
        // console.log("card to be removed",ele,cardToToggleStatus);
          isSelectedCard = !ele.isSelected;} 
        return ele.card!==cardToToggleStatus;
      }
  
      )
      
      // console.log("updatedCards updatedCards updatedCards",updatedCards);
      toggleStatus = {"card": cardToToggleStatus,"isSelected":isSelectedCard};
      // debugger;
      setMy_cards([...updatedCards,toggleStatus] )
     
  
  }


useEffect(() => {
  if(my_cards!=null){
    // console.log("muy scards state====>",my_cards);
  }
}, [my_cards])
    
// let findDesign=(ele)=>{
//   let  alpha = ele.split("");
//   if(alpha.length!==3)
//   {
//     console.log("--------=========ffffffff=fds===>",alpha[1]);
//     if (alpha[1]==='C')
//   return "clubs"
//   else if (alpha[1]==='D')
//   return "diams"
//   else if (alpha[1]==='H')
//   return "hearts"
//   else if (alpha[1]==='S')
//   return "spades"
// }else{
//     if (alpha[2]==='C')
//   return "clubs"
//   else if (alpha[2]==='D')
//   return "diams"
//   else if (alpha[2]==='H')
//   return "hearts"
//   else if (alpha[2]==='S')
//   return "spades"
//   }
// }

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
  let create_throwObject={};
  let card_to_be_thrown = my_cards.filter((ele)=>
  ele.isSelected!==false
)

card_to_be_thrown.map((ele)=>{   //deleting other property
  // console.log(ele.isSelected)
  delete ele.isSelected;
})
// socket.current.addEventListener('open', function (event) {
  // console.log("call to car_to_be_thrown",card_to_be_thrown);
  create_throwObject = {...{"action": "throw_card","playerNumber":`${playerNUmmm}`,"userType":"user"},...{"thrown_cards":card_to_be_thrown}}
  console.log("call to nhi ho raha????",JSON.stringify(create_throwObject));
  socket.current.send(JSON.stringify(create_throwObject) );
// }); "${JSON.stringify({"thrown_cards":car_to_be_thrown})}
}




  return (  
    <div className="App">
      <h1>hello</h1>
      <div class="playingCards fourColours rotateHand">
<ul className="hand">
      {my_cards ?my_cards.map((ele)=>{return !ele.isSelected ?  (


        <li onClick={()=>toggleCardSelection(my_cards,ele.card)}>
        <a className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
                {/* <span class="rank">7</span>
                <span class="suit">&diams;</span> */}
            </a>
            {/* <div className={`card rank-${findno(ele).isInteger ? findno(ele): findno(ele).toLowerCase()} ${findDesign(ele)}`}><span class="rank">{findno(ele)}</span>{findDesign2(ele)}<span class="suit"></span></div> */}
        
        </li>
		
      ): (
      <li onClick={()=>toggleCardSelection(my_cards,ele.card)}>
        <a style={{bottom: "1em"}} className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
                {/* <span class="rank">7</span>
                <span class="suit">&diams;</span> */}
            </a>
            {/* <div className={`card rank-${findno(ele).isInteger ? findno(ele): findno(ele).toLowerCase()} ${findDesign(ele)}`}><span class="rank">{findno(ele)}</span>{findDesign2(ele)}<span class="suit"></span></div> */}
        
        </li>
        )
      }): null}
      </ul>
		</div>
    {my_cards.length!=0?(
    <div className="a">
    <button onClick={()=>throwCardsfn()}>Throw</button>
    <button onClick={()=>pickCards()}>Pick cards</button>
    </div>
    ):null}
    </div>
  );
}

export default App;
