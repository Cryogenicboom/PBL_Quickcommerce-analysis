const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { parse } = require('csv-parse/sync');
const axios = require('axios');

const upload = multer({ dest: 'uploads/' });
const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

// Optional: server-side parse for XLSX or large CSV (frontend fallback)
app.post('/upload-raw-file', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'no file' });

    // if CSV: parse with csv-parse
    if (file.originalname.toLowerCase().endsWith('.csv')) {
      const txt = fs.readFileSync(file.path, 'utf8');
      const rows = parse(txt, { columns: true, skip_empty_lines: true });
      fs.unlinkSync(file.path);
      return res.json({ rows, columns: Object.keys(rows[0] || {}) });
    } else {
      // For XLSX, add 'xlsx' parser if needed
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Only CSV server-side parsing implemented in template. Add xlsx parser.' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server parse failed' });
  }
});

// AI insights endpoint - receives a sample of rows + analysis summary
app.post('/ai-insights', async (req, res) => {
  try {
    const { sample, summary, mapping } = req.body || {};
    const prompt = buildPrompt(sample || [], summary || {}, mapping || {});

    // Use server-side API key only (do NOT hardcode keys in source)
    const apiKey = process.env.GENERATIVE_API_KEY;

    if (apiKey) {
      try {
        // Example call to Google Generative Language (adjust as needed)
        const url = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${apiKey}`;
        const aiPayload = { prompt: { text: prompt }, maxOutputTokens: 512, temperature: 0.2 };

        const aiResp = await axios.post(url, aiPayload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000
        });

        const generatedText =
          aiResp?.data?.candidates?.[0]?.content ||
          aiResp?.data?.output?.[0]?.content ||
          (typeof aiResp?.data === 'string' ? aiResp.data : JSON.stringify(aiResp.data));

        const parsed = {
          insightsText: (generatedText || '').slice(0, 2000),
          recommendations: [],
          explanations: (generatedText || '')
        };

        return res.json(parsed);
      } catch (apiErr) {
        console.error('Generative API call failed:', apiErr?.message || apiErr);
        // fall through to simulated response
      }
    } else {
      console.warn('No GENERATIVE_API_KEY found in environment; returning simulated response.');
    }

    // Fallback simulated response
    const simulatedResponse = {
      insightsText: `Detected ${summary?.rowCount || 0} rows. Top numeric columns: ${(summary?.numericColumns || []).join(', ')}.`,
      recommendations: [
        'Investigate inventory low signals for top 3 products.',
        'Consider increasing ad spend on top performing category.'
      ],
      explanations: 'Correlations detected suggest price is negatively correlated with volume in some categories.'
    };

    return res.json(simulatedResponse);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'ai insights generation failed' });
  }
});

function buildPrompt(sample, summary, mapping) {
  return `
You are a data analyst assistant. The user uploaded a dataset with ${summary.rowCount || 0} rows.
Columns (numeric): ${(summary.numericColumns || []).join(', ')}

Top products (sample): ${(summary.topProducts || []).map(t => t[0]).slice(0,5).join(', ') || 'N/A'}

Provide:
1) A concise executive summary (3-4 sentences).
2) Top 5 insights with reasons and supporting evidence (reference sample rows where relevant).
3) Actionable recommendations (prioritized).
4) Suggested next analyses and potential pitfalls in the data.

Sample rows (first 20): ${JSON.stringify((sample || []).slice(0, 20))}

Be concise and label sections clearly.
  `;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('AI server running on', PORT));
