require('dotenv').config();
const express = require('express');
const cors = require('cors');
const prisma = require('./prisma/client');
const authRoutes = require('./routes/auth');
const complaintsRoutes = require('./routes/complaints');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

app.get('/site-content', async (req, res, next) => {
  try {
    const content = await prisma.siteContent.findMany();
    const values = Object.fromEntries(content.map((item) => [item.key, item.value]));
    res.json({
      banner: values.banner || 'Karnataka Sarkara · BBMP',
      tagline: values.tagline || 'Report civic issues. Track them to resolution.',
      description: values.description || 'Register a complaint about a civic issue in your ward.',
    });
  } catch (err) {
    next(err);
  }
});

app.use('/auth', authRoutes);
app.use('/complaints', complaintsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));