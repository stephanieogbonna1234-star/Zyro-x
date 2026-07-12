import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/audio';
import { Game, AppSettings } from '../../types';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, Coins, User, Award, HelpCircle } from 'lucide-react';

interface GameBlackjackProps {
  game: Game;
  settings: AppSettings;
  onGameOver: (score: number, win: boolean) => void;
  onExit: () => void;
}

interface Card {
  suit: '♠' | '♥' | '♦' | '♣';
  value: string;
  score: number;
}

export default function GameBlackjack({
  game,
  settings,
  onGameOver,
  onExit
}: GameBlackjackProps) {
  const [bankroll, setBankroll] = useState(500);
  const [bet, setBet] = useState(0);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameStage, setGameStage] = useState<'betting' | 'player_turn' | 'dealer_turn' | 'ended'>('betting');
  const [message, setMessage] = useState('Place your chips to start!');
  const [showTutorial, setShowTutorial] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const simulatedSettings = {
    ...settings,
    soundVolume: soundEnabled ? settings.soundVolume : 0
  };

  const suits: Card['suit'][] = ['♠', '♥', '♦', '♣'];
  const values = [
    { name: 'A', score: 11 },
    { name: '2', score: 2 },
    { name: '3', score: 3 },
    { name: '4', score: 4 },
    { name: '5', score: 5 },
    { name: '6', score: 6 },
    { name: '7', score: 7 },
    { name: '8', score: 8 },
    { name: '9', score: 9 },
    { name: '10', score: 10 },
    { name: 'J', score: 10 },
    { name: 'Q', score: 10 },
    { name: 'K', score: 10 }
  ];

  const createDeck = () => {
    let newDeck: Card[] = [];
    suits.forEach((suit) => {
      values.forEach((v) => {
        newDeck.push({ suit, value: v.name, score: v.score });
      });
    });
    // Shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
  };

  const getHandTotal = (hand: Card[]): number => {
    let total = hand.reduce((acc, card) => acc + card.score, 0);
    let aces = hand.filter((card) => card.value === 'A').length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  };

  const initGame = () => {
    playSound('click', simulatedSettings);
    setShowTutorial(false);
    setGameStage('betting');
    setBet(0);
    setPlayerHand([]);
    setDealerHand([]);
    setMessage('Place your wager!');
    setDeck(createDeck());
  };

  useEffect(() => {
    if (bankroll <= 0 && gameStage === 'betting') {
      // Bankrupt rescue
      setBankroll(300);
      setMessage('House granted a $300 rescue chip!');
    }
  }, [bankroll, gameStage]);

  const handleBetChip = (amount: number) => {
    if (gameStage !== 'betting') return;
    if (bankroll >= amount) {
      setBet((prev) => prev + amount);
      setBankroll((prev) => prev - amount);
      playSound('click', simulatedSettings);
    }
  };

  const clearBet = () => {
    if (gameStage !== 'betting') return;
    setBankroll((prev) => prev + bet);
    setBet(0);
    playSound('click', simulatedSettings);
  };

  const dealHands = () => {
    if (bet === 0) {
      setMessage('Wager at least $10 to play!');
      playSound('bounce', simulatedSettings);
      return;
    }

    const currentDeck = [...deck];
    const pHand = [currentDeck.pop()!, currentDeck.pop()!];
    const dHand = [currentDeck.pop()!, currentDeck.pop()!];

    setPlayerHand(pHand);
    setDealerHand(dHand);
    setDeck(currentDeck);
    setGameStage('player_turn');
    playSound('powerup', simulatedSettings);

    const playerTotal = getHandTotal(pHand);
    const dealerTotal = getHandTotal(dHand);

    if (playerTotal === 21) {
      // Natural Blackjack!
      handleDealerTurn(pHand, dHand, currentDeck);
    } else {
      setMessage(`Hit or Stand? Hand value: ${playerTotal}`);
    }
  };

  const hitPlayer = () => {
    if (gameStage !== 'player_turn') return;

    const currentDeck = [...deck];
    const card = currentDeck.pop()!;
    const nextHand = [...playerHand, card];

    setPlayerHand(nextHand);
    setDeck(currentDeck);
    playSound('click', simulatedSettings);

    const total = getHandTotal(nextHand);
    if (total > 21) {
      // BUSTED
      setGameStage('ended');
      setMessage(`Busted! You went over 21. Dealer wins.`);
      playSound('lose', simulatedSettings);
    } else if (total === 21) {
      handleDealerTurn(nextHand, dealerHand, currentDeck);
    } else {
      setMessage(`Hit or Stand? Hand value: ${total}`);
    }
  };

  const standPlayer = () => {
    if (gameStage !== 'player_turn') return;
    handleDealerTurn(playerHand, dealerHand, deck);
  };

  const handleDealerTurn = (pHand: Card[], dHand: Card[], currentDeck: Card[]) => {
    setGameStage('dealer_turn');
    let dealer = [...dHand];
    let deckState = [...currentDeck];

    const playerTotal = getHandTotal(pHand);

    // Dealer draws to soft 17
    while (getHandTotal(dealer) < 17) {
      dealer.push(deckState.pop()!);
    }

    setDealerHand(dealer);
    setDeck(deckState);
    setGameStage('ended');

    const dTotal = getHandTotal(dealer);

    if (dTotal > 21) {
      setBankroll((prev) => prev + bet * 2);
      setMessage(`Dealer busted with ${dTotal}! You win double!`);
      playSound('win', simulatedSettings);
    } else if (dTotal > playerTotal) {
      setMessage(`Dealer scores ${dTotal} vs your ${playerTotal}. Dealer wins.`);
      playSound('lose', simulatedSettings);
    } else if (dTotal < playerTotal) {
      // Check for Blackjack
      const multiplier = playerTotal === 21 && pHand.length === 2 ? 2.5 : 2;
      setBankroll((prev) => prev + Math.floor(bet * multiplier));
      setMessage(`You won! ${playerTotal} vs Dealer's ${dTotal}.`);
      playSound('win', simulatedSettings);
    } else {
      setBankroll((prev) => prev + bet); // Push, get bet back
      setMessage(`Draw! Push at score ${playerTotal}.`);
      playSound('bounce', simulatedSettings);
    }
  };

  const getSuitColor = (suit: Card['suit']) => {
    return (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-slate-300';
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 p-4 relative font-sans overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-100 text-xs py-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="text-xs font-bold font-mono tracking-wider text-indigo-400 uppercase">
          Blackjack 21
        </span>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Tutorial panel */}
      {showTutorial && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-xl mb-4 select-none">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100 text-sm">How to Bet & Play</h3>
          </div>
          <ul className="text-xs text-slate-400 space-y-2 pl-1 list-none">
            {game.tutorial.map((step, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-indigo-400 font-bold font-mono">{(idx + 1).toString().padStart(2, '0')}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-800/80 my-1"></div>
          <button
            onClick={initGame}
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md uppercase tracking-wide cursor-pointer"
          >
            Enter Casino Vault
          </button>
        </div>
      )}

      {/* Balance & Chips dashboards */}
      {!showTutorial && (
        <div className="flex items-center justify-between mb-3 gap-3 select-none">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">CHIPS VAULT</span>
            <span className="text-lg font-bold text-yellow-400 flex items-center justify-center gap-1">
              <Coins className="w-4 h-4" /> ${bankroll}
            </span>
          </div>
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-center">
            <span className="text-[9px] text-slate-500 block">CURRENT WAGER</span>
            <span className="text-lg font-bold text-indigo-400">${bet}</span>
          </div>
        </div>
      )}

      {/* Gameplay view */}
      {!showTutorial && (
        <div className="flex-1 flex flex-col justify-between relative select-none">
          
          {/* Dealer's Cards */}
          <div className="bg-emerald-950/40 border border-emerald-900/30 rounded-2xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
              <span>DEALER HAND</span>
              <span>
                TOTAL:{' '}
                {gameStage === 'player_turn'
                  ? dealerHand[0]?.score || 0
                  : getHandTotal(dealerHand)}
              </span>
            </div>
            
            <div className="flex gap-2.5 min-h-[85px] justify-center items-center">
              {dealerHand.map((card, idx) => {
                const isHidden = gameStage === 'player_turn' && idx === 1;
                return (
                  <div
                    key={idx}
                    className={`w-14 h-20 rounded-xl border flex flex-col justify-between p-2 font-bold shadow-lg transition-all duration-300 ${
                      isHidden
                        ? 'bg-gradient-to-br from-indigo-700 to-indigo-900 border-indigo-400/30 flex items-center justify-center'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  >
                    {isHidden ? (
                      <span className="text-white text-lg font-mono">♠</span>
                    ) : (
                      <>
                        <span className={`text-xs ${getSuitColor(card.suit)}`}>{card.value}</span>
                        <span className={`text-2xl self-center ${getSuitColor(card.suit)}`}>{card.suit}</span>
                        <span className={`text-xs rotate-180 self-end ${getSuitColor(card.suit)}`}>{card.value}</span>
                      </>
                    )}
                  </div>
                );
              })}
              {dealerHand.length === 0 && (
                <span className="text-xs text-slate-600 font-mono italic">Waiting for wager...</span>
              )}
            </div>
          </div>

          {/* Interactive Messages banner */}
          <div className="text-center py-2 px-3 bg-slate-900/60 border border-slate-800 rounded-2xl font-semibold text-xs text-slate-200 shadow-md">
            {message}
          </div>

          {/* Player's Cards */}
          <div className="bg-indigo-950/40 border border-indigo-900/30 rounded-2xl p-3 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between text-[10px] text-indigo-400 font-mono">
              <span>YOUR HAND</span>
              <span>TOTAL: {getHandTotal(playerHand)}</span>
            </div>

            <div className="flex gap-2.5 min-h-[85px] justify-center items-center">
              {playerHand.map((card, idx) => (
                <div
                  key={idx}
                  className="w-14 h-20 rounded-xl border bg-slate-900 border-slate-700 flex flex-col justify-between p-2 font-bold shadow-lg"
                >
                  <span className={`text-xs ${getSuitColor(card.suit)}`}>{card.value}</span>
                  <span className={`text-2xl self-center ${getSuitColor(card.suit)}`}>{card.suit}</span>
                  <span className={`text-xs rotate-180 self-end ${getSuitColor(card.suit)}`}>{card.value}</span>
                </div>
              ))}
              {playerHand.length === 0 && (
                <span className="text-xs text-slate-600 font-mono italic">Waiting for deal...</span>
              )}
            </div>
          </div>

          {/* Betting Desk (Betting stage) or Controls Panel (Player turn stage) */}
          {gameStage === 'betting' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-3.5 flex flex-col gap-3 shadow-xl">
              <span className="text-[10px] text-slate-500 font-mono uppercase text-center block tracking-wide">
                PLACE WAGER CHIPS
              </span>
              <div className="flex justify-around">
                {([10, 25, 100, 250] as const).map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleBetChip(chip)}
                    disabled={bankroll < chip}
                    className={`w-12 h-12 rounded-full border-4 font-mono font-bold text-xs flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer ${
                      chip === 10
                        ? 'bg-blue-600 text-white border-blue-400'
                        : chip === 25
                        ? 'bg-emerald-600 text-white border-emerald-400'
                        : chip === 100
                        ? 'bg-red-600 text-white border-red-400 animate-pulse'
                        : 'bg-black text-yellow-400 border-yellow-500'
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    ${chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={clearBet}
                  disabled={bet === 0}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
                >
                  Clear Wager
                </button>
                <button
                  onClick={dealHands}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md uppercase tracking-wider cursor-pointer"
                >
                  Deal Cards
                </button>
              </div>
            </div>
          )}

          {/* Active Player Turn Controls */}
          {gameStage === 'player_turn' && (
            <div className="flex gap-3 px-1 mt-2">
              <button
                onClick={hitPlayer}
                className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                Hit (Card)
              </button>
              <button
                onClick={standPlayer}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider active:scale-95 cursor-pointer"
              >
                Stand (Stay)
              </button>
            </div>
          )}

          {/* Post Round controls */}
          {gameStage === 'ended' && (
            <div className="flex gap-3 px-1 mt-2">
              <button
                onClick={() => onGameOver(bankroll - 500, bankroll >= 500)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
              >
                Bank & Save
              </button>
              <button
                onClick={initGame}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wide cursor-pointer"
              >
                Next Hand
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
