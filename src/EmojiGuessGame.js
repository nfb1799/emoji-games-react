import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

const emojiData = [
  { emoji: "😀", answer: "Grinning Face", options: ["Grinning Face", "Crying Face", "Angry Face", "Sleeping Face"] },
  { emoji: "🐶", answer: "Dog", options: ["Cat", "Dog", "Mouse", "Rabbit"] },
  { emoji: "🍕", answer: "Pizza", options: ["Burger", "Pizza", "Fries", "Ice Cream"] },
  { emoji: "⚽", answer: "Soccer Ball", options: ["Basketball", "Baseball", "Soccer Ball", "Tennis Ball"] },
  { emoji: "🚗", answer: "Car", options: ["Bus", "Bike", "Car", "Train"] },
];

function EmojiGuessGame() {
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleOptionClick = (option) => {
    setSelected(option);
    setShowAnswer(true);
    if (option === emojiData[current].answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setShowAnswer(false);
    if (current < emojiData.length - 1) {
      setCurrent(current + 1);
    } else {
      setCurrent(0);
      setScore(0);
    }
  };

  const { emoji, options, answer } = emojiData[current];

  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Emoji Guess Game
        </Typography>
        <Typography variant="h1" gutterBottom>
          {emoji}
        </Typography>
        <Box>
          {options.map((option) => (
            <Button
              key={option}
              variant={selected === option ? "contained" : "outlined"}
              color={
                showAnswer
                  ? option === answer
                    ? "success"
                    : option === selected
                    ? "error"
                    : "primary"
                  : "primary"
              }
              onClick={() => !showAnswer && handleOptionClick(option)}
              sx={{ m: 1, minWidth: 120 }}
              disabled={showAnswer}
            >
              {option}
            </Button>
          ))}
        </Box>
        {showAnswer && (
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {selected === answer ? "Correct! 🎉" : `Wrong! The answer was "${answer}".`}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: 2 }}>
          Score: {score}
        </Typography>
        {showAnswer && (
          <Button variant="contained" sx={{ mt: 2 }} onClick={handleNext}>
            {current < emojiData.length - 1 ? "Next" : "Restart"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmojiGuessGame;