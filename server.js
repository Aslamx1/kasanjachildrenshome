require('dotenv').config();
const { createApp } = require('./server/app');

const PORT = process.env.PORT || 3000;
const app = createApp({ serveStatic: true });

app.listen(PORT, () => {
  console.log(`KCH Admin System running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
