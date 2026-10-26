import { Link } from 'react-router-dom';

const GAMES = [
  { id: 'call-break', name: 'Call Break', description: 'Bid tricks and play a classic partnership-free trick-taking game.', players: '4', difficulty: 'Medium' },
  { id: 'dhumbal', name: 'Dhumbal / Jhyap', description: 'Reduce hand value by discarding and drawing strategically.', players: '2-6', difficulty: 'Easy' },
  { id: 'teen-patti', name: 'Teen Patti', description: 'Three-card poker style game with virtual chips.', players: '3-6', difficulty: 'Easy' },
  { id: 'in-between', name: 'In Between', description: 'Bet on whether the third card falls between two cards.', players: '2-8', difficulty: 'Easy' },
  { id: 'jut-patti', name: 'Jut Patti', description: 'Matching and set-building card game.', players: '2-4', difficulty: 'Medium' },
  { id: 'kitti', name: 'Kitti / Kitty', description: 'Group cards into valid sets and sequences.', players: '2-4', difficulty: 'Medium' },
  { id: 'fanash', name: 'Fanash', description: 'Hand ranking and comparison game.', players: '2-6', difficulty: 'Hard' },
  { id: 'gulaam-chor', name: 'Gulaam Chor', description: 'Chase the joker and avoid being left with the unpaired card.', players: '3-5', difficulty: 'Easy' },
  { id: 'twenty-nine', name: '29 / Twenty-Nine', description: 'Partnership trick-taking with bidding.', players: '4', difficulty: 'Hard' },
  { id: 'marriage', name: 'Marriage', description: 'Nepali melding and sequence game.', players: '2-4', difficulty: 'Hard' },
];

export function Games() {
  return (
    <div>
      <h1>Games</h1>
      <p>Choose a traditional South Asian card game to play against bots or locally.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        {GAMES.map(game => (
          <div key={game.id} className="card">
            <h3>{game.name}</h3>
            <p style={{ color: 'var(--textMuted)' }}>{game.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0', fontSize: '0.9rem' }}>
              <span>{game.players} players</span>
              <span>{game.difficulty}</span>
            </div>
            <Link to={game.id === 'call-break' ? '/play/call-break' : '#'}>
              <button className="primary" style={{ width: '100%' }} disabled={game.id !== 'call-break'}>
                {game.id === 'call-break' ? 'Play Now' : 'Coming Soon'}
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
