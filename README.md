Hello there!

### How to use the code:
1. To parse **dump.txt** file and import data into the db, you can use endpoint 'http://localhost:3000/data/import', GET method without params.
2. To get employees with their rewards, you can use endpoint 'http://localhost:3000/data/rewards', GET method with 2 optional params:
   - 'minDonation' - number (>= 1) that sets employees' minimal donation in order to get remuneration (100 by default);
   - 'rewardPool' - number (>= 1) that sets reward pool from which employees get their rewards (10000 by default).

### Questions and answers:
   - *How to change the code to support different file versions?* - 
In case there's other .txt file hierarchy or structure, only manually recheck new one and change some code to support different format, as it can be done only manually. 
If it's a CSV, XML etc. type of file, you can use different parsers that are provided in various libraries.
   - *How the import system will change if data on exchange rates disappears from the file, and it will need to be received asynchronously (via API)?* -
In this case all rates data should be first received via the endpoint, imported into the db, and then used in rewards calculations.
   - *In the future the client may want to import files via the web interface, how can the system be modified to allow this?* -
Nest.js provides decorators, that allow you to receive files via web interface, then you can parse it and do whatever needed just like in this code.