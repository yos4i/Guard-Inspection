import { protectedProcedure } from "../../../create-context";
import { guardsCollection } from "@/backend/firestore-admin";

export default protectedProcedure.query(async () => {
  const snapshot = await guardsCollection.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
