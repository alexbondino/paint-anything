var spawn = require('node:child_process').spawn;
var os = require('os');

// Run command depending on the OS
let cmd = null;
if ((os.type() === 'Linux') || (os.type()=='Darwin')) 
   cmd = spawn("python3 -m venv venv && . ./venv/bin/activate && cd ../backend/app && pip install -r requirements.txt", [], {shell:true}); 
else if (os.type() === 'Windows_NT') 
   cmd = spawn("python3 -m venv venv && venv\\Scripts\\activate && cd ..\\backend\\app && pip install -r requirements.txt",[],{shell:true});
else
   throw new Error("Unsupported OS found: " + os.type());

cmd.stdout.on('data', (data) => {
  console.log(`${data}`);
});

cmd.stderr.on('data', (data) => {
  console.error(`${data}`);
});

cmd.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
}); 
