
import * as admin from 'firebase-admin';
import { mockCategories, mockProducts, mockUser, mockOrders, mockReviews } from '../src/lib/mock-data'; // Adjust path as needed

// IMPORTANT: Download your service account key JSON file from Firebase console
// and save it (e.g., as 'serviceAccountKey.json' in the root or scripts folder).
// Ensure this file is NOT committed to your repository if it's public.
// You might need to adjust the path to your service account key.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json'); // REPLACE WITH YOUR ACTUAL PATH

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://<YOUR_PROJECT_ID>.firebaseio.com" // Not needed for Firestore only
});

const db = admin.firestore();

async function populateCategories() {
  console.log('Populating categories...');
  const categoriesCollection = db.collection('categories');
  for (const category of mockCategories) {
    // Firestore doesn't store functions or complex objects well in arrays directly sometimes
    // For subcategories, we'll store them as they are.
    const categoryData = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        dataAiHint: category.dataAiHint || null,
        subcategories: category.subcategories.map(sub => ({...sub})) // Ensure plain objects
    };
    await categoriesCollection.doc(category.id).set(categoryData);
    console.log(`Added category: ${category.name}`);
  }
  console.log('Categories populated.');
}

async function populateProducts() {
  console.log('Populating products...');
  const productsCollection = db.collection('products');
  for (const product of mockProducts) {
    const { reviews, ...productData } = product; // Exclude reviews from main product doc for now
    await productsCollection.doc(product.id).set(productData);
    console.log(`Added product: ${product.name}`);

    // If product has reviews, add them to a subcollection
    if (reviews && reviews.length > 0) {
      const reviewsSubcollection = productsCollection.doc(product.id).collection('reviews');
      for (const review of reviews) {
        await reviewsSubcollection.doc(review.id).set(review);
        console.log(`Added review by ${review.userName} for product ${product.name}`);
      }
    }
  }
  console.log('Products populated.');
}

async function populateUsers() {
  console.log('Populating users...');
  const usersCollection = db.collection('users');

  // Admin user (ensure this matches the email used for admin checks)
  const adminEmail = "admin@mixostore.com";
  const adminPassword = "Mixo123!"; // Only for local testing/setup reference; actual auth handled by Firebase Auth

  try {
    let adminAuthUser = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
    if (!adminAuthUser) {
        adminAuthUser = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: "Admin Mavazi",
            emailVerified: true, // For simplicity
        });
        console.log(`Created admin auth user: ${adminAuthUser.uid} - ${adminEmail}`);
        // IMPORTANT: Set custom claim for admin role
        // This needs to be done for the Firestore rules to work correctly for admin access.
        await admin.auth().setCustomUserClaims(adminAuthUser.uid, { admin: true });
        console.log(`Set admin custom claim for ${adminEmail}`);

    } else {
        console.log(`Admin auth user ${adminEmail} already exists: ${adminAuthUser.uid}`);
        // Ensure admin claim is set if user exists but claim might be missing
        if (!adminAuthUser.customClaims?.admin) {
            await admin.auth().setCustomUserClaims(adminAuthUser.uid, { admin: true });
            console.log(`Ensured admin custom claim for ${adminEmail}`);
        }
    }
    
    const adminProfileData = {
      name: "Admin Mavazi",
      email: adminEmail,
      role: "admin", // You can add a role field
      // Add other relevant fields from your User type if needed
      // For mockUser, we'll create a separate standard user
    };
    await usersCollection.doc(adminAuthUser.uid).set(adminProfileData, { merge: true });
    console.log(`Stored admin profile for ${adminEmail} in Firestore.`);

  } catch (error) {
    console.error(`Error creating/updating admin user ${adminEmail}:`, error);
  }


  // Mock standard user
  try {
    let standardAuthUser = await admin.auth().getUserByEmail(mockUser.email).catch(() => null);
    if (!standardAuthUser) {
        standardAuthUser = await admin.auth().createUser({
            email: mockUser.email,
            password: "password123", // Mock password, user would set their own
            displayName: mockUser.name,
            emailVerified: true,
        });
        console.log(`Created standard auth user: ${standardAuthUser.uid} - ${mockUser.email}`);
    } else {
        console.log(`Standard auth user ${mockUser.email} already exists: ${standardAuthUser.uid}`);
    }
    
    const { id, orderHistory, wishlist, ...userProfileData } = mockUser; // Exclude complex objects for now
    await usersCollection.doc(standardAuthUser.uid).set({
        ...userProfileData,
        wishlist: wishlist?.map(p => p.id) || [], // Store array of product IDs for wishlist
    }, { merge: true }); // Use merge to avoid overwriting if doc exists partially
    console.log(`Stored profile for ${mockUser.name} in Firestore.`);

  } catch (error) {
    console.error(`Error creating/updating standard user ${mockUser.email}:`, error);
  }

  console.log('Users populated/updated.');
}


async function populateOrders() {
    console.log('Populating orders...');
    const ordersCollection = db.collection('orders');
    
    // Find the UID for mockUser to associate orders
    let mockUserAuth;
    try {
        mockUserAuth = await admin.auth().getUserByEmail(mockUser.email);
    } catch (e) {
        console.error(`Could not find auth user for ${mockUser.email} to populate orders. Ensure user exists in Firebase Auth.`);
        return;
    }

    if (!mockUserAuth) {
        console.error(`Auth user for ${mockUser.email} not found. Skipping order population for this user.`);
        return;
    }

    for (const order of mockOrders) {
        const orderData = {
            ...order,
            userId: mockUserAuth.uid, // Associate order with user UID
            orderDate: admin.firestore.Timestamp.fromDate(new Date(order.orderDate)), // Convert to Firestore Timestamp
            items: order.items.map(item => ({...item})) // Ensure plain objects
        };
        await ordersCollection.doc(order.id).set(orderData);
        console.log(`Added order: ${order.id} for user ${mockUser.email}`);
    }
    console.log('Orders populated.');
}


async function main() {
  try {
    await populateCategories();
    await populateProducts(); // Populates products and their reviews
    await populateUsers();    // Creates auth users and Firestore profiles
    await populateOrders();   // Populates orders for the mock user

    console.log('Firestore database populated successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

main();
