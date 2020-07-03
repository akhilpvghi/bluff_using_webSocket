import React, {
  useState,
  useEffect,
  useRef,
  useReducer
} from 'react';
import './App.css';
import './card.css'
import Select from "react-select";


function App() {

  const [my_cards, setMy_cards] = useState([]);
  const [playerIdentity, setPlayerIdentity] = useState(null);
  const [card_to_throw, setCard_to_throw] = useState([]);
  const [serverMessageFromBluff, setServerMessageFromBluff] = useState("");
  const [currentPlayerInAction, setCurrentPlayerInAction] = useState("");
  // const [urlToPlay, setUrlToPlay] = useState("");
  // const [timeCount, setTimeCount] = useState(10);
  const socket = useRef(null);
  const [userInput, setUserInput] = useReducer(
    (state, newState) => ({
      ...state,
      ...newState
    }), {
      userName: "",
      claimedCard: {}
    }
  );

  // useEffect(() => {
  //     if(props.urlToPlay!="")
  //     setUrlToPlay(props.urlToPlay)
      
  // }, [props.urlToPlay])


  
  useEffect(() => {
    let playerNumber = 0;
    let AccessURL="";
    console.log('creating one time socket');
    AccessURL =`ws://${window.location.href.split('//')[1].split(':')[0]}:1234`
    // AccessURL ='ws://bluff-ready-go-bluff03.apps.us-west-1.starter.openshift-online.com'
    // wss://bluff-ready-go-bluff03.apps.us-west-1.starter.openshift-online.com
    socket.current = new WebSocket(`${AccessURL}`);
    // ,'chat-1.0'
    socket.current.onopen = () => console.log("ws opened");
    socket.current.addEventListener('message', function (event) {
      if (JSON.parse(event.data).type === "users") {
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
        if(event.data.includes("player")){
          // setTimeCount(setInterval((ele)=>{
          //   return ele
          // },1000))      //=================>to set new cards from starting
        const all_cards = JSON.parse(event.data);
        console.log("ACTUAL DATA FROM SERVER",event.data);
          setServerMessageFromBluff(all_cards["serverMessageFromBluff"]);
          setCurrentPlayerInAction(all_cards["currentActivePlayer"]);
          if(all_cards["currentActivePlayerNumber"]===playerIdentity)
          setCurrentPlayerInAction("You're in Action Please Respond :)");
          setMy_cards([])    
          const my_card = Object.entries(all_cards).filter(([key, val]) => {
              return key === playerIdentity
            }

          );
          console.log("ACTUAL DATA FROM SERVER 2",my_card);
          if(my_card.length!==0)
          my_card[0][1]['total_cards'].map((card) => {
            card_status = {
              "card": card,
              "isSelected": false
            };
            // console.log(`LOG 1 ===> total card coming for current player ${JSON.stringify(card_status)}`)
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





  // let reset=()=> {
  //   setTimeCount(0);
  // }

  // useEffect(() => {
  //   let interval = null;
  //     interval = setInterval(() => {
  //       setTimeCount(seconds => seconds - 1);
  //     }, 1000);
  //     if(timeCount===0)
  //     clearInterval(interval)

  //   return () => clearInterval(interval);
  // }, [timeCount]);


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
    let alpha = ele.split("_")[0].split("");
    if (alpha.length !== 3)
      return getIconContent(alpha, 1, isIcon)
    else
      return getIconContent(alpha, 2, isIcon);
    }

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

  // useEffect(() => {
  // }, [timeCount])

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

    setMy_cards([...updatedCards, toggleStatus])
    setCard_to_throw([...updatedCards, toggleStatus].filter((ele) => ele.isSelected !== false))
  }

  let findno = (ele) => {
    let alpha = ele.split("_")[0].split("");
    if (alpha.length !== 3)
      return alpha[0];
    else
      return [alpha[0], alpha[1]].join("");

  }

  let pickCards = () => {
    socket.current.send(`{"action": "pick_cards","playerNumber":"${playerIdentity}","userType":"user","userName":"${userInput.userName}"}`);
  }


  let throwCardsfn = () => {
    setUserInput({
      ["status"]: "start"
    })
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
        "claiming": `${card_to_throw.length}_${userInput.claimedCard.value}`
      },
      ...{"userName":`${userInput.userName}`}
    }
    // console.log("create_throwObject ************** ",create_throwObject);
    setCard_to_throw([])
    socket.current.send(JSON.stringify(create_throwObject));
    setUserInput({["claimedCard"]:{}});
  }


  let authenticateAdmin = () => {
    if (userInput.userName.includes("8799717085") && playerIdentity != null) {
      setUserInput({["userName"]: "Akhil"})
      socket.current.send(`{"action": "plus","playerNumber":"${playerIdentity}","userType":"admin","userName":"Akhil","no_of_deck":"${userInput.userName.split("_")[1]}"}`);
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

  let handlePass=()=>{
    socket.current.send(`{"action": "pass","playerNumber":"${playerIdentity}","userType":"user","userName":"${userInput.userName}"}`);
  }


  const handleChange = evt => {
    console.log("select tag testing   ===>",evt)
    if(evt.target!=undefined){
    const name = evt.target.name;
    const newValue = evt.target.value;
    setUserInput({
      [name]: newValue
    });
    }else{
      setUserInput({
        ["claimedCard"]: {value:evt.value,label:evt.value}
      })
    }
  }

  const arrObj=[
    {value:'KING',label:'KING'},
    {value:'QUEEN',label:'QUEEN'},
    {value:'JACK',label:'JACK'},
    {value:'10',label:'10'},
    {value:'9',label:'9'},
    {value:'8',label:'8'},
    {value:'7',label:'7'},
    {value:'6',label:'6'},
    {value:'5',label:'5'},
    {value:'4',label:'4'},
    {value:'3',label:'3'},
    {value:'2',label:'2'},
    {value:'ACE',label:'ACE'}]

  const isThisYourAction =currentPlayerInAction.includes("You're in Action Please Respond");
return (  
  <div className="col-md-12 sm-12">
  <div className="card bg-primary mainContent">
  <div className="bluff">
    <h3>Hello</h3>
    {isThisYourAction?<h2 className="blinking">{currentPlayerInAction}</h2>:<h2 className="blinkingGreen">{currentPlayerInAction}</h2>}
    
    {/* <p className="addIner blinking">{error[element.textfield]} </p> */}
    {/* <h3>{timeCount}</h3> */}
      {my_cards.length===0 && userInput.status==="ready_to_go" ?<h3>You are Ready to go...!! Admin is about to start the game and cards will appear in seconds</h3>:null}
      {my_cards.length===0 && userInput.status!=="ready_to_go"?
      <div className="a">
      <input type="text" placeholder="Enter your Name" value={userInput.userName} name="userName" onChange={handleChange}></input>
      <button onClick={()=>authenticateAdmin()}>submit</button>
      </div>
      :null}
       <h3>{serverMessageFromBluff}</h3>
      <div className="playingCards fourColours rotateHand">
<ul className="table">
      {my_cards ?my_cards.map((ele)=>{return !ele.isSelected ?  (
        
        <li onClick={()=>toggleCardSelection(ele.card) 
        }>
        <a className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
                </a>
        </li>
    ): (
     
      <li onClick={()=>toggleCardSelection(ele.card)}>
        <a style={{bottom: "1em",
      backgroundColor: "paleturquoise"}} className={`card rank-${findno(ele.card).isInteger ? findno(ele.card): findno(ele.card).toLowerCase()} ${findDesign(ele.card,false)}`} >
        <span class="rank">{findno(ele.card)}</span>{findDesign(ele.card,true)}<span class="suit"></span>
        </a>
        </li>
        )
      }): null}
      </ul>
        </div>
    {my_cards.length!=0?(
    <div className="mt-3 test" >
      <label>Claim to throw card</label>
      {card_to_throw.length!==0?<h3>Total card selected {card_to_throw.length}</h3>:null}
        
        <Select
        
          className=" adjustWidthForMultiSelect"
          name="claimedCard"
          // value={[userInput.claimedCard]}
          placeholder="Select an option to claim card that you are throwing (You could bluff also)"
          options={arrObj}
          onChange={(options) => {
            handleChange(options)
            // handleMultiChange(options, element.textfield);
            // handleChangeForOutput(options, element.textfield);
          }}
          isSearchable={true}
        />
      {card_to_throw.length!==0 && userInput.claimedCard.value!==undefined && userInput.claimedCard.value!==""?
      
      // <button disabled={!isThisYourAction} onClick={()=>throwCardsfn()}>Throw</button>
      <div className="col-md-12 addIn">
        <button
        disabled={!isThisYourAction} onClick={()=>throwCardsfn()}
          className="fixedDisplay adjustWidth mt-15"
        >
          Throw
        </button>
      </div>
      :null}
{currentPlayerInAction ?

  // <button disabled={!isThisYourAction} onClick={handlePass}>PASS</button>
  <div className="col-md-12 addIn">
        <button
        disabled={!isThisYourAction} onClick={()=>handlePass()}
          className="fixedDisplay adjustWidth mt-15"
        >
          PASS
        </button>
      </div>
:null
}
    {currentPlayerInAction?
    
  //   <button disabled={!isThisYourAction} onClick={()=>pickCards()}>Pick cards</button>
    <div className="col-md-12 addIn">
        <button
        disabled={!isThisYourAction} onClick={()=>pickCards()}
          className="fixedDisplay adjustWidth mt-15"
        >
          Pick cards
        </button>
      </div>
  :
  null}
    </div>
    ):null}
    </div>
    </div></div>
  );
}


  export default App;