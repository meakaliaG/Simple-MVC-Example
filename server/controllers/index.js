// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const { Cat, Dog } = models;

const hostIndex = async (req, res) => {
  let name = 'unknown';
  let dogName = 'unknown';

  try {
    const doc = await Cat.findOne({}, {}, {
      sort: { createdDate: 'descending' },
    }).lean().exec();
    const doc1 = await Dog.findOne({}, {}, {
      sort: { createdDate: 'descending' },
    }).lean().exec();

    if (doc) {
      name = doc.name;
    }
    if (doc1) {
      dogName = doc1.name;
    }
  } catch (err) {
    console.log(err);
  }

  res.render('index', {
    currentName: name,
    dogName,
    title: 'Home',
    pageName: 'Home Page',
  });
};

const hostPage1 = async (req, res) => {
  try {
    const docs = await Cat.find({}).lean().exec();
    return res.render('page1', { cats: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find cats' });
  }
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = async (req, res) => {
  // res.render('page3');
  try {
    const docs = await Dog.find({}).lean().exec();
    return res.render('page3', { dogs: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to find dogs' });
  }
};

// page4: show all dogs
const hostPage4 = async (req, res) => {
  try {
    const docs = await Dog.find({}).lean().exec();
    return res.render('page4', { dogs: docs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to retrieve dogs' });
  }
};

// create new Dog
const createDog = async (req, res) => {
  const { name, breed, age } = req.body;

  if (!name || !breed || !age) {
    return res.status(400).json({ error: 'Name, breed, and age are all required' });
  }

  try {
    const newDog = new Dog({ name, breed, age });
    await newDog.save();

    return res.status(201).json({
      name: newDog.name,
      breed: newDog.breed,
      age: newDog.age,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed to create dog' });
  }
};


// search for dog by name
const findDogByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ error: 'name query parameter is required' });
  }

  try {
    const updatedDog = await Dog.findOneAndUpdate(
      { name },
      { $inc: { age: 1 } },
      { new: true, lean: true },
    ).exec();

    if (!updatedDog) {
      return res.status(404).json({ error: 'Dog not found' });
    }

    return res.json({
      message: `${updatedDog.name}'s age has been increased by 1`,
      name: updatedDog.name,
      breed: updatedDog.breed,
      age: updatedDog.age,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'something went wrong updating dog' });
  }
};

// search for cat by name
const getName = async (req, res) => {
  const doc = await Cat.findOne({}).sort({ createdDate: 'descending' }).lean().exec();

  try {
    if (doc) {
      return res.json({ name: doc.name });
    }
    return res.status(404).json({ error: 'No cat found.' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong contacting the database' });
  }
};

// create new Cat
const setName = async (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname, lastname, and beds are all required' });
  }

  const catData = {
    name: `${req.body.firstname} ${req.body.lastname}`,
    bedsOwned: req.body.beds,
  };

  const newCat = new Cat(catData);

  try {
    await newCat.save();
    return res.status(201).json({
      name: newCat.name,
      beds: newCat.bedsOwned,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'failed to create cat' });
  }
};

const searchName = async (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  let doc;
  try {
    doc = await Cat.findOne({ name: req.query.name }).exec();
  } catch (err) {
    console.log(err);
    return res.status(404).json({ error: 'Something went wrong' });
  }

  if (!doc) {
    return res.status(404).json({ error: 'No cats found' });
  }

  return res.json({ name: doc.name, beds: doc.bedsOwned });
};

const updateLast = (req, res) => {
  const updatePromise = Cat.findOneAndUpdate({}, { $inc: { bedsOwned: 1 } }, {
    returnDocument: 'after',
    sort: { createdDate: 'descending' },
  }).lean().exec();

  updatePromise.then((doc) => res.json({
    name: doc.name,
    beds: doc.bedsOwned,
  }));

  updatePromise.catch((err) => {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  });
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  findDogByName,
  createDog,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
};
