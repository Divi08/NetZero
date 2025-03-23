// ---- File: server.js ----

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Path for the cache file
const CACHE_FILE_PATH = path.join(__dirname, 'cases-cache.json');

// Function to load and parse the CSV file
function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Function to load cached data
function loadCachedData() {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error reading cache:', error);
  }
  return null;
}

// Function to save data to cache
function saveToCache(data) {
  try {
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

// Function to generate case analysis using Gemini
async function generateCaseAnalysis(policy) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Concise environmental policy analysis:
    Title: ${policy.policy_title}
    Description: ${policy.policy_description}
    Sector: ${policy.sector}
    Objective: ${policy.policy_objective}

    Format:
    Impact: [brief impact summary]
    Environment: [key implications]
    Challenges: [main challenges]
    Solutions: [key recommendations]
    Timeline: [expected results timeline]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating analysis:', error);
    return 'Analysis not available';
  }
}

// Function to transform policy data into case format without AI analysis
function transformPolicyToCaseBasic(policy) {
  return {
    id: policy.policy_id,
    title: policy.policy_title,
    summary: policy.policy_description,
    category: policy.sector,
    facility: {
      REGISTRY_ID: policy.policy_id,
      FAC_NAME: policy.policy_name,
      FAC_CITY: policy.policy_city_or_local || 'N/A',
      FAC_STATE: policy.country,
      VIOLATIONS: [],
    },
    status: policy.policy_status,
    startDate: policy.start_date,
    endDate: policy.end_date,
    impact: policy.high_impact === 'true',
    objectives: policy.policy_objective,
    aiAnalysis: null
  };
}

// API endpoint to get all cases
app.get('/api/cases', async (req, res) => {
  try {
    // Try to load from cache first
    const cachedData = loadCachedData();
    if (cachedData) {
      return res.json(cachedData);
    }

    // If no cache, load and transform data
    const policies = await loadCSV(path.join(__dirname, 'policies.csv'));
    const cases = policies.map(transformPolicyToCaseBasic);
    
    // Save to cache
    saveToCache(cases);
    
    res.json(cases);
  } catch (err) {
    console.error('Error processing data:', err);
    res.status(500).json({ error: 'Failed to load cases' });
  }
});

// API endpoint to get a single case by ID
app.get('/api/cases/:id', async (req, res) => {
  try {
    // Try to load from cache first
    const cachedData = loadCachedData();
    let caseData;
    
    if (cachedData) {
      caseData = cachedData.find(c => c.id === req.params.id);
      if (caseData) {
        return res.json(caseData);
      }
    }

    // If not in cache, load from CSV
    const policies = await loadCSV(path.join(__dirname, 'policies.csv'));
    const policy = policies.find(p => p.policy_id === req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Case not found' });
    }

    caseData = transformPolicyToCaseBasic(policy);
    res.json(caseData);
  } catch (err) {
    console.error('Error processing data:', err);
    res.status(500).json({ error: 'Failed to load case' });
  }
});

// New endpoint for requesting AI analysis
app.post('/api/cases/:id/analyze', async (req, res) => {
  try {
    const policies = await loadCSV(path.join(__dirname, 'policies.csv'));
    const policy = policies.find(p => p.policy_id === req.params.id);
    
    if (!policy) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const analysis = await generateCaseAnalysis(policy);
    res.json({ analysis });
  } catch (err) {
    console.error('Error generating analysis:', err);
    res.status(500).json({ error: 'Failed to generate analysis' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
