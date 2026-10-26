export function HowToPlay() {
  return (
    <div>
      <h1>How to Play</h1>
      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Call Break</h2>
        <p><strong>Objective:</strong> Win exactly the number of tricks you bid.</p>
        <p><strong>Players:</strong> 4</p>
        <p><strong>Deck:</strong> Standard 52-card deck. Cards dealt 13 to each player.</p>
        <p><strong>Bidding:</strong> Each player bids the number of tricks (0-13) they expect to win. Bids are made in turn.</p>
        <p><strong>Play:</strong> Highest card of the led suit wins the trick, or a trump (spades) if played. Lead player of next trick is the winner of the previous.</p>
        <p><strong>Scoring:</strong> If you make your bid exactly, you score your bid points. If you overtrick, you get 0.1 per overtrick. Undertricks lose 1 point per undertrick.</p>
        <p><strong>Note:</strong> Rules can vary by region. This implementation uses a common competitive variant.</p>
      </section>
      <section className="card">
        <h2>Other Games</h2>
        <p>Detailed rules for Dhumbal, Teen Patti, In Between, Jut Patti, Kitti, Fanash, Gulaam Chor, 29, and Marriage will be available as each game is completed. All games use virtual chips only — no real-money gambling.</p>
      </section>
    </div>
  );
}
