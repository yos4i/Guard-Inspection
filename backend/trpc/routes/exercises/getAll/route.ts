import { protectedProcedure } from "../../../create-context";
import { exercisesCollection } from "@/backend/firestore-admin";

export default protectedProcedure.query(async () => {
  const snapshot = await exercisesCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
