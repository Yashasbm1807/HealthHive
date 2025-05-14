// Import the MongoClient class from the MongoDB driver to interact with the MongoDB database.
import { MongoClient } from 'mongodb';
// Import the MongoDB configuration settings from the specified file.
import { mongoConfig } from './config/settings.js';
// Import functions to establish and close the MongoDB database connection.
import { dbConnection, closeConnection } from './config/mongoConnection.js';

// Define an array of objects, each representing a wellness place with its details.
const seedData = [
  {
    name: "Serenity Yoga Studio",
    type: "Yoga Studio",
    servicesOffered: ["Hatha Yoga", "Vinyasa Yoga", "Meditation"],
    address: "123 Main St",
    city: "Hoboken",
    description: "A calming yoga studio offering daily classes for all levels.",
    tags: ["yoga", "mindfulness", "meditation"],
    dateAdded: new Date("2025-01-01"),
    averageRating: 4.5,
    reviewCount: 20
  },
  {
    name: "Vitality Spa",
    type: "Spa",
    servicesOffered: ["Massage", "Facial", "Sauna"],
    address: "456 Elm St",
    city: "Jersey City",
    description: "Luxurious spa with a range of relaxation treatments.",
    tags: ["spa", "relaxation", "wellness"],
    dateAdded: new Date("2025-01-02"),
    averageRating: 4.8,
    reviewCount: 15
  },
  {
    name: "FitZone Gym",
    type: "Gym",
    servicesOffered: ["Weight Training", "Cardio", "Personal Training"],
    address: "789 Oak Ave",
    city: "Newark",
    description: "Modern gym with state-of-the-art equipment and trainers.",
    tags: ["fitness", "gym", "strength"],
    dateAdded: new Date("2025-01-03"),
    averageRating: 4.2,
    reviewCount: 25
  },
  {
    name: "Mindful Meditation Center",
    type: "Meditation Center",
    servicesOffered: ["Guided Meditation", "Mindfulness Workshops"],
    address: "101 Pine Rd",
    city: "Montclair",
    description: "A serene space for meditation and mindfulness practice.",
    tags: ["meditation", "mindfulness", "wellness"],
    dateAdded: new Date("2025-01-04"),
    averageRating: 4.7,
    reviewCount: 12
  },
  {
    name: "Green Leaf Wellness",
    type: "Holistic Center",
    servicesOffered: ["Acupuncture", "Herbal Therapy", "Reiki"],
    address: "234 Birch Ln",
    city: "Hoboken",
    description: "Holistic healing with personalized wellness plans.",
    tags: ["holistic", "acupuncture", "reiki"],
    dateAdded: new Date("2025-01-05"),
    averageRating: 4.3,
    reviewCount: 18
  },
  {
    name: "Pure Bliss Yoga",
    type: "Yoga Studio",
    servicesOffered: ["Ashtanga Yoga", "Yin Yoga", "Restorative Yoga"],
    address: "567 Cedar St",
    city: "Jersey City",
    description: "Yoga studio focusing on balance and restoration.",
    tags: ["yoga", "wellness", "balance"],
    dateAdded: new Date("2025-01-06"),
    averageRating: 4.6,
    reviewCount: 22
  },
  {
    name: "Harmony Spa",
    type: "Spa",
    servicesOffered: ["Hot Stone Massage", "Aromatherapy", "Body Scrub"],
    address: "890 Maple Dr",
    city: "Newark",
    description: "A tranquil spa for ultimate relaxation.",
    tags: ["spa", "massage", "aromatherapy"],
    dateAdded: new Date("2025-01-07"),
    averageRating: 4.9,
    reviewCount: 10
  },
  {
    name: "Peak Pulse Gym",
    type: "Gym",
    servicesOffered: ["CrossFit", "Yoga Classes", "Spin Classes"],
    address: "321 Spruce Way",
    city: "Montclair",
    description: "High-energy gym with diverse fitness classes.",
    tags: ["fitness", "crossfit", "yoga"],
    dateAdded: new Date("2025-01-08"),
    averageRating: 4.1,
    reviewCount: 30
  },
  {
    name: "Calm Waters Meditation",
    type: "Meditation Center",
    servicesOffered: ["Zen Meditation", "Breathwork", "Retreats"],
    address: "654 Willow St",
    city: "Hoboken",
    description: "Peaceful meditation center for inner calm.",
    tags: ["meditation", "breathwork", "wellness"],
    dateAdded: new Date("2025-01-09"),
    averageRating: 4.4,
    reviewCount: 14
  },
  {
    name: "Balance Holistic Clinic",
    type: "Holistic Center",
    servicesOffered: ["Chiropractic", "Naturopathy", "Massage"],
    address: "987 Laurel Ave",
    city: "Jersey City",
    description: "Comprehensive holistic care for mind and body.",
    tags: ["holistic", "chiropractic", "wellness"],
    dateAdded: new Date("2025-01-10"),
    averageRating: 4.5,
    reviewCount: 16
  },
  {
    name: "Zen Yoga Haven",
    type: "Yoga Studio",
    servicesOffered: ["Kundalini Yoga", "Prenatal Yoga", "Meditation"],
    address: "147 Magnolia Rd",
    city: "Newark",
    description: "Inclusive yoga studio for all ages and abilities.",
    tags: ["yoga", "meditation", "inclusivity"],
    dateAdded: new Date("2025-01-11"),
    averageRating: 4.7,
    reviewCount: 19
  },
  {
    name: "Tranquil Touch Spa",
    type: "Spa",
    servicesOffered: ["Swedish Massage", "Reflexology", "Hydrotherapy"],
    address: "258 Chestnut St",
    city: "Montclair",
    description: "Spa offering personalized relaxation therapies.",
    tags: ["spa", "massage", "reflexology"],
    dateAdded: new Date("2025-01-12"),
    averageRating: 4.8,
    reviewCount: 13
  },
  {
    name: "PowerFit Gym",
    type: "Gym",
    servicesOffered: ["Strength Training", "Boxing", "HIIT"],
    address: "369 Sycamore Ln",
    city: "Hoboken",
    description: "Dynamic gym for high-intensity workouts.",
    tags: ["fitness", "boxing", "hiit"],
    dateAdded: new Date("2025-01-13"),
    averageRating: 4.0,
    reviewCount: 28
  },
  {
    name: "Inner Peace Meditation",
    type: "Meditation Center",
    servicesOffered: ["Mindfulness Meditation", "Group Sessions"],
    address: "741 Ash St",
    city: "Jersey City",
    description: "Community-focused meditation center.",
    tags: ["meditation", "mindfulness", "community"],
    dateAdded: new Date("2025-01-14"),
    averageRating: 4.6,
    reviewCount: 11
  },
  {
    name: "Wellness Grove",
    type: "Holistic Center",
    servicesOffered: ["Ayurveda", "Energy Healing", "Nutrition Counseling"],
    address: "852 Poplar Dr",
    city: "Newark",
    description: "Holistic center promoting natural healing.",
    tags: ["holistic", "ayurveda", "healing"],
    dateAdded: new Date("2025-01-15"),
    averageRating: 4.3,
    reviewCount: 17
  },
  {
    name: "Radiant Yoga Studio",
    type: "Yoga Studio",
    servicesOffered: ["Bikram Yoga", "Flow Yoga", "Workshops"],
    address: "963 Linden Ave",
    city: "Montclair",
    description: "Vibrant yoga studio with expert instructors.",
    tags: ["yoga", "bikram", "wellness"],
    dateAdded: new Date("2025-01-16"),
    averageRating: 4.5,
    reviewCount: 21
  },
  {
    name: "Oasis Spa",
    type: "Spa",
    servicesOffered: ["Deep Tissue Massage", "Facials", "Body Wraps"],
    address: "159 Hazel St",
    city: "Hoboken",
    description: "Elegant spa for rejuvenation and pampering.",
    tags: ["spa", "massage", "facials"],
    dateAdded: new Date("2025-01-17"),
    averageRating: 4.9,
    reviewCount: 9
  },
  {
    name: "Iron Core Gym",
    type: "Gym",
    servicesOffered: ["Powerlifting", "Cardio Classes", "Nutrition Plans"],
    address: "270 Walnut Rd",
    city: "Jersey City",
    description: "Gym for serious athletes and fitness enthusiasts.",
    tags: ["fitness", "powerlifting", "nutrition"],
    dateAdded: new Date("2025-01-18"),
    averageRating: 4.2,
    reviewCount: 24
  },
  {
    name: "Sacred Space Meditation",
    type: "Meditation Center",
    servicesOffered: ["Vipassana Meditation", "Sound Healing"],
    address: "381 Cedar Ln",
    city: "Newark",
    description: "Meditation center for spiritual growth.",
    tags: ["meditation", "sound healing", "spirituality"],
    dateAdded: new Date("2025-01-19"),
    averageRating: 4.7,
    reviewCount: 15
  },
  {
    name: "Healing Path Holistic",
    type: "Holistic Center",
    servicesOffered: ["Homeopathy", "Craniosacral Therapy", "Yoga"],
    address: "492 Elm St",
    city: "Montclair",
    description: "Holistic center for integrated wellness.",
    tags: ["holistic", "homeopathy", "yoga"],
    dateAdded: new Date("2025-01-20"),
    averageRating: 4.4,
    reviewCount: 20
  }
];
// Asynchronous function to seed the MongoDB database with initial data.
async function seedDatabase() {
  // Variable to hold the database connection object.
  let db;
  try {
    console.log('Connecting to MongoDB...');
    // Establish a connection to the MongoDB database using the imported function.
    db = await dbConnection();

    console.log('Clearing existing places collection...');
    // Delete all existing documents in the 'places' collection to ensure a clean slate.
    await db.collection('places').deleteMany({});

    console.log('Inserting 20 places...');
    // Insert the array of 'seedData' into the 'places' collection.
    const result = await db.collection('places').insertMany(seedData);
    // Log the number of documents successfully inserted.
    console.log(`Successfully inserted ${result.insertedCount} places.`);
  } catch (e) {
    // Log any errors that occur during the database seeding process.
    console.error('Error seeding database:', e);
  } finally {
    console.log('Closing database connection...');
    // Close the MongoDB database connection using the imported function, regardless of whether an error occurred.
    await closeConnection();
  }
}
// Call the asynchronous function to start the database seeding process.
seedDatabase();