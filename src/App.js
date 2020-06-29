import React, {
  useState,
  useEffect,
  useRef,
  useReducer
} from 'react';
import useWebSocket from 'react-use-websocket';
import './App.css';
import './card.css'


function App() {

  const [my_cards, setMy_cards] = useState([]);
  const [playerIdentity, setPlayerIdentity] = useState(null);
  const [card_to_throw, setCard_to_throw] = useState([]);

  const socket = useRef(null);
  const [userInput, setUserInput] = useReducer(
    (state, newState) => ({
      ...state,
      ...newState
    }), {
      userName: "",
      claimedCard: ""
    }
  );


  let playerNumber = 0;

  useEffect(() => {
    console.log('creating one time socket');
    socket.current = new WebSocket(`ws://${window.location.href.split('//')[1].split(':')[0]}:1234`);
    socket.current.onopen = () => console.log("ws opened");

    socket.current.addEventListener('message', function (event) {
      // console.log('Message from server ', event.data);
      if (JSON.parse(event.data).type == "users") {
        playerNumber = JSON.parse(event.data).count;
        console.log("client is listening playerNumber playerNumber", playerNumber);
        setPlayerIdentity(`player ${playerNumber}`);
      }
    }, {
      once: true
    })

    socket.current.onclose = () => console.log("ws closed");
  }, []);

  useEffect(() => {
    if (socket.current != null && playerIdentity != null) {
      socket.current.addEventListener('open', function (event) {
        console.log("client is listening ");
      });

      socket.current.addEventListener('message', function (event) {
        let card_status;
        const all_cards = JSON.parse(event.data.split("Message from server")[0]);
        // console.log("playerNum playerNum playerNum",playerNUmmm)
        if (event.data.split("Message from server")[0].includes("player")) {
          setMy_cards([])                   //=================>to set new cards from starting
          const my_card = Object.entries(all_cards).filter(([key, val]) => {
              // console.log("player ",key ,"its card",val);
              return key == playerIdentity
            }

          );
          // console.log("my_card my_card my_card",my_card);
          my_card[0][1]["total_cards"].map((card) => {
            card_status = {
              "card": card,
              "isSelected": false
            };
            console.log(`LOG 1 ===> total card coming for current player ${JSON.stringify(card_status)}`)
            setMy_cards(data => [...data, card_status])
          })
        }

      })

    }
    if (my_cards.length !== 0)
      setUserInput({
        ["status"]: "start"
      })

  }, [playerIdentity])






  let getIconContent = (alpha, index, isIcon) => {
    if (alpha[index] === 'C')
      return isIcon ? "♣" : "clubs";
    else if (alpha[index] === 'D')
      return isIcon ? "♦" : "diams";
    else if (alpha[index] === 'H')
      return isIcon ? "♥" : "hearts";
    else if (alpha[index] === 'S')
      return isIcon ? "♠" : "spades";
  }

  let findDesign = (ele, isIcon) => {
    let alpha = ele.split("");
    if (alpha.length !== 3)
      return getIconContent(alpha, 1, isIcon)
    else
      return getIconContent(alpha, 2, isIcon);
    }
    // useEffect(() => {
    //   if(card_to_throw.length!=0){
    //     setCard_to_throw(card_to_throw)
    //     // console.log("muy scards state====>",my_cards);
    // }
    // }, [card_to_throw])
      
  let helperFnToThrowCard = () => {
    let card_to_be_thrown = my_cards.filter((ele) =>
      ele.isSelected !== false
    )
    card_to_be_thrown.map((ele) => //deleting other property
      delete ele.isSelected
    )
    console.log("card_to_be_thrown card_to_be_thrown ", card_to_be_thrown);
    setCard_to_throw(card_to_be_thrown)
    return card_to_be_thrown;
  }

  let toggleCardSelection = (cardToToggleStatus) => {
    let isSelectedCard = false;
    let toggleStatus = {};
    let updatedCards =[];
     updatedCards = my_cards.filter((ele) => { 
      if (ele.card === cardToToggleStatus) {
        isSelectedCard = !ele.isSelected;
      }
      return ele.card !== cardToToggleStatus;
    })
    toggleStatus = {
      "card": cardToToggleStatus,
      "isSelected": isSelectedCard
    };

    // helperFnToThrowCard()
    setMy_cards([...updatedCards, toggleStatus])
    setCard_to_throw([...updatedCards, toggleStatus].filter((ele) => ele.isSelected != false))

    // debugger;
  }

  let findno = (ele) => {
    let alpha = ele.split("");
    if (alpha.length !== 3)
      return alpha[0];
    else
      return [alpha[0], alpha[1]].join("");

  }

  let pickCards = () => {
    socket.current.send(`{"action": "pick_cards","playerNumber":"${playerIdentity}","userType":"user"}`);
  }


  let throwCardsfn = () => {
    const card_to_be_thrown = helperFnToThrowCard();
    const create_throwObject = {
      ...{
        "action": "throw_card",
        "playerNumber": `${playerIdentity}`,
        "userType": "user"
      },
      ...{
        "thrown_cards": card_to_be_thrown
      },
      ...{
        "claiming": `${card_to_throw.length}_${userInput.claimedCard}`
      }
    }
    // console.log("create_throwObject ************** ",create_throwObject);
    setCard_to_throw([])
    socket.current.send(JSON.stringify(create_throwObject));
  }


  let authenticateAdmin = () => {
    if (userInput.userName === "8799717085" && playerIdentity != null) {
      // setUserInput({["userName"]: "Akhil"})
      socket.current.send(`{"action": "plus","playerNumber":"${playerIdentity}","userType":"admin","userName":"Akhil"}`);
      setUserInput({
        ["status"]: "ready_to_go"
      })
    } else if (userInput.userName !== "") {
      setUserInput({
        ["status"]: "ready_to_go"
      })
      if (playerIdentity != null) {
        socket.current.send(`{"action": "plus","playerNumber":"${playerIdentity}","userType":"user","userName":"${userInput.userName}"}`);
        // setUserInput({["userName"]: "ready_to_go"})
      }

    }
    // console.log("userInput.password userInput.password ",userInput.userName);

  }


  const handleChange = evt => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    setUserInput({
      [name]: newValue
    });
  }

  
return (  
  <div className="App">
    <h3>Hello</h3>
      {my_cards.length===0 && userInput.status==="ready_to_go" ?<h3>You are Ready to go...!! Admin is about to start the game and cards will appear in seconds</h3>:null}
      {my_cards.length===0 && userInput.status!=="ready_to_go"?
      <div className="a">
      <input type="text" value={userInput.userName} name="userName" onChange={handleChange}></input>
      <button onClick={()=>authenticateAdmin()}>submit</button>
      </div>
      :null}
      <div className="playingCards fourColours rotateHand">
<ul className="hand">
      {my_cards ?my_cards.map((ele)=>{return !ele.isSelected ?  (
        <li onClick={()=>toggleCardSelection(ele.card) 
        }>
        <a className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
                </a>
        </li>
		
    ): (
      <li onClick={()=>toggleCardSelection(ele.card)}>
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