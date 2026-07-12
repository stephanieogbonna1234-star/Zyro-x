import { Game, Achievement, GameStats, UserProfile, AppSettings } from '../types';

export const INITIAL_GAMES: Game[] = [
  // --- PUZZLE ---
  {
    id: '2048',
    name: '2048',
    category: 'Puzzle',
    icon: 'Grid',
    description: 'Slide numbered tiles on a grid to combine them and create a tile with the number 2048.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Use arrow keys or swipe gestures to move all tiles in that direction.',
      'When two tiles with the same number touch, they merge into one with their sum.',
      'A new tile (2 or 4) appears randomly after each move.',
      'Reach the 2048 tile to win, but you can keep playing for high scores!'
    ]
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    category: 'Puzzle',
    icon: 'Hash',
    description: 'The classic logic-based, combinatorial number-placement puzzle. Fill a 9x9 grid so each column, row, and 3x3 subgrid contains all digits from 1 to 9.',
    difficulty: 'Hard',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Fill the grid so that every row, column, and 3x3 box contains numbers 1 to 9.',
      'No number can be repeated in the same row, column, or 3x3 box.',
      'Tap a cell, then tap a number to fill it.',
      'Use pencil mode to draft candidate numbers.'
    ]
  },
  {
    id: 'sliding_puzzle',
    name: 'Sliding Puzzle',
    category: 'Puzzle',
    icon: 'Shuffle',
    description: 'A classic 15-puzzle tile sliding game. Reorder scrambled tiles sequentially by utilizing the single empty space.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Tap tiles adjacent to the empty square to slide them into the empty space.',
      'Arrange all tiles in ascending numerical order starting from top-left (1, 2, 3...).',
      'The bottom-right square should end up empty.',
      'Solve it with the fewest moves and in the shortest time!'
    ]
  },
  {
    id: 'match3',
    name: 'Match-3 Candy POP',
    category: 'Puzzle',
    icon: 'Sparkles',
    description: 'Swap candies or jewels to form chains of 3 or more identical items to clear them from the board.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Tap or drag candies to swap them with adjacent ones.',
      'Match 3 or more of the same candies in a horizontal or vertical line to pop them.',
      'Pop 4 or 5 candies to create powerful cascading candy blasts.',
      'Clear the target score before running out of moves.'
    ]
  },
  {
    id: 'block_puzzle',
    name: 'Block Puzzle Blast',
    category: 'Puzzle',
    icon: 'Layers',
    description: 'Place colorful block shapes on the grid to create solid horizontal or vertical lines and clear them.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Drag block shapes from the bottom tray onto the 10x10 board.',
      'Create full rows or columns to clear them and score points.',
      'The game ends when there is no space left on the grid for the current block shapes.'
    ]
  },

  // --- ARCADE ---
  {
    id: 'snake',
    name: 'Retro Snake',
    category: 'Arcade',
    icon: 'Flame',
    description: 'Guide the hungry snake to eat glowing apples, grow longer, and avoid crashing into walls or your own tail.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Use arrow buttons or swipe gestures to steer the snake (Up, Down, Left, Right).',
      'Eat the red apples to grow longer and increase your score.',
      'Avoid running into the screen boundaries or colliding with the snake\'s own body.',
      'Adjust speed difficulty levels in settings to test your reflexes.'
    ]
  },
  {
    id: 'brick_breaker',
    name: 'Brick Breaker DX',
    category: 'Arcade',
    icon: 'Pocket',
    description: 'Bounce the ball off your paddle to break all the colored bricks on the screen without letting the ball fall.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Slide the paddle left and right at the bottom of the screen to bounce the falling ball.',
      'Break all bricks on the screen to progress to the next level.',
      'Catch falling power-ups like paddle enlargers or ball duplicators.',
      'If the ball falls past your paddle, you lose a life.'
    ]
  },
  {
    id: 'flappy_bird',
    name: 'Flappy Bird Neo',
    category: 'Arcade',
    icon: 'Navigation',
    description: 'Tap to flap your wings and fly through columns of pipes. Timing is everything in this incredibly addictive arcade challenge.',
    difficulty: 'Hard',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Tap or click the screen to flap wings and gain a quick boost of height.',
      'Let gravity pull you down, but avoid crashing into the ground.',
      'Fly precisely through the gaps in the green pipe pillars.',
      'Earn 1 point for every pipe gate successfully passed.'
    ]
  },
  {
    id: 'space_shooter',
    name: 'Star Defender',
    category: 'Arcade',
    icon: 'Rocket',
    description: 'An endless space retro shoot-\'em-up. Blast incoming alien invaders, collect fuel cubes, and score points!',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Move your starfighter left and right to dodge alien lasers.',
      'Press the Shoot button to fire plasma rays at invaders.',
      'Collect falling power cores and shields to survive longer.',
      'Face off against giant boss invaders at higher score intervals.'
    ]
  },

  // --- CASUAL ---
  {
    id: 'tic_tac_toe',
    name: 'Tic Tac Toe Duo',
    category: 'Casual',
    icon: 'X',
    description: 'The standard three-in-a-row paper-and-pencil game. Play offline against a smart AI opponent with adjustable difficulty levels.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'You are Player "X", and the computer AI is Player "O".',
      'Take turns placing your marks in an empty 3x3 grid cell.',
      'The first player to align 3 marks in a row (horizontal, vertical, or diagonal) wins!',
      'Select Hard or Expert mode to face an unbeatable Minimax algorithm.'
    ]
  },
  {
    id: 'memory_match',
    name: 'Memory Match Master',
    category: 'Casual',
    icon: 'HelpCircle',
    description: 'Test and train your short-term memory by matching pairs of cards in the shortest amount of time and moves.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'All cards start face down. Tap a card to flip it over and reveal its icon.',
      'Tap a second card to find its match. If the two icons are identical, they remain face up.',
      'If they do not match, both flip face down after a brief pause.',
      'Find all matching pairs on the board in the fewest moves to win.'
    ]
  },
  {
    id: 'rock_paper_scissors',
    name: 'Roshambo Duel',
    category: 'Casual',
    icon: 'Hand',
    description: 'The standard hand game. Choose Rock, Paper, or Scissors to beat the offline AI opponent in a series of rounds.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Choose one: Rock, Paper, or Scissors.',
      'Rock beats Scissors (crushes it).',
      'Paper beats Rock (wraps it).',
      'Scissors beat Paper (cut it).',
      'Defeat the computer in a race to 3 points!'
    ]
  },
  {
    id: 'hangman',
    name: 'Hangman Challenger',
    category: 'Casual',
    icon: 'Smile',
    description: 'Guess the hidden word letter-by-letter. Every incorrect guess draws another segment of the classic hangman scaffold.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'The blank blanks represent letters in a secret offline word.',
      'Tap letters on the keyboard to make a guess.',
      'If the letter is in the word, it fills the blanks. If not, a part of the hangman figure is drawn.',
      'Guess the word before the drawing is complete (6 wrong guesses maximum)!'
    ]
  },

  // --- CARD ---
  {
    id: 'blackjack',
    name: 'Vegas Blackjack 21',
    category: 'Card',
    icon: 'Coins',
    description: 'Feel the offline casino thrill. Play blackjack against the dealer, manage your chip stack, and hit 21!',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'The objective is to get a card total closer to 21 than the dealer, without going over.',
      'Aces are worth 1 or 11. Face cards are worth 10. Number cards are worth their value.',
      'Choose Hit to draw another card, or Stand to end your turn.',
      'Dealer must hit on soft 17 or lower.'
    ]
  },
  {
    id: 'solitaire',
    name: 'Klondike Solitaire',
    category: 'Card',
    icon: 'CreditCard',
    description: 'The ultimate card game of patience. Build four stacks of cards in ascending order from Ace to King by suit.',
    difficulty: 'Medium',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Arrange columns of cards in descending order and alternating colors (e.g. Red Queen on Black King).',
      'Move Aces to the foundation piles at the top.',
      'Build up foundations in ascending suit order (Ace to King).',
      'Flip cards from the stockpile to find more moves.'
    ]
  },

  // --- BOARD ---
  {
    id: 'chess',
    name: 'Grandmaster Chess',
    category: 'Board',
    icon: 'Shield',
    description: 'Play the royal game of strategy against a competent local chess engine. Test your tactical foresight and positional play.',
    difficulty: 'Hard',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Objective: Trap the opponent\'s King in checkmate so it has no legal moves.',
      'Each piece moves differently (Pawns forward, Knights in L-shapes, Bishops diagonally, etc.).',
      'Touch a piece to view all highlighted valid squares it can move to.',
      'Use tactical forks, pins, and skewers to capture the AI\'s pieces.'
    ]
  },
  {
    id: 'checkers',
    name: 'Classic Checkers',
    category: 'Board',
    icon: 'Grid',
    description: 'The ancient board game of checkers. Jump over opponent pieces to capture them, and promote your checkers to Kings.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Pieces move diagonally forward onto dark squares.',
      'Capture opponent checkers by jumping over them into an empty space immediately behind.',
      'Reach the opponent\'s back row to promote your checker to a "King", allowing diagonal backward movement.',
      'Win by capturing all opponent pieces or blocking them from moving.'
    ]
  },

  // --- SPORTS ---
  {
    id: 'penalty_shootout',
    name: 'Championship Penalty',
    category: 'Sports',
    icon: 'Trophy',
    description: 'Take on the goalie in a high-stakes football shootout. Flick the soccer ball into the corners of the goal net to score.',
    difficulty: 'Easy',
    bestScore: 0,
    playCount: 0,
    isFavorite: false,
    tutorial: [
      'Flick or drag the ball to direct your shot on goal.',
      'Time your shot carefully to bypass the moving goalkeeper AI.',
      'Aim for the extreme corners of the net for maximum chance of scoring.',
      'Get 5 penalty shots per round and see how many goals you can score!'
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Game',
    description: 'Play any offline game in the vault.',
    badge: 'Gamepad2',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Win your first game in GameVault.',
    badge: 'Trophy',
    points: 20,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'hundred_wins',
    title: 'Centurion Player',
    description: 'Accumulate 10 total game wins across any games.',
    badge: 'Milestone',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'score_1000',
    title: 'High Roller',
    description: 'Reach a score of 1000 or higher in any game (2048, Snake, Brick Breaker).',
    badge: 'Award',
    points: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1000
  },
  {
    id: 'daily_streak_3',
    title: 'Habitual Gamer',
    description: 'Keep a daily login streak of 3 days.',
    badge: 'Flame',
    points: 40,
    unlocked: false,
    progress: 1,
    maxProgress: 3
  },
  {
    id: 'blackjack_king',
    title: 'Blackjack Royalty',
    description: 'Win a Blackjack game with exactly 21 points.',
    badge: 'Coins',
    points: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'sudoku_solver',
    title: 'Sudoku Scholar',
    description: 'Win a classic game of Sudoku.',
    badge: 'Hash',
    points: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'collector',
    title: 'Vault Hoarder',
    description: 'Mark at least 3 games as favorites.',
    badge: 'Heart',
    points: 15,
    unlocked: false,
    progress: 0,
    maxProgress: 3
  }
];

export const INITIAL_STATS: GameStats = {
  gamesPlayed: 0,
  timePlayed: 0,
  wins: 0,
  losses: 0,
  highestScore: 0,
  dailyStreak: 1,
  lastPlayedDate: new Date().toISOString().split('T')[0],
  longestSession: 0
};

export const INITIAL_PROFILE: UserProfile = {
  username: 'Offline Vault Gamer',
  avatar: '🚀',
  level: 1,
  xp: 0,
  joinedAt: new Date().toLocaleDateString()
};

export const DEFAULT_SETTINGS: AppSettings = {
  darkMode: true,
  language: 'en',
  musicVolume: 50,
  soundVolume: 75,
  vibration: true,
  animations: true,
  highContrast: false,
  largeText: false
};
