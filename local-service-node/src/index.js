const express = require('express');
const cors = require('cors');
const requestRoutes = require('./routes/request.routes');
const groupRoutes = require('./routes/group.routes');
const operationsRoutes = require('./routes/operations.routes');


const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'local-service-node' });
});

app.use('/api/requests', requestRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/operations', operationsRoutes);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Local service running on http://localhost:${PORT}`);
  });
}

module.exports = app;
