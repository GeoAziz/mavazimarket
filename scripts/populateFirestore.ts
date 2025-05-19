
import * as admin from 'firebase-admin';
import { mockCategories, mockProducts, mockUser, mockOrders, mockReviews } from '../src/lib/mock-data'; 
import type { Category, Product as AppProduct, User as AppUser, Order as AppOrder, Review as AppReview } from '../src/lib/types'; 

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
    const { id, ...categoryData } = category; 
    const processedSubcategories = category.subcategories.map(sub => ({
        id: sub.id || sub.slug, 
        name: sub.name,
        slug: sub.slug,
        priceRange: sub.priceRange
    }));

    const finalCategoryData = {
        ...categoryData,
        subcategories: processedSubcategories,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await categoriesCollection.doc(category.slug).set(finalCategoryData); 
    console.log(`Added category: ${category.name} (ID: ${category.slug})`);
  }
  console.log('Categories populated.');
}

async function populateProducts() {
  console.log('Populating products...');
  const productsCollection = db.collection('products');
  for (const product of mockProducts) {
    const { reviews, id, ...productData } = product as any; 
    const finalProductData: Omit<AppProduct, 'id' | 'reviews'> & { createdAt: any, updatedAt: any} = {
        ...(productData as Omit<AppProduct, 'id' | 'reviews'>),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const productDocRef = await productsCollection.add(finalProductData); 
    console.log(`Added product: ${product.name} (ID: ${productDocRef.id})`);

    if (reviews && reviews.length > 0) {
      const reviewsSubcollection = productDocRef.collection('reviews');
      for (const review of reviews as AppReview[]) {
        const {id: reviewId, ...reviewData} = review;
        await reviewsSubcollection.add({
            ...reviewData,
            productId: productDocRef.id, 
            date: reviewData.date ? admin.firestore.Timestamp.fromDate(new Date(reviewData.date as string)) : admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
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
  const adminPassword = "Mixo123!"; 

  try {
    let adminAuthUser = await admin.auth().getUserByEmail(adminEmail).catch(() => null);
    if (!adminAuthUser) {
        console.log(`Admin user ${adminEmail} not found in Firebase Auth. CREATING...`);
        adminAuthUser = await admin.auth().createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: "Admin Mavazi",
            emailVerified: true,
        });
        console.log(`Successfully CREATED admin auth user: ${adminAuthUser.uid} - ${adminEmail}`);
    } else {
        console.log(`Admin auth user ${adminEmail} ALREADY EXISTS in Firebase Auth: ${adminAuthUser.uid}. UPDATING password...`);
        await admin.auth().updateUser(adminAuthUser.uid, { password: adminPassword });
        console.log(`Successfully UPDATED password for existing admin user ${adminEmail}.`);
    }

    if (adminAuthUser) {
        const currentClaims = (await admin.auth().getUser(adminAuthUser.uid)).customClaims;
        if (!currentClaims || !currentClaims.admin) {
            await admin.auth().setCustomUserClaims(adminAuthUser.uid, { admin: true, role: 'admin' });
            console.log(`Successfully SET admin custom claim for ${adminEmail}.`);
        } else {
            console.log(`Admin custom claim ALREADY SET for ${adminEmail}.`);
        }

        const adminProfileData: Partial<AppUser> = {
          name: "Admin Mavazi",
          email: adminEmail,
          role: "admin",
          disabled: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await usersCollection.doc(adminAuthUser.uid).set(adminProfileData, { merge: true });
        console.log(`Stored/updated admin profile for ${adminEmail} in Firestore.`);
    }

  } catch (error) {
    console.error(`Error processing admin user ${adminEmail}:`, error);
  }

  const standardUserEmail = mockUser.email;
  const standardUserPassword = "password123"; 

  try {
    let standardAuthUser = await admin.auth().getUserByEmail(standardUserEmail).catch(() => null);
    if (!standardAuthUser) {
        console.log(`Standard user ${standardUserEmail} not found in Firebase Auth. CREATING...`);
        standardAuthUser = await admin.auth().createUser({
            email: standardUserEmail,
            password: standardUserPassword,
            displayName: mockUser.name,
            emailVerified: true, // Mocking as verified for testing ease
        });
        console.log(`Successfully CREATED standard auth user: ${standardAuthUser.uid} - ${standardUserEmail}`);
    } else {
        console.log(`Standard auth user ${standardUserEmail} ALREADY EXISTS in Firebase Auth: ${standardAuthUser.uid}. Ensuring password matches...`);
        await admin.auth().updateUser(standardAuthUser.uid, { password: standardUserPassword });
         console.log(`Password updated for standard user ${standardUserEmail}.`);
    }

    if (standardAuthUser) {
        const { id, orderHistory, wishlist, ...userProfileData } = mockUser;
        const finalUserProfile: Omit<AppUser, 'id' | 'orderHistory'> & { createdAt: any, updatedAt: any } = {
            ...(userProfileData as Omit<AppUser, 'id' | 'orderHistory' | 'wishlist'>),
            email: standardUserEmail, 
            name: mockUser.name,
            role: 'user',
            disabled: false,
            wishlist: (wishlist as AppProduct[])?.map(p => p.id) || [], 
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await usersCollection.doc(standardAuthUser.uid).set(finalUserProfile, { merge: true });
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
        const { id, ...orderData } = order; 
        const finalOrderData: Omit<AppOrder, 'id'> & {updatedAt: any} = {
            ...(orderData as Omit<AppOrder, 'id'>),
            userId: mockUserAuth.uid,
            orderDate: admin.firestore.Timestamp.fromDate(new Date(order.orderDate as string)),
            items: order.items.map(item => ({...item})), 
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await ordersCollection.add(finalOrderData); 
        console.log(`Added order for user ${mockUser.email}`);
    }
    console.log('Orders populated.');
}

async function populateInitialSettings() {
    console.log('Populating initial site settings...');
    const settingsCollection = db.collection('settings');
    const generalSettingsDocRef = settingsCollection.doc('general');

    const defaultSettings = {
        siteName: "Mavazi Market",
        siteTagline: "Your one-stop shop for the latest fashion trends in Kenya.",
        siteDescription: "Mavazi Market offers a wide range of clothing and accessories for men, women, and kids in Kenya. Discover new arrivals and best sellers.",
        publicEmail: "support@mavazimarket.co.ke",
        publicPhone: "+254 700 123 456",
        storeAddress: "123 Mavazi Towers, Biashara Street, Nairobi, Kenya",
        themeAppearance: {
            primaryColor: "#DC143C", // Deep Crimson
            accentColor: "#FF7F50",  // Coral
            backgroundColor: "#FAF9F6", // Off-white
            textColor: "#333333", // Dark Gray
            showHeroBanner: true,
            showFeaturedProducts: true,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await generalSettingsDocRef.set(defaultSettings, { merge: true }); 
    console.log('Initial site settings populated/updated.');
}


async function main() {
  try {
    await populateCategories();
    await populateProducts();
    await populateUsers(); 
    await populateOrders();
    await populateInitialSettings(); 

    console.log('Firestore database populated successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

main();
