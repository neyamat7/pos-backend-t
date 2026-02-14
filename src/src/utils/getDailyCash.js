import { DailyCash } from "../features/cash-management/cash-management.model.js";

export async function getOrCreateDailyCash(dateInput, session = null) {
  // Normalize date to start of day (midnight)
  const businessDate = new Date(dateInput);
  businessDate.setHours(0, 0, 0, 0);

  // 1️⃣ Find the most recent daily cash (last day)
  const lastDay = await DailyCash.findOne().sort({ businessDate: -1 }).session(session);

  // 2️⃣ Find today's daily cash
  let todayCash = await DailyCash.findOne({ businessDate }).session(session);

  if (todayCash) {
    // ✅ Auto-close previous day if today is a new date
    if (lastDay && lastDay.businessDate < businessDate && !lastDay.isClosed) {
      lastDay.isClosed = true;
      await lastDay.save({ session });
    }
    return todayCash;
  }

  // 3️⃣ Today's daily cash does NOT exist → create it
  const openingCash = lastDay ? lastDay.closingCash : 0;

  const newDay = await DailyCash.create(
    [
      {
        businessDate,
        openingCash,
        cashIn: 0,
        cashOut: 0,
        closingCash: openingCash,
        isClosed: false,
      },
    ],
    { session }
  );

  return newDay[0];
}
