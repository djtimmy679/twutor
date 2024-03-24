const { MongoClient } = require('mongodb');
const faker = require('faker');
require('dotenv').config();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function generateFakeData() {
  try {
    await client.connect();
    const database = client.db('UserDB');
    const users = database.collection('users');

    // Number of fake users you want to create
    const numberOfUsers = 2;
    const subjectsArray = [
        "Algebra 1",
        "Geometry",
        "Algebra 2",
        "Pre-Calculus",
        "AP Calculus AB",
        "AP Calculus BC",
        "AP Biology",
        "AP Chemistry",
        "AP Physics 1",
        "AP Physics 2",
        "AP Physics C",
        "Calculus", // Note: The original value was "Chemistry", but the text said "Calculus"
        "AP Environmental Science",
        "AP World History",
        "AP US History",
        "AP European History",
        "AP Psychology",
        "AP Human Geography",
        "AP Economics (Macro & Micro)",
        "AP Government and Politics",
        "AP English Language and Composition",
        "AP English Literature and Composition"
    ];
    
    const fakeUsers = [];

    for (let i = 0; i < numberOfUsers; i++) {
      const first_name = faker.name.firstName;
      const last_name = faker.name.lastName;
      const fakeUser = {
        firstName: first_name,
        lastName: last_name,
        email: faker.internet.email(first_name, last_name),
        phone: faker.phone.phoneNumber(),
        subjects: subjectsArray.map(subject => faker.random.boolean() ? subject : null).filter(Boolean), // Randomly assigns subjects
        role: faker.random.arrayElement(['Student', 'Tutor']), // Randomly assigns role
      };
      fakeUsers.push(fakeUser);
    }

    await users.insertMany(fakeUsers);
    console.log(`Inserted ${numberOfUsers} fake users.`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

generateFakeData();
