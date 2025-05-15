const express = require('express');
const router = express.Router();
const Collection = require('../models/Collection');
const auth = require('../utils/authMiddleware');

// Get logged-in user's collections
router.get('/collections', auth, async (req, res) => {
  const collections = await Collection.find({ email: req.user.email });
  if (!collections.length) return res.status(404).json({ msg: "No collections found" });
  res.json(collections);
});

// Global route - everyone can access
router.get('/collections/global', async (req, res) => {
  const collections = await Collection.find({ email: "global"}); // or any static shared email
  if (!collections.length) return res.status(404).json({ msg: "No global collections" });
  res.json(collections);
});

// Get specific collection by ID (user only)
router.get('/collections/:collectionId', auth, async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userEmail = req.user?.email;

    // Try to find a collection owned by the user
    let collection = null;

    if (userEmail) {
      collection = await Collection.findOne({ collectionId, email: userEmail });
    }

    // If not found, try to fetch a public version
    if (!collection) {
      collection = await Collection.findOne({ collectionId, email: "global" });
    }

    if (!collection) {
      return res.status(404).json({ msg: "Not found" });
    }

    res.json(collection);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});


// Toggle done
router.post('/collections/toggle-done/:collectionId/:questionId', auth, async (req, res) => {
  const { collectionId, questionId } = req.params;
  const collection = await Collection.findOne({ collectionId, email: req.user.email });

  if (!collection) return res.status(404).json({ msg: "Not found" });

  const question = collection.questions.find(q => q.id == questionId);
  if (question) question.done = !question.done;

  await collection.save();
  res.json({ msg: "Updated", done: question.done });
});

// Toggle revision
router.post('/collections/toggle-revision/:collectionId/:questionId', auth, async (req, res) => {
  const { collectionId, questionId } = req.params;
  const collection = await Collection.findOne({ collectionId, email: req.user.email });

  if (!collection) return res.status(404).json({ msg: "Not found" });

  const question = collection.questions.find(q => q.id == questionId);
  if (question) question.revision = !question.revision;

  await collection.save();
  res.json({ msg: "Revision Toggled", revision: question.revision });
});

// Update note
router.post('/collections/note/:collectionId/:questionId', auth, async (req, res) => {
  const { collectionId, questionId } = req.params;
  const { note } = req.body;
  const collection = await Collection.findOne({ collectionId, email: req.user.email });

  if (!collection) return res.status(404).json({ msg: "Not found" });

  const question = collection.questions.find(q => q.id == questionId);
  if (question) question.note = note;

  await collection.save();
  res.json({ msg: "Note updated", note });
});

// Mark all done/undone
router.post('/collections/mark-all/:collectionId', auth, async (req, res) => {
  const { collectionId } = req.params;
  const { done } = req.body;

  const collection = await Collection.findOne({ collectionId, email: req.user.email });
  if (!collection) return res.status(404).json({ msg: "Not found" });

  collection.questions.forEach(q => q.done = done);
  await collection.save();

  res.json({ msg: `All marked as ${done ? 'done' : 'not done'}` });
});

module.exports = router;
