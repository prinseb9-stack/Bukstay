const {onSchedule} = require("firebase-functions/v2/scheduler");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore, Timestamp} = require("firebase-admin/firestore");

initializeApp();
const db = getFirestore();

exports.aggregateAdminStats = onSchedule("every day 00:10", async (event) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [usersSnap, propsSnap, bookingsSnap] = await Promise.all([
      db.collection("users").count().get(),
      db.collection("properties").where("status", "==", "active").count().get(),
      db.collection("bookings").count().get(),
    ]);

    const mtdQuery = await db.collection("bookings")
       .where("status", "==", "completed")
       .where("checkOut", ">=", startOfMonth.toISOString().split("T")[0])
       .where("checkOut", "<=", now.toISOString().split("T")[0])
       .get();

    const revenueMTD = mtdQuery.docs.reduce((sum, doc) =>
      sum + (doc.data().totalPrice || 0), 0);

    const lastMonthQuery = await db.collection("bookings")
       .where("status", "==", "completed")
       .where("checkOut", ">=", startOfLastMonth.toISOString().split("T")[0])
       .where("checkOut", "<=", endOfLastMonth.toISOString().split("T")[0])
       .get();

    const revenueLastMonth = lastMonthQuery.docs.reduce((sum, doc) =>
      sum + (doc.data().totalPrice || 0), 0);
    const revenueChange = revenueLastMonth > 0?
      ((revenueMTD - revenueLastMonth) / revenueLastMonth * 100).toFixed(1) :
      0;

    const recentBookings = await db.collection("bookings")
       .orderBy("createdAt", "desc")
       .limit(10)
       .get();

    const recentActivity = recentBookings.docs.map((doc) => {
      const b = doc.data();
      return {
        type: "booking",
        action: "Booking confirmed",
        name: `${b.propertyName} - ${b.guestName}`,
        amount: b.totalPrice,
        currency: b.currency || "USD",
        createdAt: doc.createTime,
      };
    });

    await db.collection("adminStats").doc("current").set({
      totalUsers: usersSnap.data().count,
      activeProperties: propsSnap.data().count,
      totalBookings: bookingsSnap.data().count,
      revenueMTD,
      revenueChange: parseFloat(revenueChange),
      recentActivity,
      updatedAt: Timestamp.now(),
    });

    console.log("Admin stats updated");
    return null;
  } catch (err) {
    console.error("Stats aggregation failed:", err);
    return null;
  }
});