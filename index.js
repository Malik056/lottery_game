const fs = require("fs");

const instance = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function hasDuplicates(arr) {
  return arr.length !== new Set(arr).size;
}

async function quickPlayGames(numberOfGames) {
  var totalWins = 0;
  var totalRewards = 0;
  fs.writeFileSync("output.txt", "Scores: ");
  for (var i = 0; i < numberOfGames; i++) {
    var result = await playgame(getRandomNums().join(" "), false);
    fs.appendFileSync("output.txt", `${result} `);
    totalRewards = totalRewards + result;
    if (result != 0) {
      totalWins = totalWins + 1;
    }
  }
  fs.appendFileSync(
    "output.txt",
    `
Total Reward: ${totalRewards}
Total Games: ${numberOfGames}
Total Wins: ${totalWins}
(Wins/Games)%: ${(totalWins / numberOfGames).toFixed(4) * 100}%
`
  );
  console.log(
    `Successfully completed ${numberOfGames} games, stats saved in output.txt`
  );
}

function takeNumberOfGames() {
  const inputGames = async (answer) => {
    if (!answer.match(/^\d+$/g)) {
      console.log("Invalid input format, please enter an interger");
      takeNumberOfGames();
      return;
    }
    const result = parseInt(answer);
    if (!result) {
      console.log("Wrong option selected");
      takeNumberOfGames();
      return;
    }
    quickPlayGames(result);
    await delay(2000);
    printMenu();
  };
  instance.question("Enter number of games to play: ", inputGames);
}

function takeManualNumbers() {
  instance.question("Please pick six balls from the range 1-59: ", playgame);
}

function getRandomNums() {
  const randoms = [];
  for (var i = 0; i < 6; i++) {
    const number = Math.floor(Math.random() * 58 + 1);
    if (randoms.includes(number)) {
      i--;
    } else {
      randoms.push(number);
    }
  }
  return randoms;
}

const playgame = async (value, doPrint = true) => {
  var answer = value;
  if (answer) {
    answer = answer.replace("\n", "").replace(/,/g, " ").replace(/ +/g, " ");
    const result = answer.match(/(\d+ ){5}\d+/);
    if (!result) {
      console.log("Invalid input format!");
      takeManualNumbers();
      return;
    }
    const selectedNumbers = answer.split(" ").map((e) => parseInt(e));
    for (var i = 0; i < selectedNumbers.length; i++) {
      if (selectedNumbers[i] > 59 || selectedNumbers[i] < 1) {
        console.log("Numbers must be between 1-59!");
        takeManualNumbers();
        return;
      }
    }
    if (hasDuplicates(selectedNumbers)) {
      console.log("Input has duplicate numbers!");
      takeManualNumbers();
      return;
    }
    const randoms = getRandomNums();
    if (doPrint) {
      console.log("Drawing Balls ...");
      await delay(2000);
      console.log("Balls drawn: ", randoms);
    }
    const filteredArray = randoms.filter((value) =>
      selectedNumbers.includes(value)
    );
    if (doPrint) {
      if (filteredArray.length == 0) {
        console.log("No matching balls");
      } else {
        console.log(
          `${filteredArray.length} matching ball${
            filteredArray.length == 1 ? "" : "s"
          }`
        );
      }
    }
    var reward =
      filteredArray.length == 3
        ? 50
        : filteredArray.length == 4
        ? 100
        : filteredArray.length == 5
        ? 200
        : filteredArray.length == 6
        ? 500
        : 0;
    var output;
    if (reward != 0) {
      output = `\nYou won a reward of $ ${reward}\n`;
    } else {
      output = "\nBetter luck next time\n";
    }
    if (doPrint) {
      console.log(output);
      await delay(2000);
      printMenu();
    } else {
      return reward;
    }
  }
};

const optionSelection = async (answer) => {
  console.log("");
  const matched = RegExp(/^\d$/g).test(answer);

  if (!matched) {
    console.log("Invalid input format, please select an option from 1-5\n");
    printMenu();
    return;
  }
  const result = parseInt(answer);
  if (!result || result > 5 || result < 1) {
    console.log("Wrong option selected");
    printMenu();
    return;
  }
  if (result == 1) {
    takeManualNumbers();
  } else if (result == 2) {
    const randoms = getRandomNums();
    console.log("Picked Balls: ", randoms);
    await playgame(randoms.join(" "));
  } else if (result == 3) {
    printHelp();
    await delay(2000);
    printMenu();
  } else if (result == 4) {
    takeNumberOfGames();
  } else {
    instance.close();
    return;
  }
  printMenu();
};

function printHelp() {
  console.log(
    `
First pick six ball by using one of the method above.
The program will then generate 6 random numbers
and cout how many balls were picked by you matches the generated balls.
The more matching balls the more the reward.
    
    `
  );
}

function printMenu() {
  instance.question(
    `
1. Manual Pick - pick 6 ball
2. Luck Dip - pick six balls randomly
3. Start Game
4. Quick Run: input number of games to be played with random balls picked
5. Exit Game

Select a option: `,
    optionSelection
  );
}
// console.log('1'.match(/^\d+$/));
printMenu();
