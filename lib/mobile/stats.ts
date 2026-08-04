import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import MobileActionLog, { type MobileActionType } from "@/models/MobileActionLog";

export interface DashboardStats {
  totalRegistered: number;
  checkedIn: number;
  idCardIssued: number;
  kitDistributed: number;
  certificatesDistributed: number;
  // Keyed by conference day (1, 2, 3, ...) since meals repeat once per day.
  breakfast: Record<number, number>;
  lunch: Record<number, number>;
  dinner: Record<number, number>;
}

interface ActionCountGroup {
  _id: { actionType: MobileActionType; day: number };
  count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();
  const [totalRegistered, groups] = await Promise.all([
    Registration.countDocuments({}),
    MobileActionLog.aggregate<ActionCountGroup>([
      { $group: { _id: { actionType: "$actionType", day: "$day" }, count: { $sum: 1 } } },
    ]),
  ]);

  const stats: DashboardStats = {
    totalRegistered,
    checkedIn: 0,
    idCardIssued: 0,
    kitDistributed: 0,
    certificatesDistributed: 0,
    breakfast: {},
    lunch: {},
    dinner: {},
  };

  for (const group of groups) {
    const { actionType, day } = group._id;
    switch (actionType) {
      case "check_in":
        stats.checkedIn = group.count;
        break;
      case "id_card":
        stats.idCardIssued = group.count;
        break;
      case "kit":
        stats.kitDistributed = group.count;
        break;
      case "certificate":
        stats.certificatesDistributed = group.count;
        break;
      case "breakfast":
        stats.breakfast[day] = group.count;
        break;
      case "lunch":
        stats.lunch[day] = group.count;
        break;
      case "dinner":
        stats.dinner[day] = group.count;
        break;
    }
  }

  return stats;
}
