import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

const emojiPuzzles = [
  { emojis: "🦁👑", answer: "lion king" },
  { emojis: "🐼🥋", answer: "kung fu panda"},
  { emojis: "⚡🚗", answer: "lightning mcqueen" },
  { emojis: "🧽🍍👖", answer: "spongebob squarepants" },
  { emojis: "🦇🦸‍♂️", answer: "batman" },
  { emojis: "🕷️🧑", answer: "spiderman" },
  { emojis: "🍄👨🏻‍🔧", answer: "mario" },
  { emojis: "🦔💨", answer: "sonic" },
  { emojis: "👸🍑", answer: "princess peach" },
  { emojis: "⚡🐭", answer: "pikachu" },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function EmojiGuessGame() {
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [guess, setGuess] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shuffledPuzzles, setShuffledPuzzles] = useState(() => shuffleArray(emojiPuzzles));
  const [completed, setCompleted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const answer = shuffledPuzzles[current].answer.toLowerCase().replace(/[^a-z0-9 ]/gi, "");
    const userGuess = guess.trim().toLowerCase().replace(/[^a-z0-9 ]/gi, "");
    const correct = userGuess === answer;
    setIsCorrect(correct);
    setShowAnswer(true);
    if (correct) setScore(score + 1);
  };

  const handleNext = () => {
    setGuess("");
    setShowAnswer(false);
    setIsCorrect(false);
    if (current < shuffledPuzzles.length - 1) {
      setCurrent(current + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setShuffledPuzzles(shuffleArray(emojiPuzzles));
    setCurrent(0);
    setScore(0);
    setGuess("");
    setShowAnswer(false);
    setIsCorrect(false);
    setCompleted(false);
  };

  const { emojis, answer } = shuffledPuzzles[current] || {};

  return (
    <Card sx={{ minWidth: 275, mb: 2, borderRadius: 4, boxShadow: 6 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Guess the Popular Character!
        </Typography>
        {completed ? (
          <>
            <Typography variant="h2" color="success.main" sx={{ mt: 2, mb: 2 }}>
              🎉 Victory! You completed all puzzles! 🎉
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Final Score: {score} / {shuffledPuzzles.length}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleRestart}>
              Play Again
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h1" gutterBottom>
              {emojis}
            </Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 2 }}>
                <input
                  type="text"
                  value={guess}
                  onChange={e => setGuess(e.target.value)}
                  disabled={showAnswer}
                  placeholder="Type your guess..."
                  style={{
                    fontSize: '1.2rem',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    width: '220px',
                    outline: 'none',
                  }}
                />
                <Button type="submit" variant="contained" disabled={showAnswer || !guess.trim()}>
                  Submit
                </Button>
              </Box>
            </form>
            {showAnswer && (
              <Typography variant="subtitle1" sx={{ mt: 2 }} color={isCorrect ? "success.main" : "error.main"}>
                {isCorrect ? "Correct! 🎉" : `Wrong! The answer was "${answer}".`}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Score: {score}
            </Typography>
            {showAnswer && (
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleNext}>
                {current < shuffledPuzzles.length - 1 ? "Next" : "Finish"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default EmojiGuessGame;