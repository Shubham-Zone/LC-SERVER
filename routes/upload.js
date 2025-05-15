const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Collection = require('../models/Collection');

const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), async (req, res) => {
  console.log("New req", req.body);
  const file = req.file;
  const questions = [];
  const collectionId = uuidv4().slice(0, 8);
  

  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (row) => {
      questions.push({
        id: row.ID,
        title: row.Title,
        acceptance: row.Acceptance,
        difficulty: row.Difficulty,
        frequency: row.Frequency,
        url: row['Leetcode Question Link'],
      });
    })
    .on('end', async () => {
      const collection = new Collection({
        title: req.body.title || "Untitled",
        collectionId,
        email: req.user.email,
        questions,
      });

      await collection.save();
      res.json({ collectionId });
    });
});

module.exports = router;
