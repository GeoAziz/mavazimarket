
import * as admin from 'firebase-admin';
import { mockCategories, mockProducts, mockUser, mockOrders, mockReviews } from '../src/lib/mock-data'; // Adjust path as needed

// IMPORTANT: Download your service account key JSON file from Firebase console
// and save it as 'mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json' in the project root.
// Ensure this file is NOT committed to your repository if it's public.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function populateCategories() {
  console.log('Populating categories...');
  const categoriesCollection = db.collection('categories');
  for (const category of mockCategories) {
    const categoryData = {
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        dataAiHint: category.dataAiHint || null,
        subcategories: category.subcategories.map(sub => ({...sub}))
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
    const { reviews, ...productData } = product;
    await productsCollection.doc(product.id).set(productData);
    console.log(`Added product: ${product.name}`);

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

  const adminEmail = "admin@mixostore.com";
  const adminPassword = "Mixo123!"; // Ensure this is the desired password

  try {
    let adminAuthUser = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
    if (!adminAuthUser) {
        console.log(`Admin user ${adminEmail} not found in Firebase Auth. CREATING...`);
        adminAuthUser = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword, // Password set here
            displayName: "Admin Mavazi",
            emailVerified: true,
        });
        console.log(`Successfully CREATED admin auth user: ${adminAuthUser.uid} - ${adminEmail}`);
    } else {
        console.log(`Admin auth user ${adminEmail} ALREADY EXISTS in Firebase Auth: ${adminAuthUser.uid}. UPDATING password...`);
        // Explicitly update password if user exists to ensure it's correct
        await admin.auth().updateUser(adminAuthUser.uid, { password: adminPassword });
        console.log(`Successfully UPDATED password for existing admin user ${adminEmail}.`);
    }

    // Set or ensure custom claim for admin role
    if (adminAuthUser) {
        const currentClaims = (await admin.auth().getUser(adminAuthUser.uid)).customClaims;
        if (!currentClaims || !currentClaims.admin) {
            await admin.auth().setCustomUserClaims(adminAuthUser.uid, { admin: true });
            console.log(`Successfully SET admin custom claim for ${adminEmail}.`);
        } else {
            console.log(`Admin custom claim ALREADY SET for ${adminEmail}.`);
        }

        const adminProfileData = {
          name: "Admin Mavazi",
          email: adminEmail,
          role: "admin", // This is for Firestore profile, custom claim is for Auth rules
        };
        await usersCollection.doc(adminAuthUser.uid).set(adminProfileData, { merge: true });
        console.log(`Stored/updated admin profile for ${adminEmail} in Firestore.`);
    }

  } catch (error) {
    console.error(`Error processing admin user ${adminEmail}:`, error);
  }


  // Mock standard user
  const standardUserEmail = mockUser.email;
  const standardUserPassword = "password123"; // Mock password

  try {
    let standardAuthUser = await admin.auth().getUserByEmail(standardUserEmail).catch(() => null);
    if (!standardAuthUser) {
        console.log(`Standard user ${standardUserEmail} not found in Firebase Auth. CREATING...`);
        standardAuthUser = await admin.auth().createUser({
            email: standardUserEmail,
            password: standardUserPassword,
            displayName: mockUser.name,
            emailVerified: true,
        });
        console.log(`Successfully CREATED standard auth user: ${standardAuthUser.uid} - ${standardUserEmail}`);
    } else {
        console.log(`Standard auth user ${standardUserEmail} ALREADY EXISTS in Firebase Auth: ${standardAuthUser.uid}`);
        // Optionally update password if needed, but generally not for mock standard users unless testing reset
        // await admin.auth().updateUser(standardAuthUser.uid, { password: standardUserPassword });
        // console.log(`Updated password for existing standard user ${standardUserEmail}`);
    }

    if (standardAuthUser) {
        const { id, orderHistory, wishlist, ...userProfileData } = mockUser;
        await usersCollection.doc(standardAuthUser.uid).set({
            ...userProfileData,
            wishlist: wishlist?.map(p => p.id) || [],
            email: standardUserEmail, // Ensure email is consistent
            name: mockUser.name,
        }, { merge: true });
        console.log(`Stored/updated profile for ${mockUser.name} (${standardUserEmail}) in Firestore.`);
    }

  } catch (error) {
    console.error(`Error processing standard user ${standardUserEmail}:`, error);
  }

  console.log('Users population process finished.');
}


async function populateOrders() {
    console.log('Populating orders...');
    const ordersCollection = db.collection('orders');

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
            userId: mockUserAuth.uid,
            orderDate: admin.firestore.Timestamp.fromDate(new Date(order.orderDate)),
            items: order.items.map(item => ({...item}))
        };
        await ordersCollection.doc(order.id).set(orderData);
        console.log(`Added order: ${order.id} for user ${mockUser.email}`);
    }
    console.log('Orders populated.');
}


async function main() {
  try {
    await populateCategories();
    await populateProducts();
    await populateUsers();
    await populateOrders();

    console.log('Firestore database populated successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

main();
