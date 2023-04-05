import express from 'express';
import expressWs from 'express-ws';
import { spawn } from 'child_process';
import fs from 'fs';

const app = express();
expressWs(app);
let chatLog = [];

let clients = [];
let kill = false;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Simple Form</title>
        <style>
        body {
            background-color: #f5f5f5; /* or any other color you prefer */
          }
    
          #input {
            position: absolute;
            bottom: 50px; /* Adjust the bottom position to create space for the buttons */
            left: 40px;
            width: calc(100% - 100px);
          }
    
          #answer {
            position: absolute;
            bottom: 150px; /* Adjust the bottom position to place it above the input element and below the buttons */
            left: 10px;
            width: calc(100% - 100px);
          }

          #answer-div{
            overflow-y: overlay;
          }
    
          button {
            position: absolute;
            bottom: 5px;
            width: 100px;
            height: 40px;
          }
    
          #stop-btn {
            right: 110px; /* Adjust the right position to place it next to the submit button */
          }
          #sb-btn {
            left: 70px;
          }
        </style>
        </head>
        <body>
        <div id="answer-div">
        <p id="answer"></p>
        </div>
        <form>
        <textarea id="input" name="input" rows="6" cols="25"></textarea><br><br>
        <button id="sb-btn" type="button" onclick="submitForm()">Submit</button>
        <button id="stop-btn" type="button" onclick="sendKill()">Stop</button>
        </form>
        <script>
        // Create a WebSocket connection
        const ws = new WebSocket('ws://localhost:5000/call-info');

        // Log any messages received from the server
        ws.addEventListener('message', event => {
            const answer = document.getElementById('answer');
            answer.innerHTML += event.data;
        });

        function sendKill(){
            fetch('http://localhost:5000/kill')
        }

        function submitForm() {
            const input = document.getElementById('input').value;
            const answer = document.getElementById('answer');
            answer.innerHTML += "<br>" + "Human: " + input + "<br>";
            ws.send(answer.innerText + '');
            document.getElementById('input').value = '';
        }
        </script>
        </body>
        </html>
      `;
  res.end(html);
});

app.get('/kill', (req, res) => {
  console.log('kill');
  kill = true;
  res.end();
});

app.ws('/call-info', (ws, req) => {
  console.log('WebSocket connection established.');
  // const formattedData = chatLog.replace(/\n/g, '<br>');
  // ws.send(chatLog);
  clients.push(ws);

  ws.on('message', (msg) => {
    kill = false;
    chatLog = msg;
    // fs.writeFileSync('./prompt/prompt.txt', chatLog);

    function runCommand(msg) {
      console.log(msg);
      const cmd = './chat';
      const args = ['-p', chatLog];
      const child = spawn(cmd, args);

      child.stdout.on('data', (data) => {
        if (kill) {
          child.kill();
          kill = false;
        }
        ws.send(data.toString() + '');
      });
    }
    runCommand(msg);
  });

  ws.on('close', () => {
    clients = clients.filter((client) => client !== ws);
    console.log('WebSocket connection closed.');
  });
});

app.listen(5000, () => {
  console.log('HTTP server listening on port 5000.');
  chatLog = fs.readFileSync('./prompt/prompt.txt', 'utf8');
});
