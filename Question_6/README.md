# Question 6: Free API Utilities (Frontend & Backend)

## Objective
Demonstrate calling free public APIs for useful utilities from **both the Frontend and Backend**:
1. **From Backend (Express + Axios)**: Live Currency Exchange Rate Converter (calls `https://open.er-api.com/v6/latest/USD`).
2. **From Frontend (Browser JavaScript `fetch`)**: Live City Weather Utility (calls `https://api.open-meteo.com/v1/forecast`) and Random Joke Utility (calls `https://official-joke-api.appspot.com/random_joke`).
3. Results presented in clean, well-formatted HTML tables.

---

## File Structure
```text
Question_6/
├── package.json          # Express and Axios dependencies
├── server.js             # Express server with backend API route (/api/currency-convert)
└── views/
    └── index.ejs         # Web interface showcasing both Backend and Frontend API calls
```

---

## Step-by-Step Code Walkthrough

1. **Backend API Call (`server.js`)**:
   - The user selects currencies and submits an amount.
   - The browser sends a GET request to `/api/currency-convert?amount=100&base=USD&target=INR`.
   - Node.js utilizes `axios.get('https://open.er-api.com/v6/latest/USD')` on the server side to fetch live rates.
   - Calculates `amount * rate` and returns the sanitized JSON response back to the client.

2. **Frontend Direct API Call (`views/index.ejs`)**:
   - The user chooses a city from the dropdown.
   - Browser client-side JavaScript calls `fetch('https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current_weather=true')` directly over HTTPS.
   - Reads the returned temperature and wind speed and dynamically populates the HTML table elements.

3. **Comparison / Concept**:
   - **Backend API consumption**: Best when API keys or secret credentials must be protected, or when caching and data transformation are required.
   - **Frontend API consumption**: Best for public data with CORS support where direct client rendering avoids server overhead.

---

## How to Install and Run

1. Open terminal and navigate to the `Question_6` folder:
   ```bash
   cd Question_6
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3006
   ```
